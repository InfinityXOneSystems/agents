"""
Map execution contract to industry pipelines.
"""

PIPELINE_MAP = {
    "devops": [
        "repo.sync",
        "repo.commit",
        "ci.trigger",
        "system.proof"
    ],
    "mlops": [
        "data.ingest",
        "model.train",
        "model.deploy",
        "system.proof"
    ],
    # Add more as needed
}

def get_pipeline_for_industry(industry):
    return PIPELINE_MAP.get(industry, [])

# Example usage:
if __name__ == "__main__":
    print(get_pipeline_for_industry("devops"))
    print(get_pipeline_for_industry("mlops"))
