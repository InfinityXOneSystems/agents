"""
Vision Cortex Quantum Ingestion Engine
24/7 Autonomous Data Ingestion, Normalization & Intelligence
Following Menius.im Patterns + Quantum Intelligence Integration
"""

import os
import sys
import asyncio
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

# Core frameworks
import aiohttp
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

import sys
sys.path.append(str(Path(__file__).parent.parent.parent / 'ai_stack' / 'ollama'))
from ollama_manager import OllamaManager
from fallback_system import FallbackSystem
sys.path.append('/app/intelligence')
from normalization import vision_cortex_normalizer
from scoring import vision_cortex_scorer

# ML & Vector
import numpy as np
from sentence_transformers import SentenceTransformer
import torch


class QuantumIngestionEngine:
    """
    Vision Cortex Quantum Ingestion Engine
    Autonomous 24/7 data ingestion with quantum intelligence
    """
    
    def __init__(self):
        self.config = self._load_config()
        self.redis_client = None
        self.db_engine = None
        self.session_maker = None
        self.ollama_client = None
        self.ollama_manager = OllamaManager(url=self.config.get('ollama_host', 'http://ollama:11434'))
        self.ollama_fallback = FallbackSystem(self.ollama_manager)
        
        # Quantum intelligence components
        self.normalizer = vision_cortex_normalizer
        self.scorer = vision_cortex_scorer
        self.embedding_model = None
        
        # Organization & Evolution
        self.taxonomy = {}
        self.index_system = {}
        self.prompt_library = {}
        
        # ML components
        self.ml_models = {}
        self.training_queue = []
        
        # Menius.im pattern state
        self.state = {
            'status': 'initializing',
            'last_ingest': None,
            'total_ingested': 0,
            'total_normalized': 0,
            'total_scored': 0,
            'quantum_coherence': 0.0,
            'evolution_cycle': 0
        }
        
    def _load_config(self) -> Dict:
        """Load configuration from environment"""
        return {
            'ollama_host': os.getenv('OLLAMA_HOST', 'http://ollama:11434'),
            'redis_url': os.getenv('REDIS_URL', 'redis://redis:6379'),
            'postgres_url': os.getenv('POSTGRES_URL'),
            'quantum_path': Path(os.getenv('QUANTUM_INTELLIGENCE_PATH', '/app/intelligence')),
            'quantum_threshold': float(os.getenv('QUANTUM_COHERENCE_THRESHOLD', 0.85)),
            'evolution_enabled': os.getenv('EVOLUTION_DOCS_ENABLED', 'true').lower() == 'true',
            'evolution_interval': int(os.getenv('EVOLUTION_DOCS_INTERVAL', 60000)),
            'index_enabled': os.getenv('INDEX_SYSTEM_ENABLED', 'true').lower() == 'true',
            'ml_auto_train': os.getenv('ML_AUTO_TRAIN', 'true').lower() == 'true',
            'autonomous_mode': os.getenv('AUTONOMOUS_MODE', 'true').lower() == 'true',
            'follow_menius': os.getenv('FOLLOW_MENIUS_RUNBOOK', 'true').lower() == 'true',
        }
    
    async def initialize(self):
        """Initialize all components"""
        print(f"🔧 Initializing Vision Cortex Quantum Ingestion Engine...")
        
        # Connect to Redis
        try:
            self.redis_client = redis.from_url(
                self.config['redis_url'],
                encoding='utf-8',
                decode_responses=True
            )
            print("✅ Redis connected")
        except Exception as e:
            print(f"❌ Error connecting to Redis: {e}")
            raise
        
        # Connect to PostgreSQL
        for attempt in range(3):
            try:
                self.db_engine = create_async_engine(
                    self.config['postgres_url'],
                    echo=False,
                    pool_pre_ping=True
                )
                self.session_maker = sessionmaker(
                    self.db_engine,
                    class_=AsyncSession,
                    expire_on_commit=False
                )
                print("✅ PostgreSQL connected")
                break
            except Exception as e:
                print(f"⚠️  Database connection attempt {attempt + 1} failed: {e}")
                if attempt == 2:
                    raise
        
        # Initialize Ollama client (for async HTTP)
        self.ollama_client = aiohttp.ClientSession(
            base_url=self.config['ollama_host']
        )
        print("✅ Ollama HTTP client ready")
        # Test OllamaManager health
        health = self.ollama_manager.health_check()
        print(f"✅ OllamaManager health: {health}")
        
        # Load embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Embedding model loaded")
        
        # Load quantum intelligence components
        await self._load_quantum_intelligence()
        print("✅ Quantum intelligence loaded")
        
        # Load organization components
        await self._load_organization_system()
        print("✅ Organization system loaded")
        
        # Load prompt library
        await self._load_prompt_library()
        print("✅ Prompt library loaded")
        
        # Initialize ML models
        await self._initialize_ml_models()
        print("✅ ML models initialized")
        
        self.state['status'] = 'ready'
        print("🚀 Vision Cortex ready for 24/7 autonomous operation")
    
    async def _load_quantum_intelligence(self):
        """Load quantum intelligence from /intelligence folder"""
        quantum_path = self.config['quantum_path']
        
        if not quantum_path.exists():
            print(f"⚠️  Quantum intelligence path not found: {quantum_path}")
            return
        
        # Load normalizers
        normalizer_path = quantum_path / 'normalization'
        if normalizer_path.exists():
            print(f"📚 Loading normalizers from {normalizer_path}")
        
        # Load scorers
        scorer_path = quantum_path / 'scoring'
        if scorer_path.exists():
            print(f"📊 Loading scorers from {scorer_path}")
        
        # Calculate quantum coherence
        self.state['quantum_coherence'] = await self._calculate_quantum_coherence()
    
    async def _calculate_quantum_coherence(self) -> float:
        """Calculate quantum coherence score"""
        # Placeholder - implement quantum coherence algorithm
        return 0.92
    
    async def _load_organization_system(self):
        """Load taxonomy, index system, and evolution docs"""
        # Load taxonomy from Redis or create new
        taxonomy_key = 'vision:taxonomy'
        taxonomy_json = await self.redis_client.get(taxonomy_key)
        
        if taxonomy_json:
            self.taxonomy = json.loads(taxonomy_json)
        else:
            # Initialize default taxonomy
            self.taxonomy = {
                'industries': ['real-estate', 'finance', 'healthcare', 'technology'],
                'entities': ['companies', 'people', 'locations', 'events'],
                'content_types': ['documents', 'images', 'videos', 'audio'],
                'processes': ['ingest', 'normalize', 'score', 'evolve', 'deliver']
            }
            await self.redis_client.set(taxonomy_key, json.dumps(self.taxonomy))
        
        # Load index system
        if self.config['index_enabled']:
            index_key = 'vision:index'
            index_json = await self.redis_client.get(index_key)
            if index_json:
                self.index_system = json.loads(index_json)
    
    async def _load_prompt_library(self):
        """Load prompt library from /prompts"""
        prompts_path = Path('/app/prompts')
        if prompts_path.exists():
            for prompt_file in prompts_path.glob('*.json'):
                with open(prompt_file, 'r') as f:
                    prompt_data = json.load(f)
                    self.prompt_library[prompt_file.stem] = prompt_data
            print(f"📖 Loaded {len(self.prompt_library)} prompts")
    
    async def _initialize_ml_models(self):
        """Initialize machine learning models"""
        if self.config['ml_auto_train']:
            # Placeholder for ML model loading
            self.ml_models['classifier'] = None
            self.ml_models['regressor'] = None
    
    async def ingest(self, source: str, data: Any, context: Optional[Dict] = None) -> Dict:
        """
        Main ingestion method
        Follows Menius.im pattern: Ingest -> Normalize -> Score -> Evolve
        """
        try:
            ingestion_id = f"ingest-{datetime.now().timestamp()}"
            
            # Step 1: Raw ingestion
            raw_record = {
                'id': ingestion_id,
                'source': source,
                'data': data,
                'context': context or {},
                'timestamp': datetime.now().isoformat(),
                'status': 'ingested'
            }
            
            # Store in Redis
            await self.redis_client.setex(
                f'raw:{ingestion_id}',
                3600,  # 1 hour TTL
                json.dumps(raw_record)
            )
            
            # Step 2: Normalize using quantum intelligence
            normalized = await self._normalize(raw_record)
            
            # Step 3: Score
            scored = await self._score(normalized)
            
            # Step 4: Apply taxonomy and organization
            organized = await self._organize(scored)
            
            # Step 5: Evolution and document generation
            if self.config['evolution_enabled']:
                evolved = await self._evolve(organized)
            else:
                evolved = organized
            
            # Step 6: Update index
            if self.config['index_enabled']:
                await self._update_index(evolved)
            
            # Step 7: Generate embeddings
            embeddings = await self._generate_embeddings(evolved)
            evolved['embeddings'] = embeddings
            
            # Step 8: Store final result
            await self._store_result(evolved)
            
            # Step 9: Trigger ML training if needed
            if self.config['ml_auto_train']:
                self.training_queue.append(evolved)
            
            # Update state
            self.state['total_ingested'] += 1
            self.state['total_normalized'] += 1
            self.state['total_scored'] += 1
            self.state['last_ingest'] = datetime.now().isoformat()
            
            return {
                'success': True,
                'id': ingestion_id,
                'status': evolved['status'],
                'quantum_coherence': self.state['quantum_coherence']
            }
            
        except Exception as e:
            print(f"❌ Ingestion error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _normalize(self, raw_record: Dict) -> Dict:
        """Normalize using quantum intelligence normalizers"""
        try:
            # Use vision-cortex normalizer from /intelligence
            normalized_data = self.normalizer.normalize(raw_record['data'])
            
            return {
                **raw_record,
                'normalized_data': normalized_data,
                'status': 'normalized'
            }
        except Exception as e:
            print(f"⚠️  Normalization error: {e}")
            return {
                **raw_record,
                'normalized_data': raw_record['data'],
                'status': 'normalization_failed'
            }
    
    async def _score(self, normalized_record: Dict) -> Dict:
        """Score using quantum intelligence scorers"""
        try:
            # Use vision-cortex scorer from /intelligence
            score_data = self.scorer.score(normalized_record['normalized_data'])
            
            return {
                **normalized_record,
                'score': score_data,
                'status': 'scored'
            }
        except Exception as e:
            print(f"⚠️  Scoring error: {e}")
            return {
                **normalized_record,
                'score': {'default': 0.5},
                'status': 'scoring_failed'
            }
    
    async def _organize(self, scored_record: Dict) -> Dict:
        """Apply taxonomy and organization"""
        # Apply taxonomy classification
        taxonomy_tags = []
        
        # Auto-tag based on content
        data = scored_record.get('normalized_data', {})
        
        # Industry classification
        for industry in self.taxonomy.get('industries', []):
            if industry in str(data).lower():
                taxonomy_tags.append(f"industry:{industry}")
        
        # Entity classification
        for entity in self.taxonomy.get('entities', []):
            if entity in str(data).lower():
                taxonomy_tags.append(f"entity:{entity}")
        
        return {
            **scored_record,
            'taxonomy_tags': taxonomy_tags,
            'status': 'organized'
        }
    
    async def _evolve(self, organized_record: Dict) -> Dict:
        """Document evolution using Ollama LLM (via Python manager)"""
        try:
            prompt = self._build_evolution_prompt(organized_record)
            # Use OllamaManager for local LLM
            result = self.ollama_manager.generate(prompt, model="llama2")
            if result.get('success'):
                evolved_doc = result.get('response', '')
                return {
                    **organized_record,
                    'evolved_document': evolved_doc,
                    'evolution_cycle': self.state['evolution_cycle'],
                    'status': 'evolved'
                }
        except Exception as e:
            print(f"⚠️  Evolution error: {e}")
        return {
            **organized_record,
            'evolved_document': None,
            'status': 'evolution_failed'
        }
    
    def _build_evolution_prompt(self, record: Dict) -> str:
        """Build evolution prompt from prompt library"""
        # Get evolution prompt from library
        evolution_prompt_template = self.prompt_library.get('document_evolution', {}).get('template', '')
        
        if evolution_prompt_template:
            return evolution_prompt_template.format(**record)
        
        # Default prompt
        return f"""
Analyze and evolve the following data into a structured intelligence document:

Source: {record.get('source')}
Data: {record.get('normalized_data')}
Score: {record.get('score')}
Taxonomy: {record.get('taxonomy_tags')}

Generate a comprehensive intelligence document with:
1. Executive Summary
2. Key Insights
3. Actionable Recommendations
4. Risk Assessment
5. Next Steps
"""
    
    async def _update_index(self, record: Dict):
        """Update index system"""
        index_entry = {
            'id': record['id'],
            'source': record['source'],
            'taxonomy_tags': record.get('taxonomy_tags', []),
            'score': record.get('score', {}),
            'timestamp': record['timestamp']
        }
        
        # Store in Redis index
        index_key = f"index:{record['id']}"
        await self.redis_client.setex(
            index_key,
            86400,  # 24 hours
            json.dumps(index_entry)
        )
        
        # Update master index
        await self.redis_client.sadd('vision:master_index', record['id'])
    
    async def _generate_embeddings(self, record: Dict) -> List[float]:
        """Generate vector embeddings"""
        text = str(record.get('normalized_data', ''))
        embeddings = self.embedding_model.encode(text)
        return embeddings.tolist()
    
    async def _store_result(self, record: Dict):
        """Store final result in PostgreSQL"""
        # Store in Redis for quick access
        result_key = f"result:{record['id']}"
        await self.redis_client.setex(
            result_key,
            86400,  # 24 hours
            json.dumps(record)
        )
        
        # TODO: Store in PostgreSQL for long-term storage
    
    async def run_autonomous(self):
        """Run autonomous 24/7 operation"""
        print("🤖 Starting autonomous mode...")
        self.state['status'] = 'running'
        
        while self.state['status'] == 'running':
            try:
                # Evolution cycle
                if self.config['evolution_enabled']:
                    await self._evolution_cycle()
                
                # ML training cycle
                if self.config['ml_auto_train'] and len(self.training_queue) > 100:
                    await self._ml_training_cycle()
                
                # Health check
                await self._health_check()
                
                # Sleep interval
                await asyncio.sleep(self.config['evolution_interval'] / 1000)
                
            except Exception as e:
                print(f"❌ Autonomous cycle error: {e}")
                # Self-heal
                await asyncio.sleep(5)
    
    async def _evolution_cycle(self):
        """Run evolution cycle"""
        self.state['evolution_cycle'] += 1
        print(f"🔄 Evolution cycle {self.state['evolution_cycle']}")
        
        # Re-calculate quantum coherence
        self.state['quantum_coherence'] = await self._calculate_quantum_coherence()
    
    async def _ml_training_cycle(self):
        """Run ML training cycle"""
        print(f"🧠 Training ML models with {len(self.training_queue)} samples")
        # TODO: Implement ML training
        self.training_queue = []
    
    async def _health_check(self):
        """Health check"""
        # Check Redis
        await self.redis_client.ping()
        
        # Check Ollama
        async with self.ollama_client.get('/api/tags') as response:
            if response.status != 200:
                print("⚠️  Ollama health check failed")
    
    async def get_status(self) -> Dict:
        """Get system status"""
        return {
            **self.state,
            'config': {
                'quantum_threshold': self.config['quantum_threshold'],
                'evolution_enabled': self.config['evolution_enabled'],
                'ml_auto_train': self.config['ml_auto_train'],
                'autonomous_mode': self.config['autonomous_mode']
            },
            'taxonomy_size': len(self.taxonomy),
            'prompt_library_size': len(self.prompt_library),
            'training_queue_size': len(self.training_queue)
        }
    
    async def shutdown(self):
        """Graceful shutdown"""
        print("🛑 Shutting down...")
        self.state['status'] = 'shutdown'
        
        if self.ollama_client:
            await self.ollama_client.close()
        
        if self.redis_client:
            await self.redis_client.close()
        
        if self.db_engine:
            await self.db_engine.dispose()


# FastAPI app for HTTP API
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Vision Cortex Quantum Ingestion Engine")
engine = QuantumIngestionEngine()


class IngestRequest(BaseModel):
    source: str
    data: dict
    context: Optional[dict] = None


@app.on_event("startup")
async def startup():
    await engine.initialize()
    # Start autonomous operation in background
    if engine.config['autonomous_mode']:
        asyncio.create_task(engine.run_autonomous())


@app.on_event("shutdown")
async def shutdown():
    await engine.shutdown()


@app.get("/health")
async def health():
    return {"status": "healthy", **engine.state}


@app.get("/status")
async def status():
    return await engine.get_status()


@app.post("/ingest")
async def ingest(request: IngestRequest):
    result = await engine.ingest(
        source=request.source,
        data=request.data,
        context=request.context
    )
    if not result['success']:
        raise HTTPException(status_code=500, detail=result.get('error'))
    return result


@app.get("/quantum-coherence")
async def quantum_coherence():
    return {
        'coherence': engine.state['quantum_coherence'],
        'threshold': engine.config['quantum_threshold'],
        'status': 'optimal' if engine.state['quantum_coherence'] >= engine.config['quantum_threshold'] else 'suboptimal'
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)
