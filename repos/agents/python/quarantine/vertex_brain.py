from google.cloud import aiplatform

class VertexBrain:
    def __init__(self, project: str, location: str):
        self.project = project
        self.location = location
        aiplatform.init(project=project, location=location)

    def score(self, features: dict) -> float:
        """
        Vertex-backed confidence scoring.
        This is intentionally simple for now.
        Later this will call a deployed endpoint.
        """
        numeric = [
            v for v in features.values()
            if isinstance(v, (int, float))
        ]

        if not numeric:
            return 0.0

        # Conservative normalized confidence
        score = sum(numeric) / (len(numeric) * 100)
        return max(0.0, min(0.99, score))
