from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from agents.coordinator import ResearchCoordinator


app = FastAPI(
    title="NOVIA",
    description="Novel Orchestrated Virtual Intelligence Architecture",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# COORDINATOR
# =========================================================

coordinator = ResearchCoordinator()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "project": "NOVIA",
        "status": "running",
        "message": "NOVIA AI Research Laboratory is online"
    }


# =========================================================
# START RESEARCH
# =========================================================

@app.post("/research")
def start_research(
    research_question: str = Query(
        ...,
        description="Enter the research question for NOVIA"
    ),
    dataset_type: str = Query(
        "california_housing",
        description="Dataset type: california_housing or synthetic"
    ),
    max_cycles: int = Query(
        3,
        ge=1,
        le=5,
        description="Maximum number of autonomous research cycles"
    )
):

    return coordinator.start_research(
        research_question=research_question,
        dataset_type=dataset_type,
        max_cycles=max_cycles
    )


# =========================================================
# MEMORY
# =========================================================

@app.get("/memory")
def get_memory():

    return {
        "status": "success",
        "memory": coordinator.memory.get_all()
    }


@app.get("/memory/latest")
def get_latest_memory():

    return {
        "status": "success",
        "memory": coordinator.memory.get_latest()
    }


# =========================================================
# RESEARCH PROJECTS
# =========================================================

@app.get("/research/projects")
def get_research_projects():

    return {
        "status": "success",
        "research_projects":
            coordinator.research_manager.get_all_research()
    }


# =========================================================
# KNOWLEDGE GRAPH
# =========================================================

@app.get("/knowledge-graph")
def get_knowledge_graph():

    return {
        "status": "success",
        "knowledge_graph":
            coordinator.knowledge_graph.get_graph()
    }