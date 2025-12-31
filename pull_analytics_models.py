#!/usr/bin/env python3
"""
Background Model Puller for Data Analytics & Financial Tasks
Pulls optimal lightweight models for your use cases
"""

import subprocess
import time
import json
from datetime import datetime

class BackgroundModelPuller:
    """Pull Ollama models in background"""
    
    # Best models for your requirements
    MODELS_TO_PULL = {
        'mistral': {
            'size': '7B',
            'priority': 1,
            'reason': 'Best for analytics, reasoning, financial predictions',
            'use_cases': ['data_analytics', 'financial_predictions', 'consensus_analytics']
        },
        'phi': {
            'size': '2.7B', 
            'priority': 2,
            'reason': 'Ultra-lightweight, fast for data ingestion and scraping',
            'use_cases': ['data_ingestion', 'scraping', 'quick_analysis']
        },
        'llama2': {
            'size': '7B',
            'priority': 3,
            'reason': 'General purpose, good for all analytics tasks',
            'use_cases': ['general_analytics', 'data_processing', 'summarization']
        }
    }
    
    def __init__(self):
        self.log_file = r'C:\AI\logs\model_pull.log'
        self.status_file = r'C:\AI\logs\model_pull_status.json'
        self.results = {}
    
    def log(self, message):
        """Log message"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_msg + '\n')
        except:
            pass
    
    def pull_model(self, model_name, info):
        """Pull a single model"""
        self.log(f"=" * 70)
        self.log(f"Pulling: {model_name}")
        self.log(f"Size: {info['size']}")
        self.log(f"Reason: {info['reason']}")
        self.log(f"Use Cases: {', '.join(info['use_cases'])}")
        self.log(f"=" * 70)
        
        start_time = time.time()
        
        try:
            # Pull model
            process = subprocess.Popen(
                ['ollama', 'pull', model_name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Stream output
            for line in process.stdout:
                if line.strip():
                    self.log(f"  {line.strip()}")
            
            process.wait()
            elapsed = time.time() - start_time
            
            if process.returncode == 0:
                self.log(f"✅ SUCCESS: {model_name} pulled in {elapsed:.1f}s")
                self.results[model_name] = {
                    'status': 'success',
                    'elapsed': elapsed,
                    'info': info
                }
                return True
            else:
                stderr = process.stderr.read()
                self.log(f"❌ FAILED: {model_name} - {stderr}")
                self.results[model_name] = {
                    'status': 'failed',
                    'error': stderr,
                    'info': info
                }
                return False
                
        except Exception as e:
            self.log(f"❌ ERROR pulling {model_name}: {e}")
            self.results[model_name] = {
                'status': 'error',
                'error': str(e),
                'info': info
            }
            return False
    
    def pull_all_models(self):
        """Pull all models in priority order"""
        self.log("\n" + "=" * 70)
        self.log("BACKGROUND MODEL PULL STARTED")
        self.log("=" * 70)
        self.log(f"Models to pull: {len(self.MODELS_TO_PULL)}")
        self.log(f"Target: Data Analytics, Financial Predictions, Scraping")
        self.log("")
        
        # Sort by priority
        sorted_models = sorted(
            self.MODELS_TO_PULL.items(),
            key=lambda x: x[1]['priority']
        )
        
        total_start = time.time()
        success_count = 0
        
        for model_name, info in sorted_models:
            if self.pull_model(model_name, info):
                success_count += 1
            
            # Brief pause between models
            time.sleep(2)
        
        total_elapsed = time.time() - total_start
        
        # Summary
        self.log("\n" + "=" * 70)
        self.log("PULL COMPLETE")
        self.log("=" * 70)
        self.log(f"Total Time: {total_elapsed:.1f}s ({total_elapsed/60:.1f} minutes)")
        self.log(f"Success: {success_count}/{len(self.MODELS_TO_PULL)}")
        self.log(f"Failed: {len(self.MODELS_TO_PULL) - success_count}")
        
        # Save status
        self.save_status()
        
        # Show usage
        if success_count > 0:
            self.log("\n" + "=" * 70)
            self.log("USAGE GUIDE")
            self.log("=" * 70)
            for model_name, result in self.results.items():
                if result['status'] == 'success':
                    info = result['info']
                    self.log(f"\n{model_name}:")
                    self.log(f"  Use for: {', '.join(info['use_cases'])}")
                    self.log(f"  Command: ollama run {model_name}")
        
        return success_count == len(self.MODELS_TO_PULL)
    
    def save_status(self):
        """Save status to JSON"""
        status = {
            'timestamp': datetime.now().isoformat(),
            'results': self.results,
            'total': len(self.MODELS_TO_PULL),
            'success': sum(1 for r in self.results.values() if r['status'] == 'success')
        }
        
        try:
            with open(self.status_file, 'w', encoding='utf-8') as f:
                json.dump(status, f, indent=2)
            self.log(f"\n📄 Status saved to: {self.status_file}")
        except Exception as e:
            self.log(f"⚠️  Could not save status: {e}")


if __name__ == "__main__":
    puller = BackgroundModelPuller()
    success = puller.pull_all_models()
    
    exit(0 if success else 1)
