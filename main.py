import warnings
warnings.filterwarnings("ignore")
import sys
from dotenv import load_dotenv
load_dotenv()

from graph.workflow import run_pipeline
from db.postgres_client import save_report, list_reports

def main():
    print("=" * 58)
    print("   CompeteAI — Multi-Agent Competitive Intelligence")
    print("   Stack: LangGraph + LangChain + Groq + MCP + Supabase")
    print("=" * 58)

    # Accept company name from command line or prompt
    if len(sys.argv) > 1:
        company = " ".join(sys.argv[1:])
    else:
        company = input("\nCompany to research: ").strip()

    if not company:
        print("Please provide a company name.")
        sys.exit(1)

    print(f"\nStarting pipeline for: {company}\n")

    # Run the full LangGraph multi-agent pipeline
    final_state = run_pipeline(company)

    # Print the finished report
    print("\n" + "=" * 58)
    print("FINAL REPORT")
    print("=" * 58)
    print(final_state["report"])

    # Save to Supabase
    record_id = save_report(final_state)

    # Also save locally as a Markdown file
    filename = company.replace(" ", "_").lower() + "_report.md"
    with open(filename, "w") as f:
        f.write(final_state["report"])

    score = (final_state.get("review") or {}).get("overall_score", "N/A")
    print(f"\nDone! Quality score: {score}/10")
    print(f"Saved locally:      {filename}")
    print(f"Saved to PostgreSQL (Docker): {record_id}")

if __name__ == "__main__":
    main()