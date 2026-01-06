"""
Universal Crawler: Open Source, Autonomous, Self-Evolving
- Uses Scrapy, Playwright, BeautifulSoup, Selenium (open source)
- Agents powered by Ollama for seed script generation, code evolution
- Designed for FAANG-level scale, governance, and compliance
"""

import scrapy
from scrapy.crawler import CrawlerProcess


import re
import csv
import os

class UniversalSpider(scrapy.Spider):
    name = "universal"
    start_urls = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Load URLs from loan_intelligence_sources.md
        try:
            with open("universal_crawler/loan_intelligence_sources.md", "r", encoding="utf-8") as f:
                content = f.read()
            # Extract URLs from markdown
            self.start_urls = re.findall(r'https?://[^\s)]+', content)
        except Exception as e:
            print(f"Failed to load sources: {e}")

    def parse(self, response):
        # Attempt to extract business contact info and loan-need indicators
        title = response.css('title::text').get()
        text = response.text[:5000]
        # Simple regexes for contact info (can be improved)
        email = re.findall(r"[\w\.-]+@[\w\.-]+", text)
        phone = re.findall(r"\(?\b\d{3}[-.)\s]*\d{3}[-.\s]*\d{4}\b", text)
        # Simple business name guess
        business_name = title or response.url
        # Loan-need indicators (keywords)
        loan_keywords = [
            'bankruptcy', 'distressed', 'debt', 'foreclosure', 'loan', 'refinance',
            'financial trouble', 'going out of business', 'closure', 'default', 'restructuring',
            'seeking funding', 'raise capital', 'cash flow', 'liquidity', 'insolvency',
        ]
        indicators = [kw for kw in loan_keywords if kw in text.lower()]

        # Prepare row for CSV
        row = {
            'Business Name': business_name,
            'URL': response.url,
            'Email': ", ".join(set(email)),
            'Phone': ", ".join(set(phone)),
            'Indicators': ", ".join(indicators),
        }

        # Write to CSV (append mode)
        results_dir = os.path.join(os.path.dirname(__file__), '../results')
        os.makedirs(results_dir, exist_ok=True)
        csv_path = os.path.join(results_dir, 'loan_intelligence_results.csv')
        write_header = not os.path.exists(csv_path)
        with open(csv_path, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=row.keys())
            if write_header:
                writer.writeheader()
            writer.writerow(row)

        # Also yield for pipeline compatibility
        yield row

# Entry point for orchestrator/agent
if __name__ == "__main__":
    process = CrawlerProcess()
    process.crawl(UniversalSpider)
    process.start()
