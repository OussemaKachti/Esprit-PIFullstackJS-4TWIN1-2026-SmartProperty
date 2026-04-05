"""
config.py — Central configuration for the rental matching AI project.
All paths, thresholds, and settings live here.
"""

import os
from pathlib import Path

# ── Project root (the folder containing this file) ───────────────────────────
BASE_DIR = Path(__file__).resolve().parent

# ── Data paths ────────────────────────────────────────────────────────────────
DATA_DIR          = BASE_DIR / "data"
RAW_DATA_PATH     = DATA_DIR / "raw"  / "Property_Prices_in_Tunisia.csv"
CLEAN_DATA_PATH   = DATA_DIR / "processed" / "rentals_clean.csv"
READABLE_DATA_PATH= DATA_DIR / "processed" / "rentals_readable.csv"
REPORT_PATH       = DATA_DIR / "cleaning_report.txt"

# ── Model paths ───────────────────────────────────────────────────────────────
MODELS_DIR        = BASE_DIR / "models"
PRICE_MODEL_PATH  = MODELS_DIR / "price_predictor.pkl"
CLUSTER_MODEL_PATH= MODELS_DIR / "property_clusters.pkl"
SCALER_PATH       = MODELS_DIR / "scaler.pkl"
ENCODER_PATH      = MODELS_DIR / "encoders.pkl"

# ── Cleaning settings ─────────────────────────────────────────────────────────
PRICE_LOWER_PERCENTILE = 0.01   # remove bottom 1%
PRICE_UPPER_PERCENTILE = 0.95   # remove top 5%
RENTAL_TYPE_LABEL      = "À Louer"

# ── Matching settings ─────────────────────────────────────────────────────────
TOP_N_MATCHES     = 3           # number of top matches to return per candidate
SCORE_WEIGHTS = {
    "price"    : 0.35,          # budget fit is most important
    "location" : 0.25,          # city match
    "rooms"    : 0.20,          # room count fit
    "category" : 0.15,          # property type fit
    "size"     : 0.05,          # size fit
}

# ── Credit scoring thresholds ─────────────────────────────────────────────────
MAX_DEBT_RATIO    = 0.35        # above 35% debt-to-income → risky
CREDIT_ACCEPT     = 70          # score >= 70 → accept
CREDIT_GUARANTEE  = 40          # score 40–69 → ask for guarantees
                                # score < 40  → refuse

# ── Email / notification settings ────────────────────────────────────────────
# Store real credentials in a .env file, never hardcode them
EMAIL_SENDER      = os.getenv("EMAIL_SENDER", "your_email@gmail.com")
EMAIL_PASSWORD    = os.getenv("EMAIL_PASSWORD", "")
EMAIL_SMTP_HOST   = "smtp.gmail.com"
EMAIL_SMTP_PORT   = 587
NOTIFY_HOUR       = 8           # send daily email at 08:00

# ── Cluster settings ──────────────────────────────────────────────────────────
N_CLUSTERS        = 5           # number of property clusters for KMeans
