class AnalysisAgent:

    def __init__(self):
        self.name = "NOVIA Analysis Agent"

    def analyze_results(self, execution_results):

        models = execution_results["models"]

        best_model = max(
            models,
            key=lambda model: models[model]["R2"]
        )

        findings = [
            f"{best_model} achieved the highest R2 score.",
            "Lower MAE indicates lower average prediction error.",
            "Lower RMSE indicates lower prediction error magnitude."
        ]

        return {
            "agent": self.name,
            "status": "analysis_completed",
            "dataset": execution_results["dataset"],
            "comparison": models,
            "best_model_by_r2": best_model,
            "findings": findings
        }