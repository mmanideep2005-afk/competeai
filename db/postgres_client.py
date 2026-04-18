import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME", "competeai"),
        user=os.getenv("DB_USER", "competeai"),
        password=os.getenv("DB_PASSWORD", "competeai123")
    )

def save_report(state: dict) -> str:
    """Save a completed research pipeline result to PostgreSQL."""
    review = state.get("review") or {}

    conn = get_connection()
    cur  = conn.cursor()

    cur.execute("""
        INSERT INTO reports
            (company, report_md, analysis, raw_research, quality_score, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        state["company_name"],
        state.get("report", ""),
        state.get("analysis", ""),
        state.get("raw_research", ""),
        review.get("overall_score"),
        state.get("status", "complete"),
    ))

    record_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    print(f"\n[DB] Report saved to PostgreSQL. ID: {record_id}")
    return str(record_id)

def list_reports() -> list:
    """Fetch all saved reports ordered by newest first."""
    conn = get_connection()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT id, company, quality_score, created_at
        FROM reports
        ORDER BY created_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]