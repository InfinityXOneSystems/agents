"""
Distressed Seed Crawler
- Ingests URLs from distressed_seeds.csv and attempts to crawl for property, investor, and industry data
- Stores results for further cleaning and enrichment
"""

import os
import pandas as pd
import scrapy
from scrapy.crawler import CrawlerProcess


class DistressedSeedSpider(scrapy.Spider):
    name = "distressed_seed"
    # Set up absolute paths for input and output
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_csv = os.path.join(base_dir, 'distressed_seeds.csv')
    output_csv = os.path.join(base_dir, 'distressed_seed_results_raw.csv')
    custom_settings = {
        'FEED_FORMAT': 'csv',
        'FEED_URI': output_csv
    }

    def start_requests(self):
        df = pd.read_csv(self.input_csv)
        for _, row in df.iterrows():
            yield scrapy.Request(url=row['url'], meta={'category': row['category'], 'name': row['name'], 'notes': row['notes']})

    def parse(self, response):
        # Basic extraction: collect all links and page title
        for link in response.css('a'):
            url = link.attrib.get('href', '')
            if url.startswith('http') and 'google' not in url:
                yield {
                    'source_url': response.url,
                    'category': response.meta['category'],
                    'name': response.meta['name'],
                    'notes': response.meta['notes'],
                    'found_url': url,
                    'page_title': response.css('title::text').get()
                }

if __name__ == "__main__":
    process = CrawlerProcess()
    process.crawl(DistressedSeedSpider)
    process.start()
    # Results will be in distressed_seed_results_raw.csv in the same directory as this script
