"""
main.py — Entry point for the rental matching AI system.

What it does:
  1. (Re)runs the data cleaning pipeline if clean data doesn't exist yet
  2. (Re)trains models if they don't exist yet
  3. Runs the matching engine for a sample candidate
  4. Runs the credit scorer for that candidate's dossier
  5. Previews the email notification (sends if .env is configured)

Run:
    python main.py
"""

import os
import sys
from pathlib import Path

from config import (
    RAW_DATA_PATH, CLEAN_DATA_PATH, READABLE_DATA_PATH,
    PRICE_MODEL_PATH, CLUSTER_MODEL_PATH
)


def banner(title, char="="):
    print(f"\n{char*60}")
    print(f"  {title}")
    print(f"{char*60}")


# ── Step 1: Data cleaning ─────────────────────────────────────────────────────
banner("STEP 1 — Data Cleaning")

if CLEAN_DATA_PATH.exists() and READABLE_DATA_PATH.exists():
    print(f"  ✅  Clean data already exists at {CLEAN_DATA_PATH}")
    print(f"      Delete it and rerun to refresh.")
else:
    print("  Running clean_data.py ...")
    os.system(f"{sys.executable} src/clean_data.py")


# ── Step 2: Model training ────────────────────────────────────────────────────
banner("STEP 2 — Model Training")

if PRICE_MODEL_PATH.exists() and CLUSTER_MODEL_PATH.exists():
    print(f"  ✅  Trained models already exist in /models/")
    print(f"      Delete them and rerun to retrain.")
else:
    print("  Running train_models.py ...")
    os.system(f"{sys.executable} src/train_models.py")


# ── Step 3: Candidate matching ────────────────────────────────────────────────
banner("STEP 3 — Candidate-Property Matching")

from src.matching_engine import find_top_matches

# 🔧 Edit this candidate profile to test different scenarios
candidate = {
    "name"                 : "Ahmed Ben Ali",
    "budget_max"           : 800,           # max monthly rent in TND
    "city"                 : "Tunis",       # preferred city
    "min_rooms"            : 2,             # minimum rooms
    "preferred_categories" : ["Appartements", "Maisons et Villas"],
    "min_size"             : 70,            # minimum m²
}

print(f"\n  Candidate: {candidate['name']}")
print(f"  Budget: {candidate['budget_max']} TND | City: {candidate['city']} | "
      f"Rooms: {candidate['min_rooms']}+ | Size: {candidate['min_size']}+ m²")

matches = find_top_matches(candidate)

print(f"\n  Top {len(matches)} matches:\n")
for m in matches:
    print(f"  ┌─ #{m['rank']}  Score: {m['score_pct']}%")
    print(f"  │  {m['category']} | {m['city']} - {m['region']}")
    print(f"  │  💰 {m['price']:.0f} TND/month | 🛏 {int(m['room_count'])} rooms | 📐 {m['size']:.0f} m²")
    print(f"  └─ 💡 {m['explanation']}\n")


# ── Step 4: Credit scoring ────────────────────────────────────────────────────
banner("STEP 4 — Credit Score Analysis")

from src.credit_scorer import evaluate_candidate

# 🔧 Edit this dossier to match your test candidate
dossier = {
    "name"               : "Ahmed Ben Ali",
    "monthly_income"     : 2800,
    "rent_asked"         : candidate["budget_max"],
    "total_monthly_debts": 300,
    "employment_type"    : "CDI",
    "months_employed"    : 36,
    "has_guarantor"      : False,
    "documents": {
        "national_id"         : True,
        "payslips_3months"    : True,
        "bank_statement"      : True,
        "employment_contract" : True,
        "tax_notice"          : False,
    }
}

result = evaluate_candidate(dossier)

print(f"\n  Candidate  : {result['name']}")
print(f"  Credit score: {result['score']} / 100")
print(f"  Debt ratio  : {result['debt_ratio']*100:.1f}%")
print(f"  Decision    : {result['recommendation']}")
print(f"\n  {result['explanation']}")
print(f"\n  Score breakdown:")
for k, v in result["breakdown"].items():
    print(f"    {k:25s}: {v}")


# ── Step 5: Notification preview ──────────────────────────────────────────────
banner("STEP 5 — Email Notification Preview")

from src.notifier import send_match_email

candidate_with_email = {**candidate, "email": "amineftwdiamond@gmail.com"}
send_match_email(candidate_with_email)


# ── Done ──────────────────────────────────────────────────────────────────────
banner("✅  Pipeline Complete", char="-")
print("  Edit the candidate/dossier dicts in main.py to test other profiles.")
print("  Set EMAIL_SENDER + EMAIL_PASSWORD in .env to enable real emails.\n")
