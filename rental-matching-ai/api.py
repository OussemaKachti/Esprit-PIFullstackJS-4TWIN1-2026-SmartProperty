"""
FastAPI layer exposing the existing matching, credit scoring, and notification
functions. The ML logic lives in src/*.py and remains untouched.

Run locally:
    uvicorn api:app --reload

Environment:
    - .env can provide EMAIL_SENDER and EMAIL_PASSWORD for notifications
"""

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
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from config import TOP_N_MATCHES, READABLE_DATA_PATH, PRICE_MODEL_PATH, ENCODER_PATH, SCALER_PATH
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
    budget_hint: Optional[float] = Field(
        default=None,
        ge=0,
        description=(
            "Optional budget hint in TND/month. If provided, we derive budget_tier using the same bins as training."
        ),
    )


class PriceEstimateResponse(BaseModel):
    estimated_price_tnd: float
    accuracy_pct: float = Field(..., ge=0, le=100, description="Accuracy proxy from holdout MAPE: 100 - MAPE%")
    metrics: Dict[str, float]
    warnings: List[str] = []
    model_version: str = "price_predictor.pkl"


# Helpers --------------------------------------------------------------------

def _to_dict(model: BaseModel, **kwargs):
    """Compatibility wrapper for Pydantic v1/v2 to get a plain dict."""
    if hasattr(model, "model_dump"):
        return model.model_dump(**kwargs)
    return model.dict(**kwargs)  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Price estimation helpers
# ---------------------------------------------------------------------------

_BUDGET_BINS = [0, 300, 700, 1500, 4000, float("inf")]
_BUDGET_LABELS = ["very_low", "low", "medium", "high", "premium"]
_SIZE_BINS = [0, 50, 100, 200, float("inf")]
_SIZE_LABELS = ["small", "medium", "large", "extra_large"]
_TIER_MAP = {"very_low": 0, "low": 1, "medium": 2, "high": 3, "premium": 4}
_SIZE_MAP = {"small": 0, "medium": 1, "large": 2, "extra_large": 3}
_FEATURE_COLS = [
    "category",
    "room_count",
    "bathroom_count",
    "size",
    "city",
    "region",
    "budget_tier",
    "size_tier",
]


def _tier_from_value(value: Optional[float], bins: List[float], labels: List[str]) -> Optional[str]:
    if value is None:
        return None
    # pd.cut returns a Categorical; take first element
    tier = pd.cut(pd.Series([value]), bins=bins, labels=labels, include_lowest=True).astype(str).iloc[0]
    return tier if tier != "nan" else None


@lru_cache(maxsize=1)
def _load_price_artifacts() -> Tuple[Any, Dict[str, Any], Any]:
    """Load model + encoders + scaler once (joblib)."""
    missing = [p for p in [PRICE_MODEL_PATH, ENCODER_PATH, SCALER_PATH] if not Path(p).exists()]
    if missing:
        raise FileNotFoundError(
            "Missing trained artifacts. Run `python main.py` (or `python src/train_models.py`) to generate:\n"
            f"- {PRICE_MODEL_PATH}\n- {ENCODER_PATH}\n- {SCALER_PATH}"
        )

    model = joblib.load(PRICE_MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    scaler = joblib.load(SCALER_PATH)
    return model, encoders, scaler


def _encode_label(encoders: Dict[str, Any], col: str, value: str) -> int:
    le = encoders.get(col)
    if le is None:
        raise ValueError(f"Missing encoder for column '{col}'")

    classes = list(getattr(le, "classes_", []))
    if value not in classes:
        allowed_preview = classes[:25]
        more = "" if len(classes) <= 25 else f" (showing 25/{len(classes)})"
        raise ValueError(f"Unknown {col}='{value}'. Allowed values: {allowed_preview}{more}")

    return int(le.transform([value])[0])


def _build_feature_row(req: PriceEstimateRequest) -> Tuple[pd.DataFrame, List[str]]:
    """Build a single-row feature frame matching training preprocessing."""
    warnings: List[str] = []

    budget_tier_label = _tier_from_value(req.budget_hint, _BUDGET_BINS, _BUDGET_LABELS)
    if budget_tier_label is None:
        warnings.append("budget_hint not provided; budget_tier will default to 'very_low' (may reduce accuracy).")
        budget_tier_label = "very_low"

    size_tier_label = _tier_from_value(req.size, _SIZE_BINS, _SIZE_LABELS) or "small"

    model, encoders, scaler = _load_price_artifacts()

    row: Dict[str, Any] = {
        "category": _encode_label(encoders, "category", req.category),
        "room_count": float(req.room_count),
        "bathroom_count": float(req.bathroom_count),
        "size": float(req.size),
        "city": _encode_label(encoders, "city", req.city),
        "region": _encode_label(encoders, "region", req.region),
        "budget_tier": float(_TIER_MAP.get(budget_tier_label, 0)),
        "size_tier": float(_SIZE_MAP.get(size_tier_label, 0)),
    }

    X = pd.DataFrame([row], columns=_FEATURE_COLS)

    # Mirror training: scaler was fit on either 3 cols (room,bath,size) or 4 cols (room,bath,size,price_per_m2).
    numeric_cols = [c for c in ["room_count", "bathroom_count", "size"] if c in X.columns]
    try:
        n_expected = int(getattr(scaler, "n_features_in_", len(numeric_cols)))
        if n_expected == 3:
            X[numeric_cols] = scaler.transform(X[numeric_cols])
        elif n_expected == 4:
            price_per_m2 = 0.0
            if req.budget_hint is not None and req.size > 0:
                # This is only used to satisfy scaler shape; the price model itself does not use price_per_m2.
                price_per_m2 = float(req.budget_hint) / float(req.size)
            tmp = pd.DataFrame(
                [[float(req.room_count), float(req.bathroom_count), float(req.size), float(price_per_m2)]],
                columns=["room_count", "bathroom_count", "size", "price_per_m2"],
            )
            tmp_scaled = scaler.transform(tmp)
            X.loc[:, "room_count"] = float(tmp_scaled[0][0])
            X.loc[:, "bathroom_count"] = float(tmp_scaled[0][1])
            X.loc[:, "size"] = float(tmp_scaled[0][2])
        else:
            warnings.append(
                f"Scaler expects {n_expected} features; skipping scaling for numeric inputs (artifacts may be out of sync)."
            )
    except Exception as exc:
        warnings.append(f"Scaler transform failed; using unscaled numeric features ({exc}).")

    return X, warnings


@lru_cache(maxsize=1)
def _price_model_metrics() -> Dict[str, float]:
    """
    Compute a cached holdout evaluation on the readable dataset to produce a meaningful
    accuracy proxy. This runs once per process.
    """
    if not Path(READABLE_DATA_PATH).exists():
        return {"r2": float("nan"), "mae_tnd": float("nan"), "mape": float("nan"), "accuracy_pct": float("nan")}

    model, encoders, scaler = _load_price_artifacts()

    df = pd.read_csv(READABLE_DATA_PATH).fillna(0)
    required = {"category", "room_count", "bathroom_count", "size", "city", "region", "price", "budget_tier", "size_tier"}
    if not required.issubset(set(df.columns)):
        return {"r2": float("nan"), "mae_tnd": float("nan"), "mape": float("nan"), "accuracy_pct": float("nan")}

    # Encode using saved encoders (skip rows with unknown labels)
    def _safe_transform(col: str, series: pd.Series) -> pd.Series:
        le = encoders.get(col)
        if le is None:
            raise ValueError(f"Missing encoder for '{col}'")
        classes = set(getattr(le, "classes_", []))
        mask = series.astype(str).isin(classes)
        out = pd.Series(np.nan, index=series.index, dtype="float64")
        out.loc[mask] = le.transform(series[mask].astype(str))
        return out

    df_feat = pd.DataFrame(index=df.index)
    df_feat["category"] = _safe_transform("category", df["category"])
    df_feat["city"] = _safe_transform("city", df["city"])
    df_feat["region"] = _safe_transform("region", df["region"])
    df_feat["room_count"] = df["room_count"].astype(float)
    df_feat["bathroom_count"] = df["bathroom_count"].astype(float)
    df_feat["size"] = df["size"].astype(float)
    df_feat["budget_tier"] = df["budget_tier"].astype(str).map(_TIER_MAP).fillna(0).astype(float)
    df_feat["size_tier"] = df["size_tier"].astype(str).map(_SIZE_MAP).fillna(0).astype(float)

    mask_ok = df_feat.notnull().all(axis=1) & df["price"].notnull()
    df_feat = df_feat.loc[mask_ok, _FEATURE_COLS]
    y = np.log10(df.loc[mask_ok, "price"].astype(float).values + 1.0)

    if len(df_feat) < 50:
        return {"r2": float("nan"), "mae_tnd": float("nan"), "mape": float("nan"), "accuracy_pct": float("nan")}

    X_train, X_test, y_train, y_test = train_test_split(df_feat, y, test_size=0.2, random_state=42)

    # Scale numeric cols consistently
    numeric_cols = [c for c in ["room_count", "bathroom_count", "size"] if c in X_train.columns]
    try:
        X_train = X_train.copy()
        X_test = X_test.copy()
        n_expected = int(getattr(scaler, "n_features_in_", len(numeric_cols)))
        if n_expected == 3:
            X_train[numeric_cols] = scaler.transform(X_train[numeric_cols])
            X_test[numeric_cols] = scaler.transform(X_test[numeric_cols])
        elif n_expected == 4:
            # Provide price_per_m2 to satisfy scaler shape (model does not use it directly).
            ppm2_train = (
                df.loc[X_train.index, "price_per_m2"].astype(float)
                if "price_per_m2" in df.columns
                else (df.loc[X_train.index, "price"].astype(float) / df.loc[X_train.index, "size"].astype(float)).astype(float)
            )
            ppm2_test = (
                df.loc[X_test.index, "price_per_m2"].astype(float)
                if "price_per_m2" in df.columns
                else (df.loc[X_test.index, "price"].astype(float) / df.loc[X_test.index, "size"].astype(float)).astype(float)
            )

            tmp_train = pd.DataFrame(
                {
                    "room_count": X_train["room_count"].astype(float),
                    "bathroom_count": X_train["bathroom_count"].astype(float),
                    "size": X_train["size"].astype(float),
                    "price_per_m2": ppm2_train.values,
                },
                index=X_train.index,
            )
            tmp_test = pd.DataFrame(
                {
                    "room_count": X_test["room_count"].astype(float),
                    "bathroom_count": X_test["bathroom_count"].astype(float),
                    "size": X_test["size"].astype(float),
                    "price_per_m2": ppm2_test.values,
                },
                index=X_test.index,
            )

            scaled_train = scaler.transform(tmp_train)
            scaled_test = scaler.transform(tmp_test)
            X_train.loc[:, "room_count"] = scaled_train[:, 0]
            X_train.loc[:, "bathroom_count"] = scaled_train[:, 1]
            X_train.loc[:, "size"] = scaled_train[:, 2]
            X_test.loc[:, "room_count"] = scaled_test[:, 0]
            X_test.loc[:, "bathroom_count"] = scaled_test[:, 1]
            X_test.loc[:, "size"] = scaled_test[:, 2]
    except Exception:
        pass

    y_pred = model.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    y_true_tnd = (10 ** y_test) - 1
    y_pred_tnd = (10 ** y_pred) - 1
    mae_tnd = float(mean_absolute_error(y_true_tnd, y_pred_tnd))

    denom = np.maximum(1.0, np.abs(y_true_tnd))
    mape = float(np.mean(np.abs((y_true_tnd - y_pred_tnd) / denom)))
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
    """Estimate fair monthly rental price using the trained RandomForest model."""
    try:
        X, warnings = _build_feature_row(request)
        model, _, _ = _load_price_artifacts()
        pred_log = float(model.predict(X)[0])
        estimated_price = float((10 ** pred_log) - 1.0)

        metrics = _price_model_metrics()
        accuracy_pct = float(metrics.get("accuracy_pct", float("nan")))

        # Basic sanity clamp
        estimated_price = max(0.0, estimated_price)

        return PriceEstimateResponse(
            estimated_price_tnd=round(estimated_price, 2),
            accuracy_pct=round(accuracy_pct, 2) if np.isfinite(accuracy_pct) else float("nan"),
            metrics={k: (round(v, 6) if isinstance(v, float) and np.isfinite(v) else v) for k, v in metrics.items()},
            warnings=warnings,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Price estimation failed: {exc}") from exc


@app.get("/api/price-estimate/options")
def price_estimate_options():
    """
    Return allowed categorical values (from saved encoders) to prevent 422 errors
    due to unknown labels.
    """
    try:
        _, encoders, _ = _load_price_artifacts()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Failed to load model artifacts: {exc}") from exc

    def _classes(col: str) -> List[str]:
        le = encoders.get(col)
        classes = getattr(le, "classes_", None)
        if classes is None:
            return []
        return [str(x) for x in list(classes)]

    return {
        "category": _classes("category"),
        "city": _classes("city"),
        "region": _classes("region"),
        "budgetBins": _BUDGET_BINS[:-1],
        "budgetLabels": _BUDGET_LABELS,
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
