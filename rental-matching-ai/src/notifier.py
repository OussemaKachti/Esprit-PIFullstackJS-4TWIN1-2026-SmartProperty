"""
notifier.py — Send a daily email to each candidate with their top 3 property matches.

Setup:
  1. Create a .env file in the project root with:
       EMAIL_SENDER=your_email@gmail.com
       EMAIL_PASSWORD=your_app_password   ← use Gmail App Password, not real password
  2. Run once manually to test:
       python src/notifier.py
  3. Schedule with cron (Linux/Mac) to run daily at 08:00:
       0 8 * * * /path/to/venv/bin/python /path/to/project/src/notifier.py

Gmail App Password setup:
  Google Account → Security → 2-Step Verification → App Passwords
"""

import smtplib
import os
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from config import (
    EMAIL_SENDER, EMAIL_PASSWORD,
    EMAIL_SMTP_HOST, EMAIL_SMTP_PORT,
    TOP_N_MATCHES
)
from src.matching_engine import find_top_matches

load_dotenv()


# ── email builder ─────────────────────────────────────────────────────────────

def _build_email_html(candidate_name, matches):
    """Build a clean HTML email body with the top N matches."""
    today = date.today().strftime("%d %B %Y")

    rows = ""
    for m in matches:
        color = "#2ecc71" if m["score_pct"] >= 75 else "#f39c12" if m["score_pct"] >= 50 else "#e74c3c"
        rows += f"""
        <tr>
          <td style="padding:12px;font-size:22px;font-weight:bold;color:{color};">
            #{m['rank']}
          </td>
          <td style="padding:12px;">
            <strong>{m['category']}</strong><br>
            📍 {m['city']} — {m['region']}<br>
            🛏 {int(m['room_count'])} chambre(s) &nbsp; 📐 {m['size']:.0f} m²
          </td>
          <td style="padding:12px;text-align:right;">
            <span style="font-size:20px;font-weight:bold;">{m['price']:.0f} TND</span>
            <br><small>/mois</small>
          </td>
          <td style="padding:12px;">
            <span style="background:{color};color:white;padding:4px 10px;
                         border-radius:20px;font-weight:bold;">
              {m['score_pct']}%
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="4" style="padding:4px 12px 16px 12px;color:#555;font-size:13px;
                                  border-bottom:1px solid #eee;">
            💡 {m['explanation']}
          </td>
        </tr>
        """

    html = f"""
    <html><body style="font-family:Arial,sans-serif;max-width:620px;margin:auto;">
      <div style="background:#2c3e50;color:white;padding:24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">🏠 Vos meilleures correspondances</h2>
        <p style="margin:6px 0 0;opacity:0.8;">Bonjour {candidate_name} — {today}</p>
      </div>

      <div style="background:#f8f9fa;padding:20px;">
        <p>Voici vos <strong>top {TOP_N_MATCHES} biens</strong> sélectionnés pour vous aujourd'hui :</p>

        <table width="100%" cellspacing="0" style="background:white;border-radius:8px;
               box-shadow:0 1px 4px rgba(0,0,0,0.1);">
          {rows}
        </table>

        <p style="color:#888;font-size:12px;margin-top:20px;">
          Ce message est généré automatiquement par le système de matching IA.<br>
          Conformément au RGPD, vos données sont traitées de façon confidentielle.
        </p>
      </div>
    </body></html>
    """
    return html


# ── send function ─────────────────────────────────────────────────────────────

def send_match_email(candidate):
    """
    Find top matches for a candidate and send them an email.

    candidate dict must include:
        name        (str)  candidate's name
        email       (str)  recipient email address
        + all fields required by find_top_matches (budget_max, city, etc.)
    """
    sender   = os.getenv("EMAIL_SENDER", EMAIL_SENDER)
    password = os.getenv("EMAIL_PASSWORD", EMAIL_PASSWORD)

    if not password:
        print("⚠️  EMAIL_PASSWORD not set in .env — skipping email send.")
        print("   (To test without email, call find_top_matches() directly.)")
        return False

    matches = find_top_matches(candidate)
    if not matches:
        print(f"  No matches found for {candidate['name']}, skipping.")
        return False

    html_body = _build_email_html(candidate["name"], matches)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🏠 Vos {TOP_N_MATCHES} meilleures offres du {date.today().strftime('%d/%m/%Y')}"
    msg["From"]    = sender
    msg["To"]      = candidate["email"]
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(EMAIL_SMTP_HOST, EMAIL_SMTP_PORT) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, candidate["email"], msg.as_string())
        print(f"  ✅  Email sent to {candidate['name']} <{candidate['email']}>")
        return True
    except Exception as e:
        print(f"  ❌  Failed to send email to {candidate['email']}: {e}")
        return False


def notify_all_candidates(candidates):
    """Send match emails to a list of candidates."""
    print(f"\nSending daily notifications to {len(candidates)} candidate(s)...")
    for c in candidates:
        send_match_email(c)


# ── CLI demo ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Demo: show what the email would contain (without actually sending)
    candidate = {
        "name"                 : "Ahmed Ben Ali",
        "email"                : "amineftwdiamond@gmail.com",
        "budget_max"           : 800,
        "city"                 : "Tunis",
        "min_rooms"            : 2,
        "preferred_categories" : ["Appartements", "Maisons et Villas"],
        "min_size"             : 70,
    }

    print("\n" + "=" * 60)
    print("  NOTIFIER — Daily Match Preview")
    print("=" * 60)
    print(f"  Candidate : {candidate['name']} <{candidate['email']}>")

    matches = find_top_matches(candidate)
    print(f"\n  Top {len(matches)} matches that would be emailed:")
    for m in matches:
        print(f"    #{m['rank']} {m['score_pct']}% — {m['category']}, "
              f"{m['city']}, {m['price']:.0f} TND/month")

    print("\n  (Set EMAIL_SENDER and EMAIL_PASSWORD in .env to send real emails)")
    print("  Run: send_match_email(candidate) to send.")
