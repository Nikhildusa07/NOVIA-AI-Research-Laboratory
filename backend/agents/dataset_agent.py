from sklearn.datasets import make_regression


class DatasetGenerationAgent:

    def __init__(self):
        self.name = "NOVIA Dataset Generation Agent"

    def generate_dataset(
        self,
        research_question: str,
        n_samples: int = 1000,
        n_features: int = 8,
        noise: float = 10.0,
        random_state: int = 42
    ):

        X, y = make_regression(
            n_samples=n_samples,
            n_features=n_features,
            noise=noise,
            random_state=random_state
        )

        dataset_info = {
            "agent": self.name,
            "status": "dataset_generated",
            "research_question": research_question,
            "dataset_name": "NOVIA Synthetic Regression Dataset",
            "generation_method": "sklearn.make_regression",
            "rows": n_samples,
            "features": n_features,
            "target": "synthetic_target",
            "noise": noise,
            "random_state": random_state
        }

        return {
            "info": dataset_info,
            "data": {
                "X": X,
                "y": y
            }
        }