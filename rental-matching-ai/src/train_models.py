"""
train_models.py — Train and save all ML models.

Models trained:
  1. Price predictor  (RandomForest regression) — predicts fair rental price
  2. Property clusters (KMeans)                 — groups similar properties
     Used by matching_engine.py to speed up candidate-property matching.

Run:
    python src/train_models.py
"""

import pandas as pd
import numpy as np
import joblib
import os
import sys

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder, MinMaxScaler

# allow imports from project root
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from config import (
    CLEAN_DATA_PATH, READABLE_DATA_PATH,
    MODELS_DIR, PRICE_MODEL_PATH, CLUSTER_MODEL_PATH,
    SCALER_PATH, ENCODER_PATH,
    N_CLUSTERS
)

# ── helpers ───────────────────────────────────────────────────────────────────
def banner(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


# ── 0. Setup ──────────────────────────────────────────────────────────────────
os.makedirs(MODELS_DIR, exist_ok=True)

# ── 1. Load readable data (we re-encode ourselves to save encoders) ───────────
banner("STEP 1 — Load data")

df = pd.read_csv(READABLE_DATA_PATH)
print(f"Loaded {len(df)} rows, columns: {list(df.columns)}")

# Keep only columns useful for modelling
FEATURE_COLS  = ["category", "room_count", "bathroom_count", "size",
                  "city", "region", "budget_tier", "size_tier"]
TARGET_COL    = "price"

# ── 2. Encode & scale (save encoders for inference) ───────────────────────────
banner("STEP 2 — Encode & scale")

encoders = {}
df_model = df.copy()

# Label encode categoricals
for col in ["category", "city", "region"]:
    le = LabelEncoder()
    df_model[col] = le.fit_transform(df_model[col].astype(str))
    encoders[col] = le
    print(f"  Encoded '{col}' → {len(le.classes_)} classes")

# Ordinal encode tiers
tier_map  = {"very_low": 0, "low": 1, "medium": 2, "high": 3, "premium": 4}
size_map  = {"small": 0, "medium": 1, "large": 2, "extra_large": 3}
df_model["budget_tier"] = df_model["budget_tier"].map(tier_map).fillna(0)
df_model["size_tier"]   = df_model["size_tier"].map(size_map).fillna(0)

# Scale numeric features
numeric_cols = ["room_count", "bathroom_count", "size",
                "price_per_m2" if "price_per_m2" in df_model.columns else "size"]
numeric_cols = [c for c in numeric_cols if c in df_model.columns]

scaler = MinMaxScaler()
df_model[numeric_cols] = scaler.fit_transform(df_model[numeric_cols])

# Save encoders and scaler
joblib.dump(encoders, ENCODER_PATH)
joblib.dump(scaler,   SCALER_PATH)
print(f"\n  Encoders saved → {ENCODER_PATH}")
print(f"  Scaler saved   → {SCALER_PATH}")

# ── 3. Price prediction model ─────────────────────────────────────────────────
banner("STEP 3 — Train price predictor (RandomForest)")

X = df_model[FEATURE_COLS]
y = np.log10(df[TARGET_COL] + 1)          # predict log-price for stability

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"  Train: {len(X_train)} rows | Test: {len(X_test)} rows")

rf = RandomForestRegressor(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)

y_pred    = rf.predict(X_test)
mae_log   = mean_absolute_error(y_test, y_pred)
r2        = r2_score(y_test, y_pred)

# Convert back to actual TND for interpretability
mae_tnd   = mean_absolute_error(
    10 ** y_test - 1,
    10 ** y_pred - 1
)

print(f"\n  R²  score   : {r2:.4f}  (1.0 = perfect)")
print(f"  MAE (log)   : {mae_log:.4f}")
print(f"  MAE (TND)   : {mae_tnd:.1f} TND/month")

# Cross-validation
cv_scores = cross_val_score(rf, X, y, cv=5, scoring="r2")
print(f"  CV R² (5-fold): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# Feature importance
fi = pd.Series(rf.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
print("\n  Feature importances:")
for feat, imp in fi.items():
    print(f"    {feat:20s}: {imp:.4f}")

joblib.dump(rf, PRICE_MODEL_PATH)
print(f"\n  Model saved → {PRICE_MODEL_PATH}")

# ── 4. Property clustering ────────────────────────────────────────────────────
banner("STEP 4 — Train property clusters (KMeans)")

CLUSTER_FEATURES = ["room_count", "bathroom_count", "size",
                     "category", "city", "budget_tier", "size_tier"]
CLUSTER_FEATURES = [c for c in CLUSTER_FEATURES if c in df_model.columns]

X_cluster = df_model[CLUSTER_FEATURES]

kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
kmeans.fit(X_cluster)

df["cluster"] = kmeans.labels_
print(f"  Clusters formed: {N_CLUSTERS}")
print("\n  Cluster distribution:")
print(df["cluster"].value_counts().sort_index().to_string())

# Add cluster labels back to readable CSV for inspection
df.to_csv(READABLE_DATA_PATH, index=False)

joblib.dump(kmeans, CLUSTER_MODEL_PATH)
print(f"\n  Model saved → {CLUSTER_MODEL_PATH}")
print(f"  Cluster labels added to {READABLE_DATA_PATH}")

# ── 5. Done ───────────────────────────────────────────────────────────────────
banner("✅  Training complete")
print(f"  price_predictor.pkl  → predicts fair monthly rent")
print(f"  property_clusters.pkl → groups similar listings")
print(f"  scaler.pkl + encoders.pkl → for inference\n")
