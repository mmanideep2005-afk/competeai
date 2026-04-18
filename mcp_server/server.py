import asyncio
import json
from mcp.server.models import InitializationOptions
from mcp.server import Server
from mcp.types import Tool, TextContent
import mcp.server.stdio

from mcp_server.tools import web_search, scrape_page, sentiment_check

app = Server("competeai-mcp")

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="web_search",
            description="Search the web for recent information about a company or topic.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "max_results": {"type": "integer", "default": 6}
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="scrape_page",
            description="Extract clean text from a webpage URL.",
            inputSchema={
                "type": "object",
                "properties": {"url": {"type": "string"}},
                "required": ["url"]
            }
        ),
        Tool(
            name="sentiment_check",
            description="Analyse sentiment of text about a company (positive/negative/neutral).",
            inputSchema={
                "type": "object",
                "properties": {"text": {"type": "string"}},
                "required": ["text"]
            }
        ),
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "web_search":
        result = web_search(arguments["query"], arguments.get("max_results", 6))
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    elif name == "scrape_page":
        result = scrape_page(arguments["url"])
        return [TextContent(type="text", text=result)]

    elif name == "sentiment_check":
        result = sentiment_check(arguments["text"])
        return [TextContent(type="text", text=json.dumps(result))]

    return [TextContent(type="text", text=f"Unknown tool: {name}")]

async def run():
    async with mcp.server.stdio.stdio_server() as (r, w):
        await app.run(
            r, w,
            InitializationOptions(
                server_name="competeai-mcp",
                server_version="1.0.0",
                capabilities=app.get_capabilities(
                    notification_options=None,
                    experimental_capabilities={}
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(run())