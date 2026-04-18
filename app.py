import warnings
warnings.filterwarnings("ignore")

import asyncio
import json
import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CompeteAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/research")
async def research(company: str):
    async def generate():
        loop = asyncio.get_event_loop()

        def sse(data: dict) -> str:
            return f"data: {json.dumps(data)}\n\n"

        try:
            from agents.researcher import run_researcher
            from agents.analyst    import run_analyst
            from agents.writer     import run_writer
            from agents.critic     import run_critic
            from db.postgres_client import save_report

            # ── Researcher ──────────────────────────────────────────
            yield sse({"step": "researcher", "status": "running"})
            raw = await loop.run_in_executor(None, run_researcher, company)
            yield sse({"step": "researcher", "status": "done"})

            # ── Analyst ─────────────────────────────────────────────
            yield sse({"step": "analyst", "status": "running"})
            analysis = await loop.run_in_executor(None, run_analyst, company, raw)
            yield sse({"step": "analyst", "status": "done"})

            # ── Writer ──────────────────────────────────────────────
            yield sse({"step": "writer", "status": "running"})
            report = await loop.run_in_executor(None, run_writer, company, analysis)
            yield sse({"step": "writer", "status": "done"})

            # ── Critic ──────────────────────────────────────────────
            yield sse({"step": "critic", "status": "running"})
            review = await loop.run_in_executor(None, run_critic, report)

            # Self-correction loop — if score below 7, rewrite once
            if not review.get("approved"):
                yield sse({
                    "step":     "critic",
                    "status":   "revising",
                    "feedback": review.get("feedback", "")
                })
                enhanced = analysis + f"\n\nCRITIC REVISION REQUEST: {review.get('feedback')}"
                report   = await loop.run_in_executor(None, run_writer, company, enhanced)
                review   = await loop.run_in_executor(None, run_critic, report)

            yield sse({
                "step":   "critic",
                "status": "done",
                "score":  review.get("overall_score")
            })

            # ── Save to PostgreSQL ───────────────────────────────────
            state = {
                "company_name": company,
                "report":       report,
                "analysis":     analysis,
                "raw_research": raw,
                "review":       review,
                "status":       "complete"
            }
            record_id = await loop.run_in_executor(None, save_report, state)

            # ── Done — send full report to frontend ──────────────────
            yield sse({
                "step":      "complete",
                "report":    report,
                "score":     review.get("overall_score"),
                "record_id": record_id,
                "scores": {
                    "completeness":  review.get("completeness"),
                    "specificity":   review.get("specificity"),
                    "actionability": review.get("actionability"),
                    "readability":   review.get("readability"),
                }
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            yield sse({"step": "error", "message": str(e)})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control":    "no-cache",
            "X-Accel-Buffering": "no",
            "Connection":       "keep-alive",
        }
    )