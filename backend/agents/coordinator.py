from agents.research_agent import ResearchAgent
from agents.hypothesis_agent import HypothesisAgent
from agents.experiment_agent import ExperimentAgent
from agents.analysis_agent import AnalysisAgent
from agents.verification_agent import VerificationAgent
from agents.report_agent import ReportAgent
from agents.statistical_agent import StatisticalEvaluationAgent
from agents.dataset_agent import DatasetGenerationAgent
from agents.debate_agent import AgentDebate
from agents.failure_analysis_agent import FailureAnalysisAgent

from memory.research_memory import ResearchMemory
from research.research_manager import ResearchManager
from experiments.experiment_manager import ExperimentManager
from knowledge.knowledge_graph import KnowledgeGraph


class ResearchCoordinator:

    def __init__(self):

        self.research_agent = ResearchAgent()
        self.hypothesis_agent = HypothesisAgent()
        self.experiment_agent = ExperimentAgent()
        self.analysis_agent = AnalysisAgent()
        self.verification_agent = VerificationAgent()
        self.report_agent = ReportAgent()
        self.statistical_agent = StatisticalEvaluationAgent()
        self.dataset_agent = DatasetGenerationAgent()
        self.debate_agent = AgentDebate()
        self.failure_analysis_agent = FailureAnalysisAgent()

        self.memory = ResearchMemory()
        self.research_manager = ResearchManager()
        self.experiment_manager = ExperimentManager()
        self.knowledge_graph = KnowledgeGraph()

    def start_research(
        self,
        research_question: str,
        dataset_type: str = "california_housing",
        max_cycles: int = 2
    ):

        max_cycles = max(
            1,
            min(max_cycles, 10)
        )

        research_project = self.research_manager.create_research(
            research_question
        )

        research_id = research_project["id"]

        research_node_id = f"research_{research_id}"

        self.knowledge_graph.add_node(
            research_node_id,
            "research_question",
            research_question
        )

        # =========================================================
        # LITERATURE RESEARCH
        # =========================================================

        literature = self.research_agent.research(
            research_question
        )

        literature_sources = literature.get(
            "results",
            []
        )

        for index, source in enumerate(
            literature_sources,
            start=1
        ):

            source_id = f"source_{research_id}_{index}"

            self.knowledge_graph.add_node(
                source_id,
                "literature_source",
                source.get("title") or f"Source {index}",
                {
                    "url": source.get("url"),
                    "content": source.get("content")
                }
            )

            self.knowledge_graph.add_relationship(
                research_node_id,
                "HAS_SOURCE",
                source_id
            )

        # =========================================================
        # DATASET GENERATION
        # =========================================================

        generated_dataset = None
        dataset_info = None

        if dataset_type.lower() == "synthetic":

            generated_dataset = (
                self.dataset_agent.generate_dataset(
                    research_question
                )
            )

            dataset_info = generated_dataset["info"]

            dataset_node_id = (
                f"dataset_{research_id}"
            )

            self.knowledge_graph.add_node(
                dataset_node_id,
                "dataset",
                dataset_info["dataset_name"],
                {
                    "generation_method":
                        dataset_info["generation_method"],
                    "rows":
                        dataset_info["rows"],
                    "features":
                        dataset_info["features"],
                    "target":
                        dataset_info["target"],
                    "noise":
                        dataset_info["noise"],
                    "random_state":
                        dataset_info["random_state"]
                }
            )

            self.knowledge_graph.add_relationship(
                research_node_id,
                "USES_DATASET",
                dataset_node_id
            )

        # =========================================================
        # ITERATIVE RESEARCH LOOP
        # =========================================================

        cycles = []

        current_hypothesis = (
            self.hypothesis_agent.generate_hypothesis(
                research_question
            )
        )

        for cycle_number in range(
            1,
            max_cycles + 1
        ):

            cycle_result = self._run_cycle(
                research_id=research_id,
                research_node_id=research_node_id,
                cycle_number=cycle_number,
                research_question=research_question,
                hypothesis=current_hypothesis,
                generated_dataset=generated_dataset,
                dataset_info=dataset_info
            )

            cycles.append(
                cycle_result
            )

            verification = cycle_result[
                "verification"
            ]

            if not verification.get(
                "verification_passed",
                False
            ):

                break

            if cycle_number < max_cycles:

                current_hypothesis = (
                    self.hypothesis_agent.generate_next_hypothesis(
                        verification
                    )
                )

        # =========================================================
        # FINAL RESULT
        # =========================================================

        result = {
            "research_project": research_project,

            "max_cycles": max_cycles,

            "cycles_completed": len(
                cycles
            ),

            "dataset_generation": dataset_info,

            "literature_research": literature,

            "cycles": cycles,

            "knowledge_graph":
                self.knowledge_graph.get_graph()
        }

        self.memory.store(
            result
        )

        return result

    def _run_cycle(
        self,
        research_id,
        research_node_id,
        cycle_number,
        research_question,
        hypothesis,
        generated_dataset=None,
        dataset_info=None
    ):

        hypothesis_text = hypothesis[
            "hypothesis"
        ]

        # =========================================================
        # HYPOTHESIS
        # =========================================================

        hypothesis_node_id = (
            f"hypothesis_{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            hypothesis_node_id,
            "hypothesis",
            hypothesis_text
        )

        self.knowledge_graph.add_relationship(
            research_node_id,
            "GENERATES",
            hypothesis_node_id
        )

        # =========================================================
        # REPRODUCIBILITY CONFIGURATION
        # =========================================================

        random_state = 42
        test_size = 0.2

        model_config = {
            "Linear Regression": {},
            "Random Forest": {
                "n_estimators": 100,
                "random_state": 42,
                "n_jobs": -1
            },
            "Gradient Boosting": {
                "n_estimators": 100,
                "random_state": 42
            }
        }

        selected_dataset = (
            dataset_info["dataset_name"]
            if dataset_info
            else "California Housing Dataset"
        )

        # =========================================================
        # EXPERIMENT
        # =========================================================

        experiment = (
            self.experiment_manager.create_experiment(
                hypothesis=hypothesis_text,
                dataset_name=selected_dataset,
                random_state=random_state,
                test_size=test_size,
                model_config=model_config
            )
        )

        experiment_id = experiment[
            "id"
        ]

        experiment_node_id = (
            f"experiment_{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            experiment_node_id,
            "experiment",
            f"Experiment {experiment_id}",
            {
                "version":
                    experiment.get("version"),

                "hypothesis":
                    hypothesis_text,

                "reproducibility":
                    experiment.get(
                        "reproducibility",
                        {}
                    )
            }
        )

        self.knowledge_graph.add_relationship(
            hypothesis_node_id,
            "TESTED_BY",
            experiment_node_id
        )

        # =========================================================
        # REPRODUCIBILITY NODE
        # =========================================================

        reproducibility_node_id = (
            f"reproducibility_"
            f"{research_id}_{cycle_number}"
        )

        reproducibility_data = (
            experiment.get(
                "reproducibility",
                {}
            )
        )

        self.knowledge_graph.add_node(
            reproducibility_node_id,
            "reproducibility",
            f"Reproducibility {cycle_number}",
            reproducibility_data
        )

        self.knowledge_graph.add_relationship(
            experiment_node_id,
            "HAS_REPRODUCIBILITY_CONFIG",
            reproducibility_node_id
        )

        # =========================================================
        # EXECUTION
        # =========================================================

        execution = self.experiment_agent.run_experiment(
            hypothesis_text,
            dataset_data=(
                generated_dataset["data"]
                if generated_dataset
                else None
            ),
            dataset_name=(
                dataset_info["dataset_name"]
                if dataset_info
                else None
            )
        )

        models = execution.get(
            "models",
            {}
        )

        for model_name, model_metrics in models.items():

            model_node_id = (
                f"model_{research_id}_{cycle_number}_"
                f"{model_name.lower().replace(' ', '_')}"
            )

            self.knowledge_graph.add_node(
                model_node_id,
                "model",
                model_name,
                model_metrics
            )

            self.knowledge_graph.add_relationship(
                experiment_node_id,
                "USES_MODEL",
                model_node_id
            )

        # =========================================================
        # ANALYSIS
        # =========================================================

        analysis = (
            self.analysis_agent.analyze_results(
                execution
            )
        )

        analysis_node_id = (
            f"analysis_{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            analysis_node_id,
            "analysis",
            f"Analysis {cycle_number}",
            {
                "best_model_by_r2":
                    analysis.get(
                        "best_model_by_r2"
                    ),

                "findings":
                    analysis.get(
                        "findings"
                    )
            }
        )

        self.knowledge_graph.add_relationship(
            experiment_node_id,
            "PRODUCED",
            analysis_node_id
        )

        # =========================================================
        # STATISTICAL EVALUATION
        # =========================================================

        statistical_data = execution.get(
            "statistical_data"
        )

        statistical_evaluation = None

        if statistical_data:

            statistical_evaluation = (
                self.statistical_agent.evaluate(
                    model_a=statistical_data[
                        "model_a"
                    ],
                    model_b=statistical_data[
                        "model_b"
                    ],
                    actual_values=statistical_data[
                        "actual_values"
                    ],
                    predictions_a=statistical_data[
                        "predictions_a"
                    ],
                    predictions_b=statistical_data[
                        "predictions_b"
                    ]
                )
            )

        statistical_node_id = (
            f"statistics_{research_id}_{cycle_number}"
        )

        if statistical_evaluation:

            self.knowledge_graph.add_node(
                statistical_node_id,
                "statistical_evaluation",
                "Statistical Evaluation",
                {
                    "test":
                        statistical_evaluation.get(
                            "test"
                        ),

                    "p_value":
                        statistical_evaluation.get(
                            "p_value"
                        ),

                    "alpha":
                        statistical_evaluation.get(
                            "alpha"
                        ),

                    "statistically_significant":
                        statistical_evaluation.get(
                            "statistically_significant"
                        ),

                    "interpretation":
                        statistical_evaluation.get(
                            "interpretation"
                        )
                }
            )

            self.knowledge_graph.add_relationship(
                analysis_node_id,
                "EVALUATED_STATISTICALLY",
                statistical_node_id
            )

        # =========================================================
        # AGENT DEBATE
        # =========================================================

        debate = (
            self.debate_agent.conduct_debate(
                hypothesis=hypothesis_text,
                analysis_results=analysis,
                statistical_evaluation=
                    statistical_evaluation
            )
        )

        debate_node_id = (
            f"debate_{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            debate_node_id,
            "agent_debate",
            f"Agent Debate {cycle_number}",
            {
                "best_model":
                    debate["evidence"].get(
                        "best_model"
                    ),

                "statistically_significant":
                    debate["evidence"].get(
                        "statistically_significant"
                    ),

                "debate_conclusion":
                    debate.get(
                        "debate_conclusion"
                    )
            }
        )

        self.knowledge_graph.add_relationship(
            analysis_node_id,
            "DEBATED_BY",
            debate_node_id
        )

        if statistical_evaluation:

            self.knowledge_graph.add_relationship(
                statistical_node_id,
                "CONSIDERED_BY",
                debate_node_id
            )

        # =========================================================
        # VERIFICATION
        # =========================================================

        verification = (
            self.verification_agent.verify_results(
                analysis
            )
        )

        verification_node_id = (
            f"verification_{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            verification_node_id,
            "verification",
            f"Verification {cycle_number}",
            {
                "verification_passed":
                    verification.get(
                        "verification_passed"
                    ),

                "verified_model":
                    verification.get(
                        "verified_model"
                    )
            }
        )

        self.knowledge_graph.add_relationship(
            debate_node_id,
            "VERIFIED_BY",
            verification_node_id
        )

        # =========================================================
        # FAILURE ANALYSIS
        # =========================================================

        failure_analysis = (
            self.failure_analysis_agent.analyze_failure(
                verification_results=verification,
                analysis_results=analysis,
                statistical_evaluation=
                    statistical_evaluation
            )
        )

        failure_node_id = (
            f"failure_analysis_"
            f"{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            failure_node_id,
            "failure_analysis",
            f"Failure Analysis {cycle_number}",
            {
                "experiment_status":
                    failure_analysis.get(
                        "experiment_status"
                    ),

                "verification_passed":
                    failure_analysis.get(
                        "verification_passed"
                    ),

                "identified_issues":
                    failure_analysis.get(
                        "identified_issues"
                    ),

                "recommended_next_action":
                    failure_analysis.get(
                        "recommended_next_action"
                    )
            }
        )

        self.knowledge_graph.add_relationship(
            verification_node_id,
            "ANALYZED_BY",
            failure_node_id
        )

        # =========================================================
        # REPORT
        # =========================================================

        report = (
            self.report_agent.generate_report(
                verification
            )
        )

        report_node_id = (
            f"report_{research_id}_{cycle_number}"
        )

        self.knowledge_graph.add_node(
            report_node_id,
            "report",
            f"Research Report {cycle_number}",
            {
                "conclusion":
                    report.get(
                        "conclusion"
                    )
            }
        )

        self.knowledge_graph.add_relationship(
            verification_node_id,
            "GENERATED_REPORT",
            report_node_id
        )

        # =========================================================
        # CLEAN EXECUTION
        # =========================================================

        clean_execution = {
            key: value
            for key, value in execution.items()
            if key != "statistical_data"
        }

        # =========================================================
        # FINAL CYCLE RESULT
        # =========================================================

        return {
            "cycle": cycle_number,

            "hypothesis": hypothesis,

            "experiment": experiment,

            "reproducibility":
                reproducibility_data,

            "execution":
                clean_execution,

            "analysis":
                analysis,

            "statistical_evaluation":
                statistical_evaluation,

            "agent_debate":
                debate,

            "verification":
                verification,

            "failure_analysis":
                failure_analysis,

            "report":
                report
        }