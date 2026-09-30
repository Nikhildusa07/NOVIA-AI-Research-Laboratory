from scipy.stats import ttest_rel


class StatisticalEvaluationAgent:

    def __init__(self):
        self.name = "NOVIA Statistical Evaluation Agent"

    def evaluate(
        self,
        model_a,
        model_b,
        actual_values,
        predictions_a,
        predictions_b
    ):

        absolute_errors_a = [
            abs(actual - prediction)
            for actual, prediction in zip(
                actual_values,
                predictions_a
            )
        ]

        absolute_errors_b = [
            abs(actual - prediction)
            for actual, prediction in zip(
                actual_values,
                predictions_b
            )
        ]

        mean_error_a = (
            sum(absolute_errors_a)
            / len(absolute_errors_a)
        )

        mean_error_b = (
            sum(absolute_errors_b)
            / len(absolute_errors_b)
        )

        error_difference = [
            error_a - error_b
            for error_a, error_b in zip(
                absolute_errors_a,
                absolute_errors_b
            )
        ]

        mean_difference = (
            sum(error_difference)
            / len(error_difference)
        )

        t_statistic, p_value = ttest_rel(
            absolute_errors_a,
            absolute_errors_b
        )

        alpha = 0.05

        statistically_significant = (
            p_value < alpha
        )

        if statistically_significant:

            if mean_error_a < mean_error_b:
                interpretation = (
                    f"{model_a} has statistically significantly "
                    f"lower prediction error than {model_b}."
                )

            else:
                interpretation = (
                    f"{model_b} has statistically significantly "
                    f"lower prediction error than {model_a}."
                )

        else:

            interpretation = (
                f"The difference between {model_a} and "
                f"{model_b} is not statistically significant "
                f"at alpha = {alpha}."
            )

        return {
            "agent": self.name,
            "status": "statistical_evaluation_completed",
            "test": "Paired t-test",

            "models": {
                "model_a": model_a,
                "model_b": model_b
            },

            "mean_absolute_error": {
                model_a: round(
                    mean_error_a,
                    6
                ),
                model_b: round(
                    mean_error_b,
                    6
                )
            },

            "mean_error_difference": round(
                mean_difference,
                6
            ),

            "t_statistic": round(
                float(t_statistic),
                6
            ),

            "p_value": round(
                float(p_value),
                6
            ),

            "alpha": float(alpha),

            "statistically_significant": bool(
                statistically_significant
            ),

            "interpretation": interpretation
        }