"""
matching_engine.py — Compute 0–100% compatibility scores between a candidate
and all available properties, then return the top N matches with explanations.

Usage (standalone):
    python src/matching_engine.py

Usage (imported):
    from src.matching_engine import find_top_matches
    matches = find_top_matches(candidate_profile)
"""

import pandas as pd
import numpy as np
import joblib
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import (
    READABLE_DATA_PATH, ENCODER_PATH, SCALER_PATH,
    CLUSTER_MODEL_PATH, PRICE_MODEL_PATH,
    SCORE_WEIGHTS, TOP_N_MATCHES
)


# ── helpers ───────────────────────────────────────────────────────────────────

def _proximity_score(candidate_val, property_val, tolerance=0.3):
    """
    Return 1.0 if values match exactly, decaying toward 0 as they diverge.
    tolerance controls how quickly the score decays (fraction of range).
    Works for any numeric feature already scaled 0–1.
    """
    if candidate_val is None or pd.isna(candidate_val):
        return 0.5                          # neutral when preference not given
    diff = abs(float(candidate_val) - float(property_val))
    return max(0.0, 1.0 - diff / tolerance)


def _category_score(preferred_categories, property_category):
    """1.0 if property type is in preferred list, else 0."""
    if not preferred_categories:
        return 0.5
    return 1.0 if property_category in preferred_categories else 0.0


def _city_score(preferred_city, property_city):
    """1.0 exact city match, 0 otherwise."""
    if not preferred_city:
        return 0.5
    return 1.0 if str(preferred_city).lower() == str(property_city).lower() else 0.0


def _price_score(budget_max, property_price):
    """
    1.0  if price <= budget_max
    decays linearly to 0 if price is up to 50% over budget
    0    if price > 150% of budget
    """
    if budget_max is None or budget_max <= 0:
        return 0.5
    ratio = property_price / budget_max
    if ratio <= 1.0:
        return 1.0
    elif ratio <= 1.5:
        return max(0.0, 1.0 - (ratio - 1.0) * 2)
    return 0.0


def _score_to_percent(raw_score):
    return round(raw_score * 100, 1)


def _build_explanation(candidate, row, scores_breakdown):
    """
    Return a human-readable explanation string for why this property matched.
    Example: "Ce bien correspond parce que: le prix est dans votre budget (380 TND),
              situé à Tunis, 2 chambres disponibles."
    """
    reasons  = []
    warnings = []

    price  = row["price"]
    budget = candidate.get("budget_max")

    if budget and price <= budget:
        reasons.append(f"le prix ({price:.0f} TND/mois) est dans votre budget")
    elif budget and price <= budget * 1.2:
        warnings.append(f"légèrement au-dessus de votre budget ({price:.0f} vs {budget:.0f} TND)")

    if candidate.get("city") and str(candidate["city"]).lower() == str(row["city"]).lower():
        reasons.append(f"situé dans votre ville préférée ({row['city']})")

    desired_rooms = candidate.get("min_rooms")
    if desired_rooms and row["room_count"] >= desired_rooms:
        reasons.append(f"{int(row['room_count'])} chambre(s) disponible(s)")

    if candidate.get("preferred_categories") and row["category"] in candidate["preferred_categories"]:
        reasons.append(f"type de bien correspondant ({row['category']})")

    explanation = "Ce bien correspond parce que: " + ", ".join(reasons) if reasons else "Correspondance partielle."
    if warnings:
        explanation += " ⚠️ Note: " + "; ".join(warnings) + "."

    return explanation


# ── main scoring function ──────────────────────────────────────────────────────

def score_property(candidate, row):
    """
    Compute a weighted compatibility score (0–1) for one property row.

    candidate dict keys:
        budget_max          (float)  max monthly rent in TND
        city                (str)    preferred city name e.g. "Tunis"
        min_rooms           (int)    minimum number of rooms
        preferred_categories(list)   e.g. ["Appartements", "Maisons et Villas"]
        min_size            (float)  minimum size in m²

    Returns (score_0_to_1, breakdown_dict)
    """
    w = SCORE_WEIGHTS

    # individual component scores
    s_price    = _price_score(candidate.get("budget_max"), row["price"])
    s_city     = _city_score(candidate.get("city"), row["city"])
    s_rooms    = _proximity_score(
                     candidate.get("min_rooms"),
                     row["room_count"],
                     tolerance=3
                 )
    s_category = _category_score(candidate.get("preferred_categories"), row["category"])
    s_size     = _proximity_score(
                     candidate.get("min_size"),
                     row["size"],
                     tolerance=100
                 )

    weighted = (
        w["price"]    * s_price    +
        w["location"] * s_city     +
        w["rooms"]    * s_rooms    +
        w["category"] * s_category +
        w["size"]     * s_size
    )

    breakdown = {
        "price_score"   : round(s_price    * 100, 1),
        "location_score": round(s_city     * 100, 1),
        "rooms_score"   : round(s_rooms    * 100, 1),
        "category_score": round(s_category * 100, 1),
        "size_score"    : round(s_size     * 100, 1),
    }

    return weighted, breakdown


def find_top_matches(candidate, n=None):
    """
    Score all properties in the dataset against the candidate profile
    and return the top N matches.

    Returns a list of dicts, each containing:
        rank, score_pct, explanation, property details, score_breakdown
    """
    n = n or TOP_N_MATCHES

    df = pd.read_csv(READABLE_DATA_PATH)

    results = []
    for _, row in df.iterrows():
        score, breakdown = score_property(candidate, row)
        explanation      = _build_explanation(candidate, row, breakdown)
        results.append({
            "score"          : score,
            "score_pct"      : _score_to_percent(score),
            "category"       : row["category"],
            "city"           : row["city"],
            "region"         : row["region"],
            "price"          : row["price"],
            "room_count"     : row["room_count"],
            "bathroom_count" : row["bathroom_count"],
            "size"           : row["size"],
            "explanation"    : explanation,
            "breakdown"      : breakdown,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    top = results[:n]

    for i, match in enumerate(top, 1):
        match["rank"] = i

    return top


# ── CLI demo ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Example candidate profile — edit this to test different scenarios
    candidate = {
        "name"                 : "Ahmed Ben Ali",
        "budget_max"           : 800,           # max 800 TND/month
        "city"                 : "Tunis",
        "min_rooms"            : 2,
        "preferred_categories" : ["Appartements", "Maisons et Villas"],
        "min_size"             : 70,            # minimum 70 m²
    }

    print("\n" + "=" * 60)
    print("  MATCHING ENGINE — Candidate Profile")
    print("=" * 60)
    print(f"  Name    : {candidate['name']}")
    print(f"  Budget  : {candidate['budget_max']} TND/month")
    print(f"  City    : {candidate['city']}")
    print(f"  Rooms   : min {candidate['min_rooms']}")
    print(f"  Size    : min {candidate['min_size']} m²")
    print(f"  Types   : {', '.join(candidate['preferred_categories'])}")

    print("\n" + "=" * 60)
    print(f"  TOP {TOP_N_MATCHES} MATCHES")
    print("=" * 60)

    matches = find_top_matches(candidate)

    for m in matches:
        print(f"\n  #{m['rank']} — Score: {m['score_pct']}%")
        print(f"       {m['category']} | {m['city']} - {m['region']}")
        print(f"       Price: {m['price']:.0f} TND/month | "
              f"{int(m['room_count'])} rooms | {m['size']:.0f} m²")
        print(f"       {m['explanation']}")
        print(f"       Breakdown: {m['breakdown']}")
