"""
FastAPI layer exposing the existing matching, credit scoring, and notification
functions. The ML logic lives in src/*.py and remains untouched.

Run locally:
    uvicorn api:app --reload

Environment:
    - .env can provide EMAIL_SENDER and EMAIL_PASSWORD for notifications
"""

from typing import List, Optional
from functools import lru_cache
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

from config import TOP_N_MATCHES
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


# Helpers --------------------------------------------------------------------

def _to_dict(model: BaseModel, **kwargs):
    """Compatibility wrapper for Pydantic v1/v2 to get a plain dict."""
    if hasattr(model, "model_dump"):
        return model.model_dump(**kwargs)
    return model.dict(**kwargs)  # type: ignore[return-value]


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
        sent = send_match_email(candidate)
        results.append({
            "email": candidate["email"],
            "name": candidate["name"],
            "sent": bool(sent),
        })

    sent_count = sum(1 for r in results if r["sent"])
    return {"sent": sent_count, "total": len(results), "results": results}
