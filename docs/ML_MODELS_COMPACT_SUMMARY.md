# Rental Matching AI - Compact ML Documentation

## 1) Models You Use

### RandomForestRegressor (Price Prediction)
- File: src/train_models.py
- Purpose: Predict fair monthly rent price.
- Input features: category, room_count, bathroom_count, size, city, region, budget_tier, size_tier.
- Target: price (trained as log10(price + 1)).
- Saved as: models/price_predictor.pkl
- Metrics used: R2, MAE (log), MAE (TND), 5-fold CV R2.

### KMeans (Property Clustering)
- File: src/train_models.py
- Purpose: Group similar properties for smarter matching.
- Input features: room_count, bathroom_count, size, category, city, budget_tier, size_tier.
- Config: N_CLUSTERS = 5 (from config.py).
- Saved as: models/property_clusters.pkl

### YOLOv8n (Image Object Detection)
- File: api.py
- Weight file: yolov8n.pt
- Purpose: Detect objects in property images and infer room type hints.
- Output used as: detected_objects, room_votes, inferred_room.
- Note: Pretrained model is used (no custom training script in this folder).

## 2) Data You Use
- Raw data: data/raw/Property Prices in Tunisia.csv
- Processed ML data: data/processed/rentals_clean.csv
- Processed readable data: data/processed/rentals_readable.csv

## 3) Data Cleaning Pipeline (How I Did It)
- File: src/clean_data.py
1. Load raw CSV.
2. Keep rentals only (type == "A Louer").
3. Drop constant/redundant columns.
4. Replace sentinel -1 with NaN.
5. Remove outliers using price percentiles (1st to 95th).
6. Impute missing numeric values by category median (+ global fallback).
7. Feature engineering:
- price_per_m2
- log_price
- budget_tier
- size_tier
8. Encode categoricals (LabelEncoder + ordinal maps).
9. Scale numerics with MinMaxScaler.
10. Save cleaned outputs + cleaning report.

## 4) Training Flow (How I Trained)
- File: src/train_models.py
1. Load data/processed/rentals_readable.csv.
2. Encode categorical columns (category, city, region).
3. Encode tiers (budget_tier, size_tier).
4. Scale numeric columns.
5. Save preprocessing artifacts:
- models/encoders.pkl
- models/scaler.pkl
6. Train RandomForestRegressor for price.
7. Evaluate with R2, MAE, CV.
8. Train KMeans clusters.
9. Save both models and write cluster labels back to readable CSV.

## 5) Inference / Runtime Usage
- Matching engine: src/matching_engine.py (weighted scoring rules, top-N matches).
- Credit scoring: src/credit_scorer.py (rule-based, not ML model training).
- API serving: api.py (match, credit, notify, detect endpoints).

## 6) Keywords (Model + Data + Pipeline)
- RandomForestRegressor
- KMeans
- YOLOv8n
- LabelEncoder
- MinMaxScaler
- Cross-validation
- R2
- MAE
- Feature engineering
- Outlier removal
- Imputation
- Clustering
- Inference
- rentals_clean.csv
- rentals_readable.csv
- Property Prices in Tunisia.csv
