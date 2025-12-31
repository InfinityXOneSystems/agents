class ConfidenceEnsemble:
    def combine(self, vertex: float, heuristic: float, historical: float) -> float:
        return round(
            0.5 * vertex +
            0.3 * heuristic +
            0.2 * historical,
            4
        )
