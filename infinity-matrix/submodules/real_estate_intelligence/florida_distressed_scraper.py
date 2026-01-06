"""
Florida Distressed Property Scraper
- Crawls and scrapes public records, auction sites, and real estate portals for distressed properties in Florida
- Cleans and normalizes data for enterprise-grade output
"""
import scrapy
from scrapy.crawler import CrawlerProcess
import pandas as pd

class FloridaDistressedSpider(scrapy.Spider):
    name = "florida_distressed"
    start_urls = [
        "https://www.foreclosure.com/state/FL/",
        "https://www.auction.com/florida/",
        "https://www.zillow.com/fl/foreclosures/"
    ]

    def parse(self, response):
        # Example extraction logic (to be evolved)
        for property in response.css('div.property-card, article, .search-result'):  # generic selectors
            yield {
                'address': property.css('.address::text').get() or property.css('.property-address::text').get(),
                'price': property.css('.price::text').get(),
                'status': property.css('.status::text').get(),
                'source_url': response.url
            }

if __name__ == "__main__":
    process = CrawlerProcess(settings={
        'FEED_FORMAT': 'csv',
        'FEED_URI': '../results/data/florida_distressed_raw.csv'
    })
    process.crawl(FloridaDistressedSpider)
    process.start()

    # Clean and normalize data
    df = pd.read_csv('../results/data/florida_distressed_raw.csv')
    df = df.drop_duplicates()
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
    df = df.fillna('N/A')
    df.to_csv('../results/data/florida_distressed_clean.csv', index=False)
