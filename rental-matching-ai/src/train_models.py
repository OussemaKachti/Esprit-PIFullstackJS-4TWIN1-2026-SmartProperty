"""
train_models.py — Train and save the ML models used by the rental AI.

The price predictor now uses only observable listing features and a proper
preprocessing pipeline, which removes the target leakage that made the old
model unreliable in production.

Run:
    python src/train_models.py
"""

import json
import os
import sys

import joblib
import numpy as np
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, LabelEncoder, MinMaxScaler

# allow imports from project root
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from config import (
    READABLE_DATA_PATH,
    MODELS_DIR,
    PRICE_MODEL_PATH,
    PRICE_MODEL_METRICS_PATH,
    CLUSTER_MODEL_PATH,
    SCALER_PATH,
    ENCODER_PATH,
    N_CLUSTERS,
)


def banner(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def one_hot_encoder():
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


os.makedirs(MODELS_DIR, exist_ok=True)

banner("STEP 1 — Load data")
df = pd.read_csv(READABLE_DATA_PATH)
print(f"Loaded {len(df)} rows, columns: {list(df.columns)}")

required = ["category", "room_count", "bathroom_count", "size", "price", "city", "region"]
missing = [col for col in required if col not in df.columns]
if missing:
    raise FileNotFoundError(f"Missing required training columns: {missing}")

df = df.copy()
for col in ["room_count", "bathroom_count", "size", "price"]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df = df.dropna(subset=required).copy()
df = df[(df["price"] > 0) & (df["size"] > 0)].copy()

df["rooms_per_100sqm"] = (df["room_count"] / df["size"].clip(lower=1)) * 100.0
df["baths_per_room"] = df["bathroom_count"] / df["room_count"].clip(lower=1)

feature_cols = [
    "category",
    "room_count",
    "bathroom_count",
    "size",
    "city",
    "region",
    "rooms_per_100sqm",
    "baths_per_room",
]
categorical_cols = ["category", "city", "region"]
numeric_cols = ["room_count", "bathroom_count", "size", "rooms_per_100sqm", "baths_per_room"]

X = df[feature_cols].copy()
y = np.log1p(df["price"].astype(float))

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"  Train: {len(X_train)} rows | Test: {len(X_test)} rows")

banner("STEP 2 — Train clean price predictor")
preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            Pipeline(
                steps=[
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("onehot", one_hot_encoder()),
                ]
            ),
            categorical_cols,
        ),
        (
            "num",
            Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
            numeric_cols,
        ),
    ],
    remainder="drop",
)

price_model = Pipeline(
    steps=[
        ("preprocess", preprocessor),
        (
            "regressor",
            ExtraTreesRegressor(
                n_estimators=700,
                min_samples_leaf=2,
                min_samples_split=4,
                max_features="sqrt",
                random_state=42,
                n_jobs=-1,
            ),
        ),
    ]
)

price_model.fit(X_train, y_train)

y_pred_log = price_model.predict(X_test)
y_true_tnd = np.expm1(y_test)
y_pred_tnd = np.expm1(y_pred_log)

r2 = float(r2_score(y_test, y_pred_log))
mae_tnd = float(mean_absolute_error(y_true_tnd, y_pred_tnd))
mape = float(mean_absolute_percentage_error(y_true_tnd, y_pred_tnd))
accuracy_pct = float(max(0.0, min(100.0, 100.0 - (mape * 100.0))))

print(f"\n  Holdout R²    : {r2:.4f}")
print(f"  Holdout MAE   : {mae_tnd:.1f} TND/month")
print(f"  Holdout MAPE  : {mape:.4f}")
print(f"  Accuracy proxy: {accuracy_pct:.2f}%")

cv_r2 = cross_val_score(price_model, X, y, cv=5, scoring="r2", n_jobs=-1)
cv_mape = -cross_val_score(
    price_model,
    X,
    y,
    cv=5,
    scoring="neg_mean_absolute_percentage_error",
    n_jobs=-1,
)

print(f"  CV R² (5-fold): {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
print(f"  CV MAPE       : {cv_mape.mean():.4f} ± {cv_mape.std():.4f}")

joblib.dump(price_model, PRICE_MODEL_PATH)
metrics = {
    "model_name": "ExtraTreesRegressor",
    "rows_used": int(len(df)),
    "feature_columns": feature_cols,
    "holdout_r2": round(r2, 6),
    "holdout_mae_tnd": round(mae_tnd, 4),
    "holdout_mape": round(mape, 6),
    "holdout_accuracy_pct": round(accuracy_pct, 2),
    "cv_r2_mean": round(float(cv_r2.mean()), 6),
    "cv_r2_std": round(float(cv_r2.std()), 6),
    "cv_mape_mean": round(float(cv_mape.mean()), 6),
    "cv_mape_std": round(float(cv_mape.std()), 6),
    "cv_accuracy_pct": round(float(max(0.0, min(100.0, 100.0 - (float(cv_mape.mean()) * 100.0)))), 2),
}
PRICE_MODEL_METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

print(f"\n  Model saved   → {PRICE_MODEL_PATH}")
print(f"  Metrics saved → {PRICE_MODEL_METRICS_PATH}")

banner("STEP 3 — Train property clusters (KMeans)")
df_cluster = pd.read_csv(READABLE_DATA_PATH).copy()
for col in ["room_count", "bathroom_count", "size", "price"]:
    if col in df_cluster.columns:
        df_cluster[col] = pd.to_numeric(df_cluster[col], errors="coerce")

df_cluster = df_cluster.dropna(subset=["category", "city", "room_count", "bathroom_count", "size"]).copy()

cluster_features = ["room_count", "bathroom_count", "size", "category", "city", "budget_tier", "size_tier"]
cluster_features = [col for col in cluster_features if col in df_cluster.columns]

df_cluster_model = df_cluster.copy()
for col in ["category", "city", "region"]:
    if col in df_cluster_model.columns:
        encoder = LabelEncoder()
        df_cluster_model[col] = encoder.fit_transform(df_cluster_model[col].astype(str))

if "budget_tier" in df_cluster_model.columns:
    tier_map = {"very_low": 0, "low": 1, "medium": 2, "high": 3, "premium": 4}
    df_cluster_model["budget_tier"] = df_cluster_model["budget_tier"].map(tier_map).fillna(0)

if "size_tier" in df_cluster_model.columns:
    size_map = {"small": 0, "medium": 1, "large": 2, "extra_large": 3}
    df_cluster_model["size_tier"] = df_cluster_model["size_tier"].map(size_map).fillna(0)

scaler = MinMaxScaler()
cluster_matrix = df_cluster_model[cluster_features]
cluster_matrix = pd.DataFrame(scaler.fit_transform(cluster_matrix), columns=cluster_features)

kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
kmeans.fit(cluster_matrix)

df_cluster["cluster"] = kmeans.labels_
print(f"  Clusters formed: {N_CLUSTERS}")
print("\n  Cluster distribution:")
print(df_cluster["cluster"].value_counts().sort_index().to_string())

df_cluster.to_csv(READABLE_DATA_PATH, index=False)
joblib.dump(kmeans, CLUSTER_MODEL_PATH)

print(f"\n  Model saved → {CLUSTER_MODEL_PATH}")
print(f"  Cluster labels added to {READABLE_DATA_PATH}")

banner("✅  Training complete")
print("  price_predictor.pkl   → clean price estimator from real listing features")
print("  price_model_metrics.json → validation metrics for the API")
print("  property_clusters.pkl → groups similar listings")
