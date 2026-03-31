"""
credit_scorer.py — Analyse a candidate dossier and compute a credit score (0–100).

In a real system this module would:
  - Extract data from uploaded documents (payslips, bank statements) via OCR
  - Verify document authenticity via an external API
  - Apply GDPR-compliant data handling

For this project, we simulate document input via a structured dossier dict
and apply realistic scoring rules based on Tunisian rental market practice.

Usage:
    python src/credit_scorer.py

    or imported:
    from src.credit_scorer import evaluate_candidate
    result = evaluate_candidate(dossier)
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import CREDIT_ACCEPT, CREDIT_GUARANTEE, MAX_DEBT_RATIO


# ── scoring rules ─────────────────────────────────────────────────────────────

def _income_score(monthly_income, rent_asked):
    """
    Standard rule: rent should be ≤ 33% of net monthly income.
    Score 100 if rent is ≤ 25%, decays to 0 if rent > 50% of income.
    """
    if monthly_income <= 0:
        return 0
    ratio = rent_asked / monthly_income
    if ratio <= 0.25:
        return 100
    elif ratio <= 0.33:
        return 85
    elif ratio <= 0.40:
        return 60
    elif ratio <= 0.50:
        return 30
    return 0


def _debt_ratio_score(total_monthly_debts, monthly_income):
    """
    Debt-to-income ratio. Above MAX_DEBT_RATIO (35%) is high risk.
    """
    if monthly_income <= 0:
        return 0
    ratio = total_monthly_debts / monthly_income
    if ratio <= 0.20:
        return 100
    elif ratio <= 0.30:
        return 75
    elif ratio <= MAX_DEBT_RATIO:
        return 50
    elif ratio <= 0.50:
        return 20
    return 0


def _employment_score(employment_type, months_employed):
    """
    Employment stability scoring.
    CDI (permanent) > CDD (fixed-term) > Freelance > Unemployed
    """
    base = {
        "CDI"        : 100,
        "CDD"        : 70,
        "freelance"  : 55,
        "retired"    : 80,
        "unemployed" : 0,
    }.get(employment_type.lower(), 40)

    # Bonus/penalty for seniority
    if months_employed >= 24:
        seniority_bonus = 10
    elif months_employed >= 12:
        seniority_bonus = 5
    elif months_employed >= 6:
        seniority_bonus = 0
    else:
        seniority_bonus = -15

    return max(0, min(100, base + seniority_bonus))


def _documents_score(documents_provided):
    """
    Checks which documents are present.
    Full dossier: ID + 3 payslips + bank statement + employment contract.
    """
    required = {
        "national_id"         : 20,
        "payslips_3months"    : 25,
        "bank_statement"      : 20,
        "employment_contract" : 20,
        "tax_notice"          : 15,
    }
    score = 0
    for doc, weight in required.items():
        if documents_provided.get(doc, False):
            score += weight
    return score


def _guarantor_bonus(has_guarantor):
    """Having a guarantor adds a flat bonus."""
    return 10 if has_guarantor else 0


# ── main evaluation function ───────────────────────────────────────────────────

def evaluate_candidate(dossier):
    """
    Evaluate a candidate dossier and return a credit score + recommendation.

    dossier dict keys:
        name                (str)
        monthly_income      (float)  net income in TND
        rent_asked          (float)  monthly rent of the target property
        total_monthly_debts (float)  existing loan/debt payments per month
        employment_type     (str)    CDI | CDD | freelance | retired | unemployed
        months_employed     (int)    how long in current job
        has_guarantor       (bool)
        documents           (dict)   which documents are provided
            national_id         (bool)
            payslips_3months    (bool)
            bank_statement      (bool)
            employment_contract (bool)
            tax_notice          (bool)

    Returns a dict with:
        score           0–100
        recommendation  "ACCEPT" | "GUARANTEE" | "REFUSE"
        debt_ratio      float
        breakdown       dict of component scores
        explanation     human-readable summary
    """
    income   = dossier.get("monthly_income", 0)
    rent     = dossier.get("rent_asked", 0)
    debts    = dossier.get("total_monthly_debts", 0)
    emp_type = dossier.get("employment_type", "unemployed")
    emp_mos  = dossier.get("months_employed", 0)
    guarantor= dossier.get("has_guarantor", False)
    docs     = dossier.get("documents", {})

    # Component scores
    s_income     = _income_score(income, rent)
    s_debt       = _debt_ratio_score(debts, income)
    s_employment = _employment_score(emp_type, emp_mos)
    s_documents  = _documents_score(docs)
    s_guarantor  = _guarantor_bonus(guarantor)

    # Weighted final score
    # Income ratio and employment stability are most important
    score = (
        s_income     * 0.35 +
        s_employment * 0.25 +
        s_debt       * 0.20 +
        s_documents  * 0.15 +
        s_guarantor  * 0.05
    )
    score = round(score, 1)

    debt_ratio = round(debts / income, 3) if income > 0 else 1.0

    # Recommendation
    if score >= CREDIT_ACCEPT:
        recommendation = "ACCEPT"
        rec_text = "✅ Dossier solide. Recommandation: ACCEPTER."
    elif score >= CREDIT_GUARANTEE:
        recommendation = "GUARANTEE"
        rec_text = "⚠️  Dossier moyen. Recommandation: DEMANDER UNE CAUTION ou garant."
    else:
        recommendation = "REFUSE"
        rec_text = "❌ Dossier insuffisant. Recommandation: REFUSER."

    # Explanation
    reasons = []
    if s_income < 60:
        reasons.append(f"loyer élevé par rapport au revenu ({rent}/{income} TND = {rent/income*100:.0f}%)")
    if s_debt < 50:
        reasons.append(f"taux d'endettement élevé ({debt_ratio*100:.1f}%)")
    if s_employment < 60:
        reasons.append(f"situation d'emploi précaire ({emp_type}, {emp_mos} mois)")
    if s_documents < 60:
        missing = [k for k, v in {
            "national_id": "pièce d'identité",
            "payslips_3months": "3 fiches de paie",
            "bank_statement": "relevé bancaire",
            "employment_contract": "contrat de travail",
            "tax_notice": "avis d'imposition"
        }.items() if not docs.get(k, False)]
        if missing:
            reasons.append("documents manquants: " + ", ".join(missing))

    if not reasons:
        explanation = f"{rec_text} Tous les critères sont satisfaits."
    else:
        explanation = f"{rec_text} Points d'attention: {'; '.join(reasons)}."

    return {
        "name"          : dossier.get("name", "Candidat"),
        "score"         : score,
        "recommendation": recommendation,
        "debt_ratio"    : debt_ratio,
        "breakdown"     : {
            "income_score"     : s_income,
            "debt_score"       : s_debt,
            "employment_score" : s_employment,
            "documents_score"  : s_documents,
            "guarantor_bonus"  : s_guarantor,
        },
        "explanation"   : explanation,
    }


# ── CLI demo ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Example 1: Strong candidate
    dossier_good = {
        "name"               : "Ahmed Ben Ali",
        "monthly_income"     : 2800,
        "rent_asked"         : 650,
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

    # Example 2: Risky candidate
    dossier_risky = {
        "name"               : "Sarra Mansouri",
        "monthly_income"     : 1200,
        "rent_asked"         : 700,
        "total_monthly_debts": 500,
        "employment_type"    : "CDD",
        "months_employed"    : 4,
        "has_guarantor"      : True,
        "documents": {
            "national_id"         : True,
            "payslips_3months"    : False,
            "bank_statement"      : True,
            "employment_contract" : False,
            "tax_notice"          : False,
        }
    }

    for dossier in [dossier_good, dossier_risky]:
        result = evaluate_candidate(dossier)
        print("\n" + "=" * 60)
        print(f"  CREDIT SCORE — {result['name']}")
        print("=" * 60)
        print(f"  Final score    : {result['score']} / 100")
        print(f"  Recommendation : {result['recommendation']}")
        print(f"  Debt ratio     : {result['debt_ratio']*100:.1f}%")
        print(f"\n  Breakdown:")
        for k, v in result["breakdown"].items():
            print(f"    {k:25s}: {v}")
        print(f"\n  {result['explanation']}")
