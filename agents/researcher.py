import json
import sys
import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mcp_server.tools import web_search as _search, scrape_page as _scrape

def run_researcher(company: str) -> str:
    """
    Researcher agent — runs targeted searches, scrapes key pages,
    then asks the LLM to synthesise everything into structured findings.
    
    Interview line: 'Rather than an agentic loop I use a deterministic 
    research plan — fixed queries, parallel scraping, then one LLM 
    synthesis call. More predictable and cheaper at scale.'
    """
    print(f"\n[RESEARCHER] Researching {company}...")

    # ── Step 1: Run targeted searches ────────────────────────────────
    queries = [
        f"{company} company overview product",
        f"{company} funding revenue business model",
        f"{company} latest news 2024 2025",
        f"{company} competitors market position",
        f"{company} technology AI stack",
    ]

    all_results = []
    for q in queries:
        print(f"   -> searching: {q}")
        try:
            results = _search(q, max_results=3)
            all_results.extend(results)
        except Exception as e:
            print(f"   -> search failed: {e}")

    # ── Step 2: Scrape top URLs ───────────────────────────────────────
    scraped = []
    seen_urls = set()
    scrape_count = 0

    for r in all_results:
        url = r.get("url", "")
        if scrape_count >= 3:
            break
        if not url or url in seen_urls:
            continue
        if any(x in url for x in ["youtube.com", "twitter.com", "facebook.com"]):
            continue
        seen_urls.add(url)
        print(f"   -> scraping: {url[:60]}")
        try:
            text = _scrape(url)
            if len(text) > 200:
                scraped.append(f"SOURCE: {url}\n{text[:1500]}")
                scrape_count += 1
        except Exception as e:
            print(f"   -> scrape failed: {e}")

    # ── Step 3: Format all raw data ───────────────────────────────────
    search_text = "\n\n".join([
        f"[{r.get('title', '')}] {r.get('url', '')}\n{r.get('snippet', r.get('content', ''))}"
        for r in all_results
    ])

    scraped_text = "\n\n---\n\n".join(scraped) if scraped else "No pages scraped."

    # ── Step 4: LLM synthesis ─────────────────────────────────────────
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

    prompt = f"""You are a senior business researcher. Based on the raw search results and scraped pages below, 
write a comprehensive research summary about: {company}

Cover these areas with specific facts and numbers where available:
1. What the company does (core product or service)
2. Founding year, headquarters, team size
3. Business model and how they make money  
4. Funding history or revenue figures
5. Recent news and developments (2024-2025)
6. Key competitors
7. Technology stack and AI/ML angle
8. Notable achievements or milestones

Be specific. Use real numbers, names, dates from the sources below.

=== SEARCH RESULTS ===
{search_text[:4000]}

=== SCRAPED PAGES ===
{scraped_text[:3000]}
"""

    print(f"   -> synthesising findings with LLM...")
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content