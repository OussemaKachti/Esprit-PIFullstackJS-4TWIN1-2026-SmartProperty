"""
=============================================================
  Tunisia Rental Property — Data Cleaning Pipeline
  Project: AI Tenant-Property Matching System
=============================================================
Output files:
  - rentals_clean.csv       → ready for ML (encoded + scaled)
  - rentals_readable.csv    → same rows, human-readable labels
  - cleaning_report.txt     → summary of every step
=============================================================
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
import os

# ── paths ────────────────────────────────────────────────────────────────────
RAW_PATH     = "Property_Prices_in_Tunisia.csv"
OUT_ML       = "rentals_clean.csv"
OUT_READABLE = "rentals_readable.csv"
OUT_REPORT   = "cleaning_report.txt"

report_lines = []

def log(msg=""):
    print(msg)
    report_lines.append(msg)

# ── 1. LOAD ───────────────────────────────────────────────────────────────────
log("=" * 60)
log("STEP 1 — Load raw data")
log("=" * 60)

df = pd.read_csv(RAW_PATH)
log(f"Raw shape          : {df.shape}")
log(f"Columns            : {list(df.columns)}")
log(f"Type distribution  :\n{df['type'].value_counts().to_string()}")
log()

# ── 2. FILTER — keep rentals only ─────────────────────────────────────────────
log("=" * 60)
log("STEP 2 — Keep rentals only (type == 'À Louer')")
log("=" * 60)

df = df[df["type"] == "À Louer"].copy()
log(f"Rows after rental filter : {len(df)}")
log()

# ── 3. DROP UNUSED COLUMNS ───────────────────────────────────────────────────
log("=" * 60)
log("STEP 3 — Drop redundant columns")
log("=" * 60)

# 'type' is now constant (all rentals); 'log_price' we'll recompute cleanly
df.drop(columns=["type", "log_price"], inplace=True)
log("Dropped: 'type' (constant), 'log_price' (will recompute)")
log()

# ── 4. SENTINEL -1 → NaN ──────────────────────────────────────────────────────
log("=" * 60)
log("STEP 4 — Replace sentinel -1 with NaN")
log("=" * 60)

sentinel_cols = ["room_count", "bathroom_count", "size"]
before = {c: (df[c] == -1).sum() for c in sentinel_cols}
df[sentinel_cols] = df[sentinel_cols].replace(-1, np.nan)
after  = {c: df[c].isna().sum() for c in sentinel_cols}

for c in sentinel_cols:
    log(f"  {c:20s}: {before[c]} sentinels → {after[c]} NaN")
log()

# ── 5. PRICE OUTLIER REMOVAL ─────────────────────────────────────────────────
log("=" * 60)
log("STEP 5 — Remove price outliers")
log("=" * 60)

# Rentals in Tunisia: anything below 45 TND/month or above 4,000 TND/month
# is either test data or a luxury edge-case that breaks the model.
# We use the 1st and 95th percentile as clean boundaries.
p01 = df["price"].quantile(0.01)
p95 = df["price"].quantile(0.95)
log(f"  Price 1st  pct : {p01}")
log(f"  Price 95th pct : {p95}")

before_len = len(df)
df = df[(df["price"] >= p01) & (df["price"] <= p95)].copy()
log(f"  Rows removed   : {before_len - len(df)}")
log(f"  Rows remaining : {len(df)}")
log()

# ── 6. IMPUTE MISSING NUMERICS ───────────────────────────────────────────────
log("=" * 60)
log("STEP 6 — Impute missing numeric values")
log("=" * 60)

# Strategy: impute by category median (properties of same type have
# similar room/size distributions — much better than global median)
for col in ["room_count", "bathroom_count", "size"]:
    medians = df.groupby("category")[col].median()
    missing_mask = df[col].isna()
    df.loc[missing_mask, col] = df.loc[missing_mask, "category"].map(medians)
    # Fallback: if still NaN (whole category was NaN), use global median
    df[col] = df[col].fillna(df[col].median())
    log(f"  {col:20s}: imputed {missing_mask.sum()} rows via category median")

# Round imputed values to nearest integer (rooms/bathrooms are discrete)
df["room_count"]     = df["room_count"].round().astype(int)
df["bathroom_count"] = df["bathroom_count"].round().astype(int)
log()

# ── 7. FEATURE ENGINEERING ───────────────────────────────────────────────────
log("=" * 60)
log("STEP 7 — Feature engineering")
log("=" * 60)

# 7a. Price per m²
df["price_per_m2"] = (df["price"] / df["size"]).round(2)
df["price_per_m2"] = df["price_per_m2"].replace([np.inf, -np.inf], np.nan)
df["price_per_m2"] = df["price_per_m2"].fillna(df["price_per_m2"].median())
log("  + price_per_m2   = price / size")

# 7b. Log price (stable for regression models)
df["log_price"] = np.log10(df["price"] + 1).round(4)
log("  + log_price      = log10(price + 1)")

# 7c. Budget tier (useful for matching candidate budgets)
df["budget_tier"] = pd.cut(
    df["price"],
    bins=[0, 300, 700, 1500, 4000, np.inf],
    labels=["very_low", "low", "medium", "high", "premium"]
)
log("  + budget_tier    = [very_low|low|medium|high|premium]")

# 7d. Size tier
df["size_tier"] = pd.cut(
    df["size"],
    bins=[0, 50, 100, 200, np.inf],
    labels=["small", "medium", "large", "extra_large"]
)
log("  + size_tier      = [small|medium|large|extra_large]")

log()

# ── 8. SAVE READABLE VERSION (before encoding) ───────────────────────────────
df_readable = df.copy()
df_readable.to_csv(OUT_READABLE, index=False)
log(f"Readable version saved → {OUT_READABLE}")
log()

# ── 9. ENCODE CATEGORICALS ───────────────────────────────────────────────────
log("=" * 60)
log("STEP 8 — Encode categorical features")
log("=" * 60)

df_ml = df.copy()

# Label encode ordinal-style columns (city, region, category)
label_cols = ["category", "city", "region"]
le = LabelEncoder()
for col in label_cols:
    df_ml[col] = le.fit_transform(df_ml[col].astype(str))
    log(f"  Label encoded  : {col}")

# Ordinal encode tiers
tier_order = {"very_low": 0, "low": 1, "medium": 2, "high": 3, "premium": 4}
size_order  = {"small": 0, "medium": 1, "large": 2, "extra_large": 3}
df_ml["budget_tier"] = df_ml["budget_tier"].map(tier_order)
df_ml["size_tier"]   = df_ml["size_tier"].map(size_order)
log("  Ordinal encoded: budget_tier, size_tier")
log()

# ── 10. SCALE NUMERICAL FEATURES ─────────────────────────────────────────────
log("=" * 60)
log("STEP 9 — Scale numerical features (MinMax 0–1)")
log("=" * 60)

scale_cols = ["room_count", "bathroom_count", "size", "price",
              "price_per_m2", "log_price"]
scaler = MinMaxScaler()
df_ml[scale_cols] = scaler.fit_transform(df_ml[scale_cols])
log(f"  Scaled columns : {scale_cols}")
log()

# ── 11. FINAL CHECKS ─────────────────────────────────────────────────────────
log("=" * 60)
log("STEP 10 — Final validation")
log("=" * 60)

remaining_nulls = df_ml.isnull().sum()
log(f"Remaining nulls:\n{remaining_nulls[remaining_nulls > 0].to_string() or '  None ✓'}")
log(f"\nFinal ML dataset shape : {df_ml.shape}")
log(f"Columns                : {list(df_ml.columns)}")

# ── 12. SAVE ML VERSION ───────────────────────────────────────────────────────
df_ml.to_csv(OUT_ML, index=False)
log(f"\nML-ready version saved → {OUT_ML}")

# ── 13. WRITE REPORT ─────────────────────────────────────────────────────────
with open(OUT_REPORT, "w") as f:
    f.write("\n".join(report_lines))

log()
log("=" * 60)
log("✅  Cleaning pipeline complete.")
log(f"   {OUT_ML}       — feed directly into ML models")
log(f"   {OUT_READABLE} — use for EDA / debugging")
log(f"   {OUT_REPORT}   — full audit trail")
log("=" * 60)
