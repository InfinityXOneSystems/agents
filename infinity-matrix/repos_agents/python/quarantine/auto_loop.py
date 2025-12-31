import time

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
try:
    from control.manifest_loader import Manifest
except ImportError:
    from manifest_loader import Manifest
 # Legacy import removed: from crawler.universal.crawler import UniversalCrawler
from vision_cortex.controller import VisionCortexController
from predictor.market import MarketPredictor
from planner.core import PlannerCore
from executor.core import ExecutorCore
from governance.engine import GovernanceEngine
from validation.engine import ValidationEngine

class AutoLoop:
    def __init__(self, interval=60):
        self.manifest = Manifest()

        if not self.manifest.enabled('autonomy.enabled'):
            raise RuntimeError('Autonomy disabled by manifest')

        self.interval = self.manifest.get('crawler.interval_seconds', interval)

        # Import the new universal crawler
        from .universal_crawler import UniversalCrawler
        # Example: load sources, plugins, AI, observability from manifest/config
        sources = self.manifest.get('crawler.sources', [])
        max_threads = self.manifest.get('crawler.max_threads', 8)
        # Plugin, AI, and observability hooks (can be extended)
        def example_plugin(result):
            # Example: add timestamp or custom processing
            import datetime
            result['timestamp'] = datetime.datetime.utcnow().isoformat()
            return result
        def example_ai_assist(src):
            # Example: AI can rewrite/expand URLs or add context
            return src
        def example_observability(event_type, src, data):
            print(f"[CRAWLER OBS] {event_type} {src} {str(data)[:120]}")
        self.crawler = UniversalCrawler(
            sources=sources,
            max_threads=max_threads,
            plugins=[example_plugin],
            headless=self.manifest.get('crawler.headless', False),
            ai_assist=example_ai_assist,
            observability=example_observability,
            config=self.manifest.get('crawler', {})
        )
        self.vision = VisionCortexController()
        self.predictor = MarketPredictor()
        self.planner = PlannerCore()
        self.executor = ExecutorCore()
        self.governance = GovernanceEngine()
        self.validator = ValidationEngine()

    def run_cycle(self):
        if not self.governance.authorize('auto_cycle', {}):
            return

        data = self.crawler.crawl()
        insights = self.vision.process(data)
        forecast = self.predictor.predict(insights)
        plan = self.planner.plan(forecast)
        self.executor.execute(plan)

    def start(self):
        while True:
            try:
                self.run_cycle()
            except Exception as e:
                print(f'[AUTOLOOP ERROR] {e}')
            time.sleep(self.interval)
