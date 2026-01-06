"""
Organization Agent - Document Evolution + Taxonomy System
Autonomous document organization, evolution, and taxonomy management
Following Menius.im patterns + Enterprise doc standards
"""

import os
import sys
import asyncio
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import yaml

# Core frameworks
import aiohttp
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker


class OrganizationAgent:
    """
    Autonomous Organization Agent
    Manages document evolution, taxonomy, and index system
    """
    
    def __init__(self):
        self.config = self._load_config()
        self.redis_client = None
        
        # Document evolution
        self.doc_templates = {}
        self.evolution_history = []
        
        # Taxonomy system
        self.taxonomy_master = {}
        self.taxonomy_version = "1.0.0"
        
        # Index system
        self.master_index = {}
        self.index_version = "1.0.0"
        
        # Prompt library
        self.prompt_library = {}
        
        # State
        self.state = {
            'status': 'initializing',
            'documents_evolved': 0,
            'taxonomy_entries': 0,
            'index_entries': 0,
            'last_evolution': None
        }
    
    def _load_config(self) -> Dict:
        """Load configuration"""
        return {
            'redis_url': os.getenv('REDIS_URL', 'redis://redis:6379'),
            'evolution_enabled': os.getenv('EVOLUTION_DOCS_ENABLED', 'true').lower() == 'true',
            'index_path': Path(os.getenv('INDEX_SYSTEM_PATH', '/app/docs/index')),
            'taxonomy_path': Path(os.getenv('TAXONOMY_PATH', '/app/taxonomy')),
            'prompt_library_path': Path(os.getenv('PROMPT_LIBRARY_PATH', '/app/prompts')),
            'ollama_host': os.getenv('OLLAMA_HOST', 'http://ollama:11434')
        }
    
    async def initialize(self):
        """Initialize agent"""
        print("🧠 Initializing Organization Agent...")
        
        # Connect to Redis
        self.redis_client = await redis.from_url(
            self.config['redis_url'],
            encoding='utf-8',
            decode_responses=True
        )
        print("✅ Redis connected")
        
        # Load taxonomy
        await self._load_taxonomy()
        print(f"✅ Taxonomy loaded ({len(self.taxonomy_master)} entries)")
        
        # Load index system
        await self._load_index_system()
        print(f"✅ Index system loaded ({len(self.master_index)} entries)")
        
        # Load prompt library
        await self._load_prompt_library()
        print(f"✅ Prompt library loaded ({len(self.prompt_library)} prompts)")
        
        # Load doc templates
        await self._load_doc_templates()
        print(f"✅ Doc templates loaded")
        
        # Validate taxonomy and index versions
        if not self.taxonomy_version or not self.index_version:
            raise ValueError("Taxonomy and index versions must be defined.")

        if self.taxonomy_version != "1.0.0" or self.index_version != "1.0.0":
            print("Warning: Taxonomy or index version mismatch.")
        
        self.state['status'] = 'ready'
        print("🚀 Organization Agent ready")
    
    async def _load_taxonomy(self):
        """Load or create taxonomy master"""
        taxonomy_file = self.config['taxonomy_path'] / 'taxonomy_master.yaml'
        
        if taxonomy_file.exists():
            with open(taxonomy_file, 'r') as f:
                self.taxonomy_master = yaml.safe_load(f)
        else:
            # Create default taxonomy
            self.taxonomy_master = {
                'version': self.taxonomy_version,
                'categories': {
                    'industries': {
                        'real-estate': {
                            'description': 'Real estate and property management',
                            'subcategories': ['residential', 'commercial', 'industrial']
                        },
                        'finance': {
                            'description': 'Financial services and banking',
                            'subcategories': ['banking', 'investment', 'insurance']
                        },
                        'healthcare': {
                            'description': 'Healthcare and medical services',
                            'subcategories': ['hospitals', 'clinics', 'pharma']
                        },
                        'technology': {
                            'description': 'Technology and software',
                            'subcategories': ['software', 'hardware', 'services']
                        }
                    },
                    'entities': {
                        'companies': {'weight': 1.0},
                        'people': {'weight': 0.9},
                        'locations': {'weight': 0.8},
                        'events': {'weight': 0.7},
                        'products': {'weight': 0.8}
                    },
                    'content_types': {
                        'documents': ['pdf', 'doc', 'docx', 'txt'],
                        'images': ['jpg', 'png', 'gif', 'webp'],
                        'videos': ['mp4', 'avi', 'mov', 'webm'],
                        'audio': ['mp3', 'wav', 'ogg']
                    },
                    'processes': {
                        'ingest': {'order': 1, 'critical': True},
                        'normalize': {'order': 2, 'critical': True},
                        'score': {'order': 3, 'critical': True},
                        'organize': {'order': 4, 'critical': False},
                        'evolve': {'order': 5, 'critical': False},
                        'deliver': {'order': 6, 'critical': True}
                    }
                },
                'metadata': {
                    'created': datetime.now().isoformat(),
                    'last_updated': datetime.now().isoformat(),
                    'auto_evolution': True
                }
            }
            
            # Save taxonomy
            await self._save_taxonomy()
        
        self.state['taxonomy_entries'] = len(self.taxonomy_master.get('categories', {}))
    
    async def _save_taxonomy(self):
        """Save taxonomy to file and Redis"""
        taxonomy_file = self.config['taxonomy_path'] / 'taxonomy_master.yaml'
        taxonomy_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Update metadata
        self.taxonomy_master['metadata']['last_updated'] = datetime.now().isoformat()
        
        # Save to file
        with open(taxonomy_file, 'w') as f:
            yaml.dump(self.taxonomy_master, f, default_flow_style=False)
        
        # Save to Redis
        await self.redis_client.set(
            'vision:taxonomy_master',
            json.dumps(self.taxonomy_master)
        )
    
    async def _load_index_system(self):
        """Load or create index system"""
        index_file = self.config['index_path'] / 'MASTER_INDEX.yaml'
        
        if index_file.exists():
            with open(index_file, 'r') as f:
                self.master_index = yaml.safe_load(f)
        else:
            # Create default index
            self.master_index = {
                'version': self.index_version,
                'structure': {
                    '1.0': 'SYSTEM ARCHITECTURE',
                    '2.0': 'QUANTUM INTELLIGENCE',
                    '3.0': 'DOCUMENT WORKFLOWS',
                    '4.0': 'AUTONOMOUS AGENTS',
                    '5.0': 'API ENDPOINTS',
                    '6.0': 'DEPLOYMENT'
                },
                'cross_references': {},
                'evolution_chain': {
                    'ingest': '3.1',
                    'normalize': '3.2',
                    'score': '3.3',
                    'organize': '3.4',
                    'evolve': '3.5',
                    'deliver': '3.6'
                },
                'agent_registry': {},
                'metadata': {
                    'created': datetime.now().isoformat(),
                    'last_updated': datetime.now().isoformat()
                }
            }
            
            await self._save_index()
        
        self.state['index_entries'] = len(self.master_index.get('structure', {}))
    
    async def _save_index(self):
        """Save index to file and Redis"""
        index_file = self.config['index_path'] / 'MASTER_INDEX.yaml'
        index_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Update metadata
        self.master_index['metadata']['last_updated'] = datetime.now().isoformat()
        
        # Save to file
        with open(index_file, 'w') as f:
            yaml.dump(self.master_index, f, default_flow_style=False)
        
        # Save to Redis
        await self.redis_client.set(
            'vision:master_index',
            json.dumps(self.master_index)
        )
    
    async def _load_prompt_library(self):
        """Load prompt library"""
        prompt_path = self.config['prompt_library_path']
        
        if not prompt_path.exists():
            # Create default prompt library
            prompt_path.mkdir(parents=True, exist_ok=True)
            
            self.prompt_library = {
                'document_evolution': {
                    'id': 'doc-evolution-v1',
                    'template': '''
Analyze and evolve the following data into a structured intelligence document:

**Source:** {source}
**Taxonomy:** {taxonomy_tags}
**Score:** {score}

**Data:**
{normalized_data}

**Generate:**
1. **Executive Summary** - Key insights in 2-3 sentences
2. **Detailed Analysis** - Comprehensive breakdown
3. **Actionable Recommendations** - Specific next steps
4. **Risk Assessment** - Potential risks and mitigation
5. **Evolution Metadata** - Document lineage and version
''',
                    'version': '1.0.0'
                },
                'taxonomy_classification': {
                    'id': 'taxonomy-class-v1',
                    'template': '''
Classify the following content into appropriate taxonomy categories:

**Content:** {content}

**Available Categories:**
{categories}

**Output Format:**
- Industry: [industry]
- Entities: [list of entities]
- Content Type: [type]
- Process Stage: [stage]
- Confidence: [0.0-1.0]
''',
                    'version': '1.0.0'
                },
                'index_generation': {
                    'id': 'index-gen-v1',
                    'template': '''
Generate index entry for the following document:

**Document ID:** {id}
**Source:** {source}
**Content:** {content}

**Generate:**
- Index reference (e.g., 3.A.1.1)
- Cross-references
- Related documents
- Navigation path
''',
                    'version': '1.0.0'
                }
            }
            
            # Save prompts
            for name, prompt in self.prompt_library.items():
                prompt_file = prompt_path / f'{name}.json'
                with open(prompt_file, 'w') as f:
                    json.dump(prompt, f, indent=2)
        else:
            # Load existing prompts
            for prompt_file in prompt_path.glob('*.json'):
                with open(prompt_file, 'r') as f:
                    self.prompt_library[prompt_file.stem] = json.load(f)
    
    async def _load_doc_templates(self):
        """Load document templates"""
        self.doc_templates = {
            'intelligence_report': '''
# Intelligence Report: {title}

**Generated:** {timestamp}
**Source:** {source}
**Classification:** {classification}

## Executive Summary
{executive_summary}

## Key Insights
{insights}

## Detailed Analysis
{analysis}

## Recommendations
{recommendations}

## Risk Assessment
{risk_assessment}

## Metadata
- Document ID: {id}
- Evolution Cycle: {evolution_cycle}
- Quantum Coherence: {quantum_coherence}
- Taxonomy Tags: {taxonomy_tags}
''',
            'evolution_log': '''
# Document Evolution Log

**Document ID:** {id}
**Original Version:** {original_version}
**Current Version:** {current_version}
**Evolution Date:** {evolution_date}

## Changes
{changes}

## Improvements
{improvements}

## Next Evolution Scheduled
{next_evolution}
'''
        }
    
    async def evolve_document(self, document_id: str, content: Dict) -> Dict:
        """Evolve a document using AI"""
        try:
            # Get document from Redis
            doc_key = f"result:{document_id}"
            doc_json = await self.redis_client.get(doc_key)
            
            if not doc_json:
                return {'success': False, 'error': 'Document not found'}
            
            doc = json.loads(doc_json)
            
            # Apply taxonomy classification
            taxonomy_tags = await self._classify_taxonomy(doc)
            
            # Generate index entry
            index_entry = await self._generate_index_entry(doc)
            
            # Evolve using LLM (Ollama)
            evolved_doc = await self._llm_evolve(doc, taxonomy_tags)
            
            # Store evolved document
            evolved_key = f"evolved:{document_id}"
            await self.redis_client.setex(
                evolved_key,
                86400,  # 24 hours
                json.dumps(evolved_doc)
            )
            
            # Update evolution history
            self.evolution_history.append({
                'document_id': document_id,
                'timestamp': datetime.now().isoformat(),
                'taxonomy_tags': taxonomy_tags,
                'index_entry': index_entry
            })
            
            self.state['documents_evolved'] += 1
            self.state['last_evolution'] = datetime.now().isoformat()
            
            return {
                'success': True,
                'document_id': document_id,
                'evolved_key': evolved_key,
                'taxonomy_tags': taxonomy_tags,
                'index_entry': index_entry
            }
            
        except Exception as e:
            print(f"❌ Evolution error: {e}")
            return {'success': False, 'error': str(e)}
    
    async def _classify_taxonomy(self, doc: Dict) -> List[str]:
        """Classify document into taxonomy"""
        tags = []
        content = str(doc.get('normalized_data', ''))
        
        # Industry classification
        for industry, details in self.taxonomy_master.get('categories', {}).get('industries', {}).items():
            if industry in content.lower():
                tags.append(f"industry:{industry}")
        
        # Entity classification
        for entity, details in self.taxonomy_master.get('categories', {}).get('entities', {}).items():
            if entity in content.lower():
                tags.append(f"entity:{entity}")
        
        return tags
    
    async def _generate_index_entry(self, doc: Dict) -> str:
        """Generate index entry"""
        # Simple index generation - can be enhanced with LLM
        return f"3.A.{len(self.master_index.get('structure', {})) + 1}"
    
    async def _llm_evolve(self, doc: Dict, taxonomy_tags: List[str]) -> Dict:
        """Evolve document using Ollama LLM"""
        # TODO: Implement Ollama integration
        return {
            **doc,
            'evolved': True,
            'taxonomy_tags': taxonomy_tags,
            'evolution_timestamp': datetime.now().isoformat()
        }
    
    async def run_autonomous(self):
        """Run autonomous evolution cycles"""
        print("🤖 Starting autonomous organization mode...")
        self.state['status'] = 'running'
        
        while self.state['status'] == 'running':
            try:
                # Evolution cycle
                await self._auto_evolve_cycle()
                
                # Taxonomy evolution
                await self._auto_taxonomy_evolution()
                
                # Index update
                await self._auto_index_update()
                
                # Sleep
                await asyncio.sleep(60)  # 1 minute
                
            except Exception as e:
                print(f"❌ Autonomous cycle error: {e}")
                await asyncio.sleep(5)
    
    async def _auto_evolve_cycle(self):
        """Auto-evolve pending documents"""
        # Get all result keys from Redis
        cursor = 0
        while True:
            cursor, keys = await self.redis_client.scan(
                cursor=cursor,
                match='result:*',
                count=10
            )
            
            for key in keys:
                doc_id = key.split(':')[1]
                # Check if already evolved
                evolved_key = f"evolved:{doc_id}"
                exists = await self.redis_client.exists(evolved_key)
                
                if not exists:
                    await self.evolve_document(doc_id, {})
            
            if cursor == 0:
                break
    
    async def _auto_taxonomy_evolution(self):
        """Auto-evolve taxonomy based on new patterns"""
        # TODO: Implement ML-based taxonomy evolution
        pass
    
    async def _auto_index_update(self):
        """Auto-update index system"""
        # TODO: Implement automatic index updates
        pass
    
    async def get_status(self) -> Dict:
        """Get agent status"""
        return {
            **self.state,
            'taxonomy_version': self.taxonomy_version,
            'index_version': self.index_version,
            'prompt_library_size': len(self.prompt_library),
            'evolution_history_size': len(self.evolution_history)
        }
    
    async def shutdown(self):
        """Graceful shutdown"""
        print("🛑 Shutting down Organization Agent...")
        self.state['status'] = 'shutdown'
        
        # Save state
        await self._save_taxonomy()
        await self._save_index()
        
        if self.redis_client:
            await self.redis_client.close()


# FastAPI app
from fastapi import FastAPI

app = FastAPI(title="Organization Agent")
agent = OrganizationAgent()


@app.on_event("startup")
async def startup():
    await agent.initialize()
    # Start autonomous mode
    asyncio.create_task(agent.run_autonomous())


@app.on_event("shutdown")
async def shutdown():
    await agent.shutdown()


@app.get("/health")
async def health():
    return {"status": "healthy", **agent.state}


@app.get("/status")
async def status():
    return await agent.get_status()


@app.get("/taxonomy")
async def get_taxonomy():
    return agent.taxonomy_master


@app.get("/index")
async def get_index():
    return agent.master_index


@app.get("/prompts")
async def get_prompts():
    return agent.prompt_library


@app.post("/evolve/{document_id}")
async def evolve_document(document_id: str):
    return await agent.evolve_document(document_id, {})


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5001)
