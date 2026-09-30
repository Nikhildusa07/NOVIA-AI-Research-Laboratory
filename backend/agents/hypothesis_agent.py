class HypothesisAgent:

    def __init__(self):
        self.name = "NOVIA Hypothesis Agent"

    def generate_hypothesis(self, research_question: str):

        question = research_question.lower()

        if "house price" in question:

            hypothesis = (
                "Tree-based machine learning models such as Random Forest "
                "may predict house prices more accurately than a basic "
                "Linear Regression model."
            )

        elif "machine learning" in question:

            hypothesis = (
                "Machine learning models can learn useful patterns from "
                "historical data and use those patterns to make predictions "
                "on previously unseen data."
            )

        else:

            hypothesis = (
                f"The research question '{research_question}' can be "
                "tested by comparing measurable outcomes under different "
                "experimental conditions."
            )

        return {
            "agent": self.name,
            "research_question": research_question,
            "status": "hypothesis_generated",
            "hypothesis": hypothesis,
            "testable": True
        }

    def generate_next_hypothesis(
        self,
        previous_results,
        cycle_number=2
    ):

        verified_model = previous_results.get(
            "verified_model"
        )

        if verified_model == "Linear Regression":

            hypothesis = (
                "Gradient Boosting may improve prediction performance "
                "compared with Random Forest on the same dataset."
            )

        elif verified_model == "Random Forest":

            hypothesis = (
                "Gradient Boosting may improve prediction performance "
                "compared with Random Forest on the same dataset."
            )

        elif verified_model == "Gradient Boosting":

            hypothesis = (
                "Histogram Gradient Boosting may provide competitive "
                "prediction performance compared with Gradient Boosting "
                "on the same dataset."
            )

        elif verified_model == "Histogram Gradient Boosting":

            hypothesis = (
                "A different tree-based ensemble configuration may "
                "further improve prediction performance compared with "
                "the previous verified model."
            )

        else:

            hypothesis = (
                "A different machine learning model or configuration "
                "may improve prediction performance compared with "
                "the previous experiment."
            )

        return {
            "agent": self.name,
            "status": "new_hypothesis_generated",
            "cycle": cycle_number,
            "previous_verified_model": verified_model,
            "hypothesis": hypothesis,
            "testable": True
        }