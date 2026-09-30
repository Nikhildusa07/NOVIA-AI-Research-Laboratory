class ResearchManager:
    def __init__(self):
        self.research_projects = []

    def create_research(self, research_question: str):
        research = {
            "id": len(self.research_projects) + 1,
            "research_question": research_question,
            "status": "created"
        }

        self.research_projects.append(research)

        return research

    def get_all_research(self):
        return self.research_projects