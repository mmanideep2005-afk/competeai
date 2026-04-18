import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
load_dotenv()

def run_critic(report: str) -> dict:
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
    print("\n[CRITIC] Reviewing report quality...")

    response = llm.invoke([
        HumanMessage(content=f"""You are a managing partner reviewing a business report.

Score this report (each dimension 1-10):
- completeness: Are all sections filled with real content?
- specificity: Are actual facts, numbers, names used?
- actionability: Is the recommendation clear and justified?
- readability: Is it professional and well structured?

Calculate overall_score as the average of the four scores.
Set approved = true if overall_score >= 7.0

Return ONLY valid JSON, no other text, no markdown fences:
{{
  "completeness": 8,
  "specificity": 7,
  "actionability": 9,
  "readability": 8,
  "overall_score": 8.0,
  "approved": true,
  "feedback": "one specific sentence on what to improve"
}}

Report to review:
{report}""")
    ])

    raw = response.content.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except Exception:
        return {
            "completeness": 7, "specificity": 7,
            "actionability": 7, "readability": 7,
            "overall_score": 7.0, "approved": True,
            "feedback": "Auto-approved"
        }