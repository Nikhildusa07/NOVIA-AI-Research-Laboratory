class ExperimentManager:

    def __init__(self):
        self.experiments = []

    def create_experiment(
        self,
        hypothesis: str,
        dataset_name: str = "Unknown Dataset",
        random_state: int = 42,
        test_size: float = 0.2,
        model_config: dict | None = None
    ):

        experiment_id = len(self.experiments) + 1

        previous_versions = [
            experiment
            for experiment in self.experiments
            if experiment["hypothesis"] == hypothesis
        ]

        version = len(previous_versions) + 1

        experiment = {
            "id": experiment_id,
            "version": version,
            "hypothesis": hypothesis,
            "status": "created",

            "reproducibility": {
                "dataset": dataset_name,
                "random_state": random_state,
                "test_size": test_size,
                "model_config": model_config or {}
            }
        }

        self.experiments.append(experiment)

        return experiment

    def get_all_experiments(self):
        return self.experiments

    def get_experiment(self, experiment_id: int):

        for experiment in self.experiments:

            if experiment["id"] == experiment_id:
                return experiment

        return None