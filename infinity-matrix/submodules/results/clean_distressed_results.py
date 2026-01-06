"""
Cleaner for Distressed Seed Results
- Loads raw crawl results
- Cleans, deduplicates, and normalizes data
- Outputs cleaned data to results/data/
- Aggregates to enterprise results template if possible
"""
import pandas as pd
import os
from datetime import datetime

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_PATH = os.path.join(BASE_DIR, '../../universal_crawler/distressed_seed_results_raw.csv')
CLEAN_PATH = os.path.join(BASE_DIR, 'data/florida_distressed_raw.csv')
ENTERPRISE_TEMPLATE = os.path.join(BASE_DIR, 'output/enterprise_results_template.csv')
ENTERPRISE_OUTPUT = os.path.join(BASE_DIR, 'output/enterprise_results.csv')

def clean_distressed_results():
    df = pd.read_csv(RAW_PATH)
    # Basic cleaning: drop duplicates, strip whitespace, drop empty URLs
    df = df.drop_duplicates(subset=['found_url'])
    df['found_url'] = df['found_url'].str.strip()
    df = df[df['found_url'].notnull() & (df['found_url'] != '')]
    df = df.reset_index(drop=True)
    # Save cleaned raw
    os.makedirs(os.path.dirname(CLEAN_PATH), exist_ok=True)
    df.to_csv(CLEAN_PATH, index=False)
    print(f"Cleaned data written to {CLEAN_PATH}")
    # Try to aggregate to enterprise template if possible
    if os.path.exists(ENTERPRISE_TEMPLATE):
        template = pd.read_csv(ENTERPRISE_TEMPLATE)
        # Map/merge as much as possible (placeholder logic)
        enterprise = template.copy()
        enterprise['property_id'] = df['found_url'].factorize()[0]
        enterprise['address'] = ''
        enterprise['price'] = ''
        enterprise['consensus_score'] = ''
        enterprise['sentiment'] = ''
        enterprise['market_intelligence'] = ''
        enterprise['updated_at'] = datetime.utcnow().isoformat()
        enterprise.to_csv(ENTERPRISE_OUTPUT, index=False)
        print(f"Enterprise results written to {ENTERPRISE_OUTPUT}")

if __name__ == "__main__":
    clean_distressed_results()
