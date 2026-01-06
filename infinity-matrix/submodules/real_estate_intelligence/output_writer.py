"""
Enterprise Results Output Writer
- Writes cleaned, consensus, and sentiment data to results submodule
"""
import pandas as pd
import os
from datetime import datetime

def write_results(clean_df, consensus, sentiments, output_path):
    clean_df['consensus_score'] = consensus
    clean_df['sentiment'] = sentiments
    clean_df['updated_at'] = datetime.utcnow().isoformat()
    clean_df.to_csv(output_path, index=False)

# Usage example
if __name__ == "__main__":
    # Load cleaned data
    clean_df = pd.read_csv('../results/data/cleaned_output.csv')
    consensus = 0.95  # Example value
    sentiments = [0.1 for _ in range(len(clean_df))]  # Example values
    output_path = '../results/output/enterprise_results.csv'
    write_results(clean_df, consensus, sentiments, output_path)
    print('Results written to', output_path)
