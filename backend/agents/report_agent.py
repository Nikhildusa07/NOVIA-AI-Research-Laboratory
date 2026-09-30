class ReportAgent:
    def __init__(self):
        self.name = "NOVIA Report Agent"

    def generate_report(self, verification_results):

        if verification_results["verification_passed"]:
            conclusion = (
                f"The experiment was successfully verified. "
                f"{verification_results['verified_model']} achieved the "
                "strongest R2 result in the experiment."
            )
        else:
            conclusion = (
                "The experiment did not pass verification and "
                "requires further investigation."
            )

        return {
            "agent": self.name,
            "status": "report_generated",
            "verification_status": verification_results[
                "verification_passed"
            ],
            "verified_model": verification_results.get(
                "verified_model"
            ),
            "conclusion": conclusion,
            "verification_checks": verification_results["checks"]
        }