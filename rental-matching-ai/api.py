"""
FastAPI layer exposing the existing matching, credit scoring, and notification
functions. The ML logic lives in src/*.py and remains untouched.

Run locally:
    uvicorn api:app --reload

Environment:
    - .env can provide EMAIL_SENDER and EMAIL_PASSWORD for notifications
"""

import json
from typing import Any, Dict, List, Optional, Tuple
from functools import lru_cache
from pathlib import Path

import pandas as pd
import numpy as np
import joblib
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score
from sklearn.model_selection import train_test_split

from config import TOP_N_MATCHES, READABLE_DATA_PATH, PRICE_MODEL_PATH, PRICE_MODEL_METRICS_PATH
from src.matching_engine import find_top_matches
from src.credit_scorer import evaluate_candidate
from src.notifier import send_match_email
from ultralytics import YOLO
import io
from PIL import Image

# Load .env so notifier picks up credentials when present
load_dotenv()

app = FastAPI(
    title="Rental Matching API",
    version="1.0.0",
    description="Endpoints for property matching, credit scoring, and email notification.",
)

# Load YOLOv8 model once at startup
MODEL_PATH = Path(__file__).parent / "yolov8n.pt"
model = YOLO(str(MODEL_PATH))

# Per-user email notifications settings (persisted to disk)
EMAIL_SETTINGS_PATH = Path(__file__).parent / "data" / "email_settings.json"
_EMAIL_PREFS_BY_EMAIL: Dict[str, bool] = {}


@app.on_event("startup")
def _load_email_settings():
    global _EMAIL_PREFS_BY_EMAIL
    try:
        if EMAIL_SETTINGS_PATH.exists():
            payload = joblib.load(EMAIL_SETTINGS_PATH)  # small dict; joblib ok cross-platform
            prefs = payload.get("enabledByEmail") if isinstance(payload, dict) else None
            if isinstance(prefs, dict):
                _EMAIL_PREFS_BY_EMAIL = {str(k).lower(): bool(v) for k, v in prefs.items()}
    except Exception:
        # Fail-open: do not prevent API startup if settings file is corrupted
        _EMAIL_PREFS_BY_EMAIL = {}


def _save_email_settings():
    EMAIL_SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"enabledByEmail": _EMAIL_PREFS_BY_EMAIL}, EMAIL_SETTINGS_PATH)


def _email_enabled(email: str) -> bool:
    # Default: enabled (opt-out)
    return bool(_EMAIL_PREFS_BY_EMAIL.get(str(email).lower(), True))


# Feature mapping: detected object -> inferred room
FEATURE_ROOM_MAP = {
    "bed": "bedroom",
    "couch": "living_room",
    "tv": "living_room",
    "microwave": "kitchen",
    "oven": "kitchen",
    "sink": "kitchen",
    "toilet": "bathroom",
    "refrigerator": "kitchen",
    "dining table": "dining_room",
}

# CORS: allow local frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models -------------------------------------------------------------

class CandidateProfile(BaseModel):
    name: Optional[str] = None
    budget_max: Optional[float] = Field(None, ge=0, description="Maximum monthly rent in TND")
    city: Optional[str] = Field(None, description="Preferred city")
    min_rooms: Optional[int] = Field(None, ge=0, description="Minimum number of rooms")
    preferred_categories: Optional[List[str]] = Field(
        default=None, description="List of acceptable property categories"
    )
    min_size: Optional[float] = Field(None, ge=0, description="Minimum size in square meters")


class MatchRequest(CandidateProfile):
    top_n: Optional[int] = Field(
        default=None,
        ge=1,
        le=50,
        description="Override the number of matches to return (defaults to config.TOP_N_MATCHES)",
    )


class DocumentBundle(BaseModel):
    national_id: bool = False
    payslips_3months: bool = False
    bank_statement: bool = False
    employment_contract: bool = False
    tax_notice: bool = False


class CreditRequest(BaseModel):
    name: Optional[str] = None
    monthly_income: float = Field(..., ge=0)
    rent_asked: float = Field(..., ge=0)
    total_monthly_debts: float = Field(0, ge=0)
    employment_type: str = Field(..., description="CDI | CDD | freelance | retired | unemployed")
    months_employed: int = Field(0, ge=0)
    has_guarantor: bool = False
    documents: DocumentBundle = DocumentBundle()


class NotifyRequest(CandidateProfile):
    email: EmailStr


# Email notifications toggle ---------------------------------------------------

class EmailNotificationsSettings(BaseModel):
    email: EmailStr
    enabled: bool = Field(..., description="Enable/disable outgoing match emails for this email")


# Price estimation models ------------------------------------------------------

class PriceEstimateRequest(BaseModel):
    category: str = Field(..., description="Property category (same labels as dataset)")
    room_count: int = Field(..., ge=0)
    bathroom_count: int = Field(..., ge=0)
    size: float = Field(..., gt=0, description="Size in square meters")
    city: str = Field(...)
    region: str = Field(...)


class PriceEstimateResponse(BaseModel):
    estimated_price_tnd: float
    confidence_pct: float = Field(..., ge=0, le=100, description="Confidence from local comparable listings and model support")
    accuracy_pct: float = Field(..., ge=0, le=100, description="Model accuracy proxy from holdout validation")
    model_price_tnd: Optional[float] = None
    comparable_price_tnd: Optional[float] = None
    comparable_count: int = 0
    source: str = "hybrid"
    metrics: Dict[str, float] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    comparables: List[Dict[str, Any]] = Field(default_factory=list)
    model_version: str = "price_predictor.pkl"


# Helpers --------------------------------------------------------------------

def _to_dict(model: BaseModel, **kwargs):
    """Compatibility wrapper for Pydantic v1/v2 to get a plain dict."""
    if hasattr(model, "model_dump"):
        return model.model_dump(**kwargs)
    return model.dict(**kwargs)  # type: ignore[return-value]


_PRICE_FEATURES = [
    "category",
    "room_count",
    "bathroom_count",
    "size",
    "city",
    "region",
    "rooms_per_100sqm",
    "baths_per_room",
]

_SIZE_BINS = [0, 50, 100, 200, float("inf")]
_SIZE_LABELS = ["small", "medium", "large", "extra_large"]


def _normalize_text(value: Optional[Any]) -> str:
    return str(value).strip().lower() if value is not None else ""


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        number = float(value)
    except Exception:
        return default
    return number if np.isfinite(number) else default


@lru_cache(maxsize=1)
def _load_price_artifacts() -> Tuple[Any, Dict[str, Any]]:
    """Load the trained price model and optional validation metadata once."""
    if not Path(PRICE_MODEL_PATH).exists():
        raise FileNotFoundError(
            f"Missing trained price model at {PRICE_MODEL_PATH}. Run `python src/train_models.py` first."
        )

    try:
        model = joblib.load(PRICE_MODEL_PATH)
    except Exception:
        model = None
    metadata: Dict[str, Any] = {}

    if Path(PRICE_MODEL_METRICS_PATH).exists():
        try:
            metadata = json.loads(Path(PRICE_MODEL_METRICS_PATH).read_text(encoding="utf-8"))
        except Exception:
            metadata = {}

    return model, metadata


@lru_cache(maxsize=1)
def _load_price_reference_data() -> pd.DataFrame:
    if not Path(READABLE_DATA_PATH).exists():
        raise FileNotFoundError(f"Data file not found at {READABLE_DATA_PATH}")

    df = pd.read_csv(READABLE_DATA_PATH).fillna(0)
    required = {"category", "room_count", "bathroom_count", "size", "price", "city", "region"}
    missing = required.difference(df.columns)
    if missing:
        raise FileNotFoundError(f"Readable dataset is missing required columns: {sorted(missing)}")

    for col in ["room_count", "bathroom_count", "size", "price"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["category", "room_count", "bathroom_count", "size", "price", "city", "region"]).copy()
    df = df[(df["price"] > 0) & (df["size"] > 0)].copy()
    df["rooms_per_100sqm"] = (df["room_count"] / df["size"].clip(lower=1)) * 100.0
    df["baths_per_room"] = df["bathroom_count"] / df["room_count"].clip(lower=1)
    return df


def _build_price_feature_frame(frame: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame(index=frame.index)
    out["category"] = frame["category"].astype(str)
    out["room_count"] = pd.to_numeric(frame["room_count"], errors="coerce")
    out["bathroom_count"] = pd.to_numeric(frame["bathroom_count"], errors="coerce")
    out["size"] = pd.to_numeric(frame["size"], errors="coerce")
    out["city"] = frame["city"].astype(str)
    out["region"] = frame["region"].astype(str)
    out["rooms_per_100sqm"] = (out["room_count"] / out["size"].clip(lower=1)) * 100.0
    out["baths_per_room"] = out["bathroom_count"] / out["room_count"].clip(lower=1)
    return out


def _build_price_feature_row(req: PriceEstimateRequest) -> pd.DataFrame:
    return _build_price_feature_frame(
        pd.DataFrame(
            [
                {
                    "category": req.category,
                    "room_count": float(req.room_count),
                    "bathroom_count": float(req.bathroom_count),
                    "size": float(req.size),
                    "city": req.city,
                    "region": req.region,
                }
            ]
        )
    )


def _predict_price_with_model(req: PriceEstimateRequest) -> float:
    model, _ = _load_price_artifacts()
    if model is None:
        comparable_data = _estimate_from_comparables(req, _load_price_reference_data())
        fallback_price = comparable_data.get("estimate")
        if fallback_price is not None:
            return float(fallback_price)
        df = _load_price_reference_data()
        same_category = df[df["category"].astype(str).str.lower() == str(req.category).strip().lower()].copy()
        price_per_m2 = float((same_category["price"] / same_category["size"].clip(lower=1)).median()) if not same_category.empty else float((df["price"] / df["size"].clip(lower=1)).median())
        return float(price_per_m2 * float(req.size))
    row = _build_price_feature_row(req)
    try:
        predicted_log_price = float(model.predict(row)[0])
    except Exception:
        comparable_data = _estimate_from_comparables(req, _load_price_reference_data())
        fallback_price = comparable_data.get("estimate")
        if fallback_price is not None:
            return float(fallback_price)
        df = _load_price_reference_data()
        same_category = df[df["category"].astype(str).str.lower() == str(req.category).strip().lower()].copy()
        price_per_m2 = float((same_category["price"] / same_category["size"].clip(lower=1)).median()) if not same_category.empty else float((df["price"] / df["size"].clip(lower=1)).median())
        return float(price_per_m2 * float(req.size))
    return float(np.expm1(predicted_log_price))


def _estimate_from_comparables(req: PriceEstimateRequest, df: pd.DataFrame) -> Dict[str, Any]:
    try:
        working = df.copy()
        category = _normalize_text(req.category)
        city = _normalize_text(req.city)
        region = _normalize_text(req.region)

        working["category_norm"] = working["category"].astype(str).map(_normalize_text)
        working["city_norm"] = working["city"].astype(str).map(_normalize_text)
        working["region_norm"] = working["region"].astype(str).map(_normalize_text)

        pool = working[working["category_norm"] == category].copy()
        if city:
            city_pool = pool[pool["city_norm"] == city]
            if len(city_pool) >= 5:
                pool = city_pool
        if region and len(pool) < 5:
            region_pool = working[(working["category_norm"] == category) & (working["region_norm"] == region)]
            if len(region_pool) >= 5:
                pool = region_pool
        if len(pool) < 5:
            pool = working.copy()

        size_scale = max(20.0, float(working["size"].quantile(0.75) - working["size"].quantile(0.25)))
        room_scale = max(1.0, float(working["room_count"].quantile(0.75) - working["room_count"].quantile(0.25)))
        bath_scale = max(1.0, float(working["bathroom_count"].quantile(0.75) - working["bathroom_count"].quantile(0.25)))

        if pool.empty:
            return {
                "estimate": None,
                "count": 0,
                "confidence_pct": 0.0,
                "source": "model_only",
                "comparables": [],
            }

        scored = pool.copy()
        scored["category_match"] = (scored["category_norm"] == category).astype(float)
        scored["city_match"] = (scored["city_norm"] == city).astype(float) if city else 0.5
        scored["region_match"] = (scored["region_norm"] == region).astype(float) if region else 0.5

        scored["room_distance"] = (scored["room_count"] - float(req.room_count)).abs() / room_scale
        scored["bathroom_distance"] = (scored["bathroom_count"] - float(req.bathroom_count)).abs() / bath_scale
        scored["size_distance"] = (scored["size"] - float(req.size)).abs() / size_scale

        distance = (
            (1.0 - scored["category_match"]) * 0.30
            + (1.0 - scored["city_match"]) * 0.20
            + (1.0 - scored["region_match"]) * 0.10
            + scored["room_distance"].clip(0, 3) * 0.15
            + scored["bathroom_distance"].clip(0, 3) * 0.10
            + scored["size_distance"].clip(0, 3) * 0.15
        )

        scored["similarity"] = np.exp(-(distance * 1.8))
        scored = scored.replace([np.inf, -np.inf], np.nan).dropna(subset=["similarity", "price"])
        top = scored.sort_values("similarity", ascending=False).head(12).copy()

        if top.empty or float(top["similarity"].sum()) <= 0:
            return {
                "estimate": None,
                "count": 0,
                "confidence_pct": 0.0,
                "source": "model_only",
                "comparables": [],
            }

        comparable_estimate = float(np.average(top["price"].astype(float), weights=top["similarity"].astype(float)))
        confidence_pct = float(
            min(
                95.0,
                round((float(top["similarity"].mean()) * 70.0) + (min(len(top), 12) / 12.0) * 25.0, 2),
            )
        )

        comparables = []
        for _, row in top.head(5).iterrows():
            comparables.append(
                {
                    "price_tnd": round(float(row["price"]), 2),
                    "similarity": round(float(row["similarity"]), 4),
                    "category": str(row["category"]),
                    "city": str(row["city"]),
                    "region": str(row["region"]),
                    "room_count": int(round(float(row["room_count"]))),
                    "bathroom_count": int(round(float(row["bathroom_count"]))),
                    "size": round(float(row["size"]), 2),
                }
            )

        source = "comparables" if len(top) >= 8 else "comparables_plus_model"
        return {
            "estimate": comparable_estimate,
            "count": int(len(top)),
            "confidence_pct": confidence_pct,
            "source": source,
            "comparables": comparables,
            "top_similarity": float(top["similarity"].max()),
        }
    except Exception:
        return {
            "estimate": None,
            "count": 0,
            "confidence_pct": 0.0,
            "source": "model_only",
            "comparables": [],
        }


@lru_cache(maxsize=1)
def _price_model_metrics() -> Dict[str, float]:
    """Return cached validation metrics for the trained price model."""
    try:
        _, metadata = _load_price_artifacts()
        if metadata:
            accuracy_pct = _safe_float(metadata.get("cv_accuracy_pct", metadata.get("holdout_accuracy_pct", 0.0)), 0.0)
            return {
                "r2": _safe_float(metadata.get("holdout_r2", 0.0), 0.0),
                "mae_tnd": _safe_float(metadata.get("holdout_mae_tnd", 0.0), 0.0),
                "mape": _safe_float(metadata.get("holdout_mape", 0.0), 0.0),
                "accuracy_pct": accuracy_pct,
            }
    except FileNotFoundError:
        return {"r2": 0.0, "mae_tnd": 0.0, "mape": 0.0, "accuracy_pct": 0.0}

    df = _load_price_reference_data()
    if len(df) < 50:
        return {"r2": 0.0, "mae_tnd": 0.0, "mape": 0.0, "accuracy_pct": 0.0}

    model, _ = _load_price_artifacts()
    X = _build_price_feature_frame(df)
    y = np.log1p(df["price"].astype(float))

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    y_pred_log = model.predict(X_test)
    y_true_tnd = np.expm1(y_test)
    y_pred_tnd = np.expm1(y_pred_log)

    r2 = float(r2_score(y_test, y_pred_log))
    mae_tnd = float(mean_absolute_error(y_true_tnd, y_pred_tnd))
    mape = float(mean_absolute_percentage_error(y_true_tnd, y_pred_tnd))
    accuracy_pct = float(max(0.0, min(100.0, 100.0 - (mape * 100.0))))

    return {"r2": r2, "mae_tnd": mae_tnd, "mape": mape, "accuracy_pct": accuracy_pct}


# ---------------------------------------------------------------------------
# Admin data helpers (lightweight demo data)
# ---------------------------------------------------------------------------

DATA_FILE = Path(__file__).parent / "data" / "processed" / "rentals_readable.csv"


@lru_cache(maxsize=1)
def _load_properties():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Data file not found at {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)
    df = df.fillna(0)
    df = df.rename(columns={"category": "property_type"})
    df["id"] = range(1, len(df) + 1)
    return df


def _filter_properties(city: Optional[str], property_type: Optional[str], min_price: Optional[float], max_price: Optional[float]):
    df = _load_properties().copy()

    if city:
        df = df[df["city"].str.lower() == city.lower()]
    if property_type:
        df = df[df["property_type"].str.lower() == property_type.lower()]
    if min_price is not None:
        df = df[df["price"] >= min_price]
    if max_price is not None:
        df = df[df["price"] <= max_price]

    columns = [
        "id",
        "property_type",
        "room_count",
        "bathroom_count",
        "size",
        "price",
        "city",
        "region",
        "price_per_m2",
    ]

    return df[columns]


SEED_CANDIDATES = [
    {
        "name": "Ahmed Ben Ali",
        "email": "ahmed@example.com",
        "budget_max": 800,
        "city": "Tunis",
        "min_rooms": 2,
        "preferred_categories": ["Appartements", "Maisons et Villas"],
        "min_size": 70,
        "credit_profile": {
            "monthly_income": 2800,
            "rent_asked": 650,
            "total_monthly_debts": 300,
            "employment_type": "CDI",
            "months_employed": 36,
            "has_guarantor": False,
            "documents": {
                "national_id": True,
                "payslips_3months": True,
                "bank_statement": True,
                "employment_contract": True,
                "tax_notice": False,
            },
        },
    },
    {
        "name": "Sarra Mansouri",
        "email": "sarra@example.com",
        "budget_max": 900,
        "city": "Ariana",
        "min_rooms": 3,
        "preferred_categories": ["Appartements"],
        "min_size": 85,
        "credit_profile": {
            "monthly_income": 1800,
            "rent_asked": 700,
            "total_monthly_debts": 450,
            "employment_type": "CDD",
            "months_employed": 8,
            "has_guarantor": True,
            "documents": {
                "national_id": True,
                "payslips_3months": False,
                "bank_statement": True,
                "employment_contract": True,
                "tax_notice": False,
            },
        },
    },
    {
        "name": "Youssef Trabelsi",
        "email": "youssef@example.com",
        "budget_max": 600,
        "city": "Sousse",
        "min_rooms": 2,
        "preferred_categories": ["Appartements", "Locations de vacances"],
        "min_size": 60,
        "credit_profile": {
            "monthly_income": 1400,
            "rent_asked": 550,
            "total_monthly_debts": 150,
            "employment_type": "freelance",
            "months_employed": 18,
            "has_guarantor": False,
            "documents": {
                "national_id": True,
                "payslips_3months": True,
                "bank_statement": True,
                "employment_contract": False,
                "tax_notice": True,
            },
        },
    },
]


# Routes ---------------------------------------------------------------------

@app.post("/api/match")
def match_properties(request: MatchRequest):
    """Return top matching properties for a candidate profile."""
    top_n = request.top_n or TOP_N_MATCHES
    candidate = _to_dict(request, exclude_none=True, exclude={"top_n"})

    try:
        matches = find_top_matches(candidate, n=top_n)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=f"Data file missing: {exc}") from exc
    except Exception as exc:  # pragma: no cover - surface unexpected errors to client
        raise HTTPException(status_code=500, detail=f"Failed to compute matches: {exc}") from exc

    return {"count": len(matches), "matches": matches}


@app.post("/credit")
def credit_score(request: CreditRequest):
    """Evaluate a candidate's credit dossier."""
    dossier = _to_dict(request)

    try:
        result = evaluate_candidate(dossier)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to score dossier: {exc}") from exc

    return result


@app.post("/notify")
def notify_candidate(request: NotifyRequest):
    """Send the match email to the candidate using the notifier module."""
    if not _email_enabled(str(request.email)):
        raise HTTPException(status_code=403, detail="Email notifications are disabled for this user.")

    candidate = _to_dict(request, exclude_none=True)

    try:
        sent = send_match_email(candidate)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {exc}") from exc

    if not sent:
        raise HTTPException(status_code=500, detail="Email not sent. Check credentials or candidate profile.")

    return {"sent": True}


@app.post("/detect/")
async def detect_objects(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        results = model(img)

        detected_objects = set()
        room_votes = {}  # room -> count of supporting features

        for r in results:
            for cls in r.boxes.cls:
                label = model.names[int(cls)]
                detected_objects.add(label)
                if label in FEATURE_ROOM_MAP:
                    room = FEATURE_ROOM_MAP[label]
                    room_votes[room] = room_votes.get(room, 0) + 1

        # Pick the room with the most supporting features
        inferred_room = max(room_votes, key=room_votes.get) if room_votes else None

        return {
            "filename": file.filename,
            "detected_objects": list(detected_objects),
            "inferred_room": inferred_room,   
            "room_votes": room_votes,         # op
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc


@app.post("/api/price-estimate", response_model=PriceEstimateResponse)
def estimate_price(request: PriceEstimateRequest):
    """Estimate fair monthly rental price using the trained model and real comparables."""
    try:
        model_price = _predict_price_with_model(request)
        comparable_data = _estimate_from_comparables(request, _load_price_reference_data())
        metrics = _price_model_metrics()
        accuracy_pct = _safe_float(metrics.get("accuracy_pct", 0.0), 0.0)

        comparable_price = comparable_data.get("estimate")
        comparable_count = int(comparable_data.get("count", 0))
        confidence_pct = _safe_float(comparable_data.get("confidence_pct", 0.0), 0.0)
        source = str(comparable_data.get("source", "hybrid"))
        comparables = comparable_data.get("comparables", []) if isinstance(comparable_data.get("comparables", []), list) else []
        warnings: List[str] = []

        if comparable_price is not None:
            if comparable_count >= 8:
                comparable_weight = 0.8
            elif comparable_count >= 5:
                comparable_weight = 0.7
            elif comparable_count >= 3:
                comparable_weight = 0.6
            else:
                comparable_weight = 0.45

            estimated_price = (comparable_weight * float(comparable_price)) + ((1.0 - comparable_weight) * float(model_price))
        else:
            estimated_price = float(model_price)
            comparable_weight = 0.0
            warnings.append("No close historical comparables were found, so the estimate leans entirely on the trained model.")

        estimated_price = max(0.0, float(estimated_price))

        if comparable_count > 0:
            warnings.append(
                f"Based on {comparable_count} similar listing(s) from your dataset; comparable weight: {int(round(comparable_weight * 100))}%."
            )

        if not np.isfinite(confidence_pct):
            confidence_pct = 0.0

        return PriceEstimateResponse(
            estimated_price_tnd=round(estimated_price, 2),
            confidence_pct=round(confidence_pct, 2),
            accuracy_pct=round(accuracy_pct, 2),
            model_price_tnd=round(float(model_price), 2),
            comparable_price_tnd=round(float(comparable_price), 2) if comparable_price is not None else None,
            comparable_count=comparable_count,
            source=source,
            metrics={k: round(float(v), 6) if isinstance(v, (int, float, np.number)) and np.isfinite(float(v)) else 0.0 for k, v in metrics.items()},
            warnings=warnings,
            comparables=comparables,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        fallback_metrics = _price_model_metrics()
        fallback_price = _predict_price_with_model(request)
        return PriceEstimateResponse(
            estimated_price_tnd=round(max(0.0, float(fallback_price)), 2),
            confidence_pct=0.0,
            accuracy_pct=round(_safe_float(fallback_metrics.get("accuracy_pct", 0.0), 0.0), 2),
            model_price_tnd=round(float(fallback_price), 2),
            comparable_price_tnd=None,
            comparable_count=0,
            source="model_only",
            metrics={k: round(float(v), 6) if isinstance(v, (int, float, np.number)) and np.isfinite(float(v)) else 0.0 for k, v in fallback_metrics.items()},
            warnings=[f"Comparable-based estimate unavailable; fell back to a dataset-based estimate ({exc})."],
            comparables=[],
        )


@app.get("/api/price-estimate/options")
def price_estimate_options():
    """
    Return dataset-backed categorical values to populate the price estimate UI.
    """
    try:
        df = _load_price_reference_data()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to load price reference data: {exc}") from exc

    def _sorted_unique(col: str) -> List[str]:
        return sorted({str(x) for x in df[col].dropna().astype(str).tolist() if str(x).strip()})

    return {
        "category": _sorted_unique("category"),
        "city": _sorted_unique("city"),
        "region": _sorted_unique("region"),
        "sizeBins": _SIZE_BINS[:-1],
        "sizeLabels": _SIZE_LABELS,
    }


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Admin endpoints for backoffice dashboard
# ---------------------------------------------------------------------------


@app.get("/admin/properties")
def list_properties(
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 300,
):
    """Return filtered rental listings from the processed dataset."""
    try:
        df = _filter_properties(city, property_type, min_price, max_price)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to load properties: {exc}") from exc

    limit = max(1, min(limit, 1000))
    records = df.head(limit).to_dict(orient="records")
    return {"count": len(records), "properties": records}


@app.get("/admin/candidates")
def list_candidates():
    """Return seed candidates with credit score and top match."""
    candidates = []
    for idx, candidate in enumerate(SEED_CANDIDATES, start=1):
        matches = find_top_matches(candidate, n=3)
        credit = evaluate_candidate({
            **candidate["credit_profile"],
            "name": candidate["name"],
        })

        candidates.append({
            "id": idx,
            "name": candidate["name"],
            "email": candidate["email"],
            "city": candidate.get("city"),
            "credit_score": credit.get("score"),
            "recommendation": credit.get("recommendation"),
            "debt_ratio": credit.get("debt_ratio"),
            "explanation": credit.get("explanation"),
            "top_match": matches[0] if matches else None,
            "top_matches": matches,
        })

    return {"count": len(candidates), "candidates": candidates}


@app.post("/admin/notifications/trigger")
def trigger_notifications():
    """Send daily email with top matches to all seed candidates."""
    results = []

    for candidate in SEED_CANDIDATES:
        if not _email_enabled(str(candidate.get("email", ""))):
            results.append(
                {"email": candidate.get("email"), "name": candidate.get("name"), "sent": False, "skipped": True}
            )
            continue
        sent = send_match_email(candidate)
        results.append({
            "email": candidate["email"],
            "name": candidate["name"],
            "sent": bool(sent),
        })

    sent_count = sum(1 for r in results if r["sent"])
    return {"sent": sent_count, "total": len(results), "results": results}


@app.get("/email-notifications")
def get_email_notifications_settings(email: EmailStr):
    return {"email": str(email), "enabled": _email_enabled(str(email))}


@app.put("/email-notifications")
def set_email_notifications_settings(request: EmailNotificationsSettings):
    _EMAIL_PREFS_BY_EMAIL[str(request.email).lower()] = bool(request.enabled)
    try:
        _save_email_settings()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to persist email settings: {exc}") from exc
    return {"email": str(request.email), "enabled": _email_enabled(str(request.email))}
