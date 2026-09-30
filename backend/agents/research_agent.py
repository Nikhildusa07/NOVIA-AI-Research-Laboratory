import os

from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()


class ResearchAgent:
    def __init__(self):
        self.name = "NOVIA Research Agent"

        api_key = os.getenv("TAVILY_API_KEY")

        if not api_key:
            raise ValueError("TAVILY_API_KEY is missing from .env")

        self.tavily = TavilyClient(api_key=api_key)

    def research(self, research_question: str):
        try:
            response = self.tavily.search(
                query=research_question,
                search_depth="advanced",
                max_results=5
            )

            results = []

            for result in response.get("results", []):
                results.append({
                    "title": result.get("title"),
                    "url": result.get("url"),
                    "content": result.get("content")
                })

            return {
                "agent": self.name,
                "research_question": research_question,
                "status": "research_completed",
                "source": "Tavily",
                "results": results
            }

        except Exception as error:
            return {
                "agent": self.name,
                "research_question": research_question,
                "status": "research_failed",
                "error": str(error)
            }