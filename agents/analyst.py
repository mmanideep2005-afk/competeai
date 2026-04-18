from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
load_dotenv()

def run_analyst(company: str, raw_research: str) -> str:
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)
    print("\n[ANALYST] Extracting insights...")

    response = llm.invoke([
        HumanMessage(content=f"""You are a senior business analyst.

Given this research about {company}, produce a structured analysis:

**SWOT:**
- Strengths: (3-4 bullet points with evidence from research)
- Weaknesses: (3-4 bullet points)
- Opportunities: (2-3 bullet points)
- Threats: (2-3 bullet points)

**Market Position:** (leader / challenger / niche — explain why)

**Business Model:** (how they make money)

**Technology Assessment:** (tech stack, AI usage)

**Growth Trajectory:** (growing/stable/declining with evidence)

**Competitive Advantages:** (what moat do they have)

**Key Risks:** (top 3 risks)

Use specific facts and numbers from the research below. No vague statements.

Research:
{raw_research}""")
    ])

    return response.content