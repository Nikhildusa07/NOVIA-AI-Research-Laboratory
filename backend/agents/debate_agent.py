class AgentDebate:

    def __init__(self):
        self.name = "NOVIA Agent Debate System"

    def conduct_debate(
        self,
        hypothesis,
        analysis_results,
        statistical_evaluation
    ):

        comparison = analysis_results.get(
            "comparison",
            {}
        )

        best_model = analysis_results.get(
            "best_model_by_r2"
        )

        findings = analysis_results.get(
            "findings",
            []
        )

        statistically_significant = False

        if statistical_evaluation:

            statistically_significant = (
                statistical_evaluation.get(
                    "statistically_significant",
                    False
                )
            )

        # =========================================================
        # RESEARCHER ARGUMENT
        # =========================================================

        researcher_argument = (
            f"The experimental results support the hypothesis because "
            f"{best_model} achieved the highest R2 score among the "
            f"evaluated models."
        )

        if statistically_significant:

            researcher_argument += (
                " The statistical evaluation also indicates that "
                "the difference in prediction error is statistically "
                "significant."
            )

        else:

            researcher_argument += (
                " However, the statistical evaluation does not "
                "provide statistically significant evidence for "
                "a difference between the models."
            )

        # =========================================================
        # CRITIC ARGUMENT
        # =========================================================

        critic_argument = (
            "The result should not be treated as universally conclusive. "
            "The experiment uses a specific dataset, train-test split, "
            "and model configuration. Different datasets, random seeds, "
            "or hyperparameters could produce different results."
        )

        if not statistically_significant:

            critic_argument += (
                " The lack of statistical significance further limits "
                "the strength of the conclusion."
            )

        # =========================================================
        # DEBATE CONCLUSION
        # =========================================================

        if statistically_significant:

            debate_conclusion = (
                f"The researcher argument is supported by the "
                f"experimental and statistical evidence, while the "
                f"critic identifies limitations related to dataset "
                f"and experimental configuration. The current evidence "
                f"supports {best_model} for this experiment, but further "
                f"experiments are required before generalizing the result."
            )

        else:

            debate_conclusion = (
                "The evidence is insufficient to establish a strong "
                "difference between the evaluated models. Further "
                "experiments are required."
            )

        return {
            "agent": self.name,
            "status": "debate_completed",

            "hypothesis": hypothesis,

            "researcher": {
                "role": "Researcher Agent",
                "argument": researcher_argument
            },

            "critic": {
                "role": "Critic Agent",
                "argument": critic_argument
            },

            "evidence": {
                "best_model": best_model,
                "comparison": comparison,
                "statistically_significant":
                    statistically_significant,
                "findings": findings
            },

            "debate_conclusion": debate_conclusion
        }