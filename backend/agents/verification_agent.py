class VerificationAgent:

    def __init__(self):
        self.name = "NOVIA Verification Agent"

    def verify_results(self, analysis_results):

        comparison = analysis_results["comparison"]

        # Verify that R2 values exist
        r2_values_valid = all(
            "R2" in model and isinstance(model["R2"], (int, float))
            for model in comparison.values()
        )

        # Verify that MAE values exist and are valid
        mae_values_valid = all(
            "MAE" in model and model["MAE"] >= 0
            for model in comparison.values()
        )

        # Verify that RMSE values exist and are valid
        rmse_values_valid = all(
            "RMSE" in model and model["RMSE"] >= 0
            for model in comparison.values()
        )

        # Independently determine the best model
        calculated_best_model = max(
            comparison,
            key=lambda model: comparison[model]["R2"]
        )

        r2_comparison_valid = (
            analysis_results["best_model_by_r2"]
            == calculated_best_model
        )

        verification_passed = (
            r2_values_valid
            and mae_values_valid
            and rmse_values_valid
            and r2_comparison_valid
        )

        return {
            "agent": self.name,
            "status": "verification_completed",
            "verification_passed": verification_passed,
            "checks": {
                "r2_values_valid": r2_values_valid,
                "r2_comparison_valid": r2_comparison_valid,
                "mae_values_valid": mae_values_valid,
                "rmse_values_valid": rmse_values_valid
            },
            "verified_model": calculated_best_model,
            "message": (
                "Experiment results passed independent verification."
                if verification_passed
                else "Experiment results failed independent verification."
            )
        }