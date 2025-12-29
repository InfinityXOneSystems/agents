# Auto Prompt System
This repository contains automated prompts that trigger commands across the full AI system and all repositories.

## Usage
Prompts are structured files that define commands to execute on repos and the system.

## Format
Each .prompt file contains:
- COMMAND: The action to perform
- Parameters as key:value pairs

## Available Commands
- sync_repos: Sync all repositories
- build_repos: Build specified repositories
- deploy_system: Deploy to target environment
- check_health: Run health checks