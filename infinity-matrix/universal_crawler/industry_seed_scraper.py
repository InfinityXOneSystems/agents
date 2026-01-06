"""
Industry Seed Scraper & Crawler
- Collects URLs and keywords for top 10 industries and top 10 sub-industries
- Designed to accumulate 'golden egg' seed data for every open site
"""
import scrapy
from scrapy.crawler import CrawlerProcess
import pandas as pd

TOP_INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
    'Education', 'Energy', 'Transportation', 'Real Estate', 'Hospitality'
]
SUB_INDUSTRIES = [
    'AI', 'Biotech', 'Banking', 'E-commerce', 'Automotive',
    'EdTech', 'Renewables', 'Logistics', 'Commercial', 'Travel'
]

class IndustrySeedSpider(scrapy.Spider):
    name = "industry_seed"
    start_urls = [
        f'https://www.google.com/search?q={industry}+industry+directory' for industry in TOP_INDUSTRIES
    ] + [
        f'https://www.google.com/search?q={sub}+subindustry+directory' for sub in SUB_INDUSTRIES
    ]

    def parse(self, response):
        for link in response.css('a'):
            url = link.attrib.get('href', '')
            if url.startswith('http') and 'google' not in url:
                yield {
                    'seed_url': url,
                    'source': response.url,
                    'industry': self.get_industry_from_url(response.url),
                    'keyword': self.get_keyword_from_url(response.url)
                }

    def get_industry_from_url(self, url):
        for industry in TOP_INDUSTRIES:
            if industry.lower() in url.lower():
                return industry
        return 'Unknown'

    def get_keyword_from_url(self, url):
        for sub in SUB_INDUSTRIES:
            if sub.lower() in url.lower():
                return sub
        return 'Unknown'

if __name__ == "__main__":
    process = CrawlerProcess(settings={
        'FEED_FORMAT': 'csv',
        'FEED_URI': 'industry_seeds_raw.csv'
    })
    process.crawl(IndustrySeedSpider)
    process.start()

    # Clean and deduplicate
    df = pd.read_csv('industry_seeds_raw.csv')
    df = df.drop_duplicates(subset=['seed_url'])
    df.to_csv('industry_seeds_clean.csv', index=False)
