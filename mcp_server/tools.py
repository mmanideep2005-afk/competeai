import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

def web_search(query: str, max_results: int = 6) -> list[dict]:
 
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):
            results.append({
                "title": r["title"],
                "url":   r["href"],
                "snippet": r["body"]
            })
    return results

def scrape_page(url: str) -> str:
    
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; CompeteAI/1.0)"}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        lines = [line.strip() for line in soup.get_text(separator="\n").splitlines() if line.strip()]
        return "\n".join(lines[:120])   # first 120 non-empty lines
    except Exception as e:
        return f"Could not scrape {url}: {e}"

def sentiment_check(text: str) -> dict:
   
    positive = ["growth", "profit", "revenue", "funding", "launch", "partnership",
                "award", "expand", "hire", "success", "innovation", "leading"]
    negative = ["layoff", "lawsuit", "loss", "decline", "controversy", "scandal",
                "debt", "breach", "fine", "shutdown", "fraud", "recall"]

    text_lower = text.lower()
    pos = sum(1 for w in positive if w in text_lower)
    neg = sum(1 for w in negative if w in text_lower)

    return {
        "sentiment": "positive" if pos > neg else ("negative" if neg > pos else "neutral"),
        "positive_signals": pos,
        "negative_signals": neg,
        "confidence": abs(pos - neg) / max(pos + neg, 1)
    }