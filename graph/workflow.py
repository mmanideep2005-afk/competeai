from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv
load_dotenv()

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from agents.researcher import run_researcher
from agents.analyst   import run_analyst
from agents.writer    import run_writer
from agents.critic    import run_critic

class ResearchState(TypedDict):
    company_name:   str
    raw_research:   Optional[str]
    analysis:       Optional[str]
    report:         Optional[str]
    review:         Optional[dict]
    revision_count: int
    status:         str

def researcher_node(state: ResearchState) -> ResearchState:
    print(f"\n[RESEARCHER] Starting research on: {state['company_name']}")
    research = run_researcher(state["company_name"])
    return {**state, "raw_research": research, "status": "researched"}

def analyst_node(state: ResearchState) -> ResearchState:
    print("\n[ANALYST] Extracting insights from research...")
    analysis = run_analyst(state["company_name"], state["raw_research"])
    return {**state, "analysis": analysis, "status": "analyzed"}

def writer_node(state: ResearchState) -> ResearchState:
    print("\n[WRITER] Drafting report...")
    report = run_writer(state["company_name"], state["analysis"])
    return {**state, "report": report, "status": "written"}

def critic_node(state: ResearchState) -> ResearchState:
    print("\n[CRITIC] Reviewing report quality...")
    review = run_critic(state["report"])
    score  = review.get("overall_score", 0)
    print(f"         Score: {score}/10 — {'APPROVED' if review.get('approved') else 'NEEDS REVISION'}")
    print(f"         Feedback: {review.get('feedback')}")
    return {**state, "review": review, "status": "reviewed"}

def route_after_critic(state: ResearchState) -> str:
    """
    This is the self-correction logic.
    Approved → END, Not approved (max 2 retries) → back to writer.
    """
    review         = state.get("review", {})
    revision_count = state.get("revision_count", 0)

    if review.get("approved") or revision_count >= 2:
        return "finish"
    return "revise"

def revision_node(state: ResearchState) -> ResearchState:
    """Inject critic feedback into analysis so writer improves next draft."""
    feedback = state["review"].get("feedback", "")
    enhanced = state["analysis"] + f"\n\n[CRITIC REVISION REQUEST #{state['revision_count']+1}]: {feedback}"
    return {
        **state,
        "analysis": enhanced,
        "revision_count": state.get("revision_count", 0) + 1,
        "status": "revising"
    }

def build_graph():
    g = StateGraph(ResearchState)

    g.add_node("researcher", researcher_node)
    g.add_node("analyst",    analyst_node)
    g.add_node("writer",     writer_node)
    g.add_node("critic",     critic_node)
    g.add_node("revise",     revision_node)

    g.set_entry_point("researcher")
    g.add_edge("researcher", "analyst")
    g.add_edge("analyst",    "writer")
    g.add_edge("writer",     "critic")

    g.add_conditional_edges(
        "critic",
        route_after_critic,
        {"revise": "revise", "finish": END}
    )
    g.add_edge("revise", "writer")   # loop back

    return g.compile()

def run_pipeline(company_name: str) -> ResearchState:
    graph = build_graph()
    initial = ResearchState(
        company_name   = company_name,
        raw_research   = None,
        analysis       = None,
        report         = None,
        review         = None,
        revision_count = 0,
        status         = "starting"
    )
    return graph.invoke(initial)