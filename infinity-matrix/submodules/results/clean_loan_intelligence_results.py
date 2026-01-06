"""
Cleaner for Loan Intelligence Results
- Loads raw crawl results from results/loan_intelligence_results.csv
- Cleans, deduplicates, and normalizes data
- Outputs cleaned data to submodules/results/data/loan_intelligence_cleaned.csv
"""
import pandas as pd
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_PATH = os.path.join(BASE_DIR, '../../results/loan_intelligence_results.csv')
CLEAN_PATH = os.path.join(BASE_DIR, 'data/loan_intelligence_cleaned.csv')

def clean_loan_intelligence_results():
    df = pd.read_csv(RAW_PATH)
    # Basic cleaning: drop duplicates, strip whitespace, drop empty URLs
    df = df.drop_duplicates(subset=['URL'])
    df['URL'] = df['URL'].astype(str).str.strip()
    df['Business Name'] = df['Business Name'].astype(str).str.strip()
    df['Email'] = df['Email'].astype(str).str.strip()
    df['Phone'] = df['Phone'].astype(str).str.strip()
    df['Indicators'] = df['Indicators'].astype(str).str.strip()
    df = df[df['URL'].notnull() & (df['URL'] != '')]
    df = df.reset_index(drop=True)
    # Add timestamp
    df['updated_at'] = datetime.utcnow().isoformat()
    # Save cleaned data
    os.makedirs(os.path.dirname(CLEAN_PATH), exist_ok=True)
    df.to_csv(CLEAN_PATH, index=False)
    print(f"Cleaned loan intelligence data written to {CLEAN_PATH}")

if __name__ == "__main__":
    clean_loan_intelligence_results()
