from predictor.vertex_brain import VertexBrain

class JobScorer:
    def __init__(self, project, location):
        self.v = VertexBrain(project, location)

    def score(self, payload: dict) -> float:
        return self.v.score(payload)
