# Universal Crawler System

## Overview
- FAANG-level, enterprise-grade, open source-first universal crawler/scraper
- Autonomous, self-evolving, 24/7 operation
- Powered by Ollama agents for seed/script generation and evolution
- Integrated governance, compliance, and persistent service

## Modules
- `crawler.py`: Main Scrapy-based crawler
- `ollama_agent.py`: Ollama-powered agent for seed/script generation
- `governance.py`: Policy enforcement, audit logging, RBAC
- `persistent_service.ps1`: 24/7 operation script (Windows)

## How to Run
1. Start Ollama and ensure it is connected to vision cortex
2. Launch persistent service: `powershell -ExecutionPolicy Bypass -File persistent_service.ps1`
3. Agents will auto-generate seeds, evolve scripts, and operate autonomously

## Open Source Stack
- Scrapy, Playwright, Selenium, BeautifulSoup
- FastAPI, Prometheus, Grafana, SQLite/Firestore/Redis
- Ollama (open source LLM)

## Governance
- RBAC, audit logs, compliance checks
- Policy enforcement for ethical, legal, and safe crawling

## Evolution
- Agents continuously improve, fill gaps, and build new systems autonomously
