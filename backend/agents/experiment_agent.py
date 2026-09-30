from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor
)
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


class ExperimentAgent:

    def __init__(self):
        self.name = "NOVIA Experiment Agent"

    def run_experiment(
        self,
        hypothesis: str,
        dataset_data=None,
        dataset_name=None
    ):

        if dataset_data is not None:

            X = dataset_data["X"]
            y = dataset_data["y"]

            selected_dataset = (
                dataset_name
                or "NOVIA Synthetic Regression Dataset"
            )

        else:

            dataset = fetch_california_housing()

            X = dataset.data
            y = dataset.target

            selected_dataset = "California Housing Dataset"

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42
        )

        hypothesis_lower = hypothesis.lower()

        # =========================================================
        # LINEAR REGRESSION vs RANDOM FOREST
        # =========================================================

        if (
            "linear regression" in hypothesis_lower
            and "random forest" in hypothesis_lower
        ):

            model_a_name = "Linear Regression"
            model_b_name = "Random Forest"

            model_a = LinearRegression()

            model_b = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )

        # =========================================================
        # RANDOM FOREST vs GRADIENT BOOSTING
        # =========================================================

        elif (
            "random forest" in hypothesis_lower
            and "gradient boosting" in hypothesis_lower
            and "histogram" not in hypothesis_lower
        ):

            model_a_name = "Random Forest"
            model_b_name = "Gradient Boosting"

            model_a = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )

            model_b = GradientBoostingRegressor(
                n_estimators=100,
                random_state=42
            )

        # =========================================================
        # GRADIENT BOOSTING vs HISTOGRAM GRADIENT BOOSTING
        # =========================================================

        elif (
            "histogram gradient boosting" in hypothesis_lower
        ):

            model_a_name = "Gradient Boosting"
            model_b_name = "Histogram Gradient Boosting"

            model_a = GradientBoostingRegressor(
                n_estimators=100,
                random_state=42
            )

            model_b = HistGradientBoostingRegressor(
                max_iter=100,
                random_state=42
            )

        # =========================================================
        # DEFAULT
        # =========================================================

        else:

            model_a_name = "Random Forest"
            model_b_name = "Gradient Boosting"

            model_a = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                n_jobs=-1
            )

            model_b = GradientBoostingRegressor(
                n_estimators=100,
                random_state=42
            )

        # =========================================================
        # TRAIN
        # =========================================================

        model_a.fit(
            X_train,
            y_train
        )

        model_b.fit(
            X_train,
            y_train
        )

        predictions_a = model_a.predict(
            X_test
        )

        predictions_b = model_b.predict(
            X_test
        )

        # =========================================================
        # METRICS
        # =========================================================

        metrics_a = {
            "MAE": round(
                mean_absolute_error(
                    y_test,
                    predictions_a
                ),
                4
            ),
            "RMSE": round(
                mean_squared_error(
                    y_test,
                    predictions_a
                ) ** 0.5,
                4
            ),
            "R2": round(
                r2_score(
                    y_test,
                    predictions_a
                ),
                4
            )
        }

        metrics_b = {
            "MAE": round(
                mean_absolute_error(
                    y_test,
                    predictions_b
                ),
                4
            ),
            "RMSE": round(
                mean_squared_error(
                    y_test,
                    predictions_b
                ) ** 0.5,
                4
            ),
            "R2": round(
                r2_score(
                    y_test,
                    predictions_b
                ),
                4
            )
        }

        return {
            "agent": self.name,
            "status": "experiment_completed",
            "hypothesis": hypothesis,
            "dataset": selected_dataset,
            "comparison": (
                f"{model_a_name} vs {model_b_name}"
            ),

            "models": {
                model_a_name: metrics_a,
                model_b_name: metrics_b
            },

            "statistical_data": {
                "model_a": model_a_name,
                "model_b": model_b_name,
                "actual_values": y_test.tolist(),
                "predictions_a":
                    predictions_a.tolist(),
                "predictions_b":
                    predictions_b.tolist()
            }
        }