class FailureAnalysisAgent:

    def __init__(self):
        self.name = "NOVIA Failure Analysis Agent"

    def analyze_failure(
        self,
        verification_results,
        analysis_results,
        statistical_evaluation=None
    ):

        verification_passed = verification_results.get(
            "verification_passed",
            False
        )

        best_model = analysis_results.get(
            "best_model_by_r2"
        )

        comparison = analysis_results.get(
            "comparison",
            {}
        )

        findings = analysis_results.get(
            "findings",
            []
        )

        # =========================================================
        # SUCCESS CASE
        # =========================================================

        if verification_passed:

            limitations = [
                "The experiment was successfully verified.",
                "The result depends on the selected dataset.",
                "The result depends on the train-test split.",
                "Model hyperparameters were not extensively optimized.",
                "Additional datasets and repeated experiments are "
                "required before generalizing the result."
            ]

            if statistical_evaluation:

                if statistical_evaluation.get(
                    "statistically_significant",
                    False
                ):

                    statistical_assessment = (
                        "The observed difference between the models "
                        "was statistically significant in this experiment."
                    )

                else:

                    statistical_assessment = (
                        "The observed difference between the models "
                        "was not statistically significant."
                    )

            else:

                statistical_assessment = (
                    "No statistical evaluation was available."
                )

            return {
                "agent": self.name,
                "status": "failure_analysis_completed",
                "experiment_status": "successful",
                "verification_passed": True,
                "identified_issues": [],
                "limitations": limitations,
                "statistical_assessment":
                    statistical_assessment,
                "observed_best_model": best_model,
                "findings": findings,
                "recommended_next_action": (
                    "Repeat the experiment using additional datasets, "
                    "different random seeds, and alternative model "
                    "configurations to test reproducibility."
                )
            }

        # =========================================================
        # FAILURE CASE
        # =========================================================

        identified_issues = []

        checks = verification_results.get(
            "checks",
            {}
        )

        if not checks.get(
            "r2_values_valid",
            True
        ):
            identified_issues.append(
                "Invalid or missing R2 values."
            )

        if not checks.get(
            "r2_comparison_valid",
            True
        ):
            identified_issues.append(
                "The reported best model does not match "
                "the calculated R2 comparison."
            )

        if not checks.get(
            "mae_values_valid",
            True
        ):
            identified_issues.append(
                "Invalid MAE values."
            )

        if not checks.get(
            "rmse_values_valid",
            True
        ):
            identified_issues.append(
                "Invalid RMSE values."
            )

        if not identified_issues:

            identified_issues.append(
                "The experiment failed independent verification "
                "for an unspecified reason."
            )

        recommended_next_action = (
            "Review the experiment configuration, validate the "
            "dataset and evaluation metrics, then repeat the "
            "experiment with corrected parameters."
        )

        return {
            "agent": self.name,
            "status": "failure_analysis_completed",
            "experiment_status": "failed",
            "verification_passed": False,
            "identified_issues": identified_issues,
            "limitations": [
                "The current experiment cannot be considered "
                "verified.",
                "The reported results require investigation."
            ],
            "statistical_assessment": (
                statistical_evaluation.get(
                    "interpretation"
                )
                if statistical_evaluation
                else "No statistical evaluation was available."
            ),
            "observed_best_model": best_model,
            "findings": findings,
            "recommended_next_action":
                recommended_next_action
        }