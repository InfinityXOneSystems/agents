# Agent Template Format

This document defines the standard format for all agent templates in this repository.

## Template Structure

Each agent template should be a YAML file with the following structure:

```yaml
# Agent Template Metadata
name: "agent-name"
version: "1.0.0"
description: "Brief description of the agent's purpose and capabilities"

# Classification
workflow_stage: "planning|development|testing|deployment|maintenance"
industry: "technology|healthcare|finance|education|manufacturing|retail|general"
category: "code-review|documentation|security|testing|devops|data-analysis"

# Foundation Integration
foundation:
  compatible_version: ">=1.0.0"
  required_components: []

# Agent Configuration
agent:
  role: "Description of the agent's role"
  capabilities:
    - "Capability 1"
    - "Capability 2"
  
  # System prompt for the agent
  system_prompt: |
    You are a specialized agent that...
    
  # Behavioral guidelines
  guidelines:
    - "Guideline 1"
    - "Guideline 2"

# Tools and Integrations
tools:
  required: []
  optional: []

# Example Usage
examples:
  - name: "Example scenario"
    input: "Example input"
    expected_behavior: "Description of expected behavior"
```

## Naming Conventions

- Use lowercase with hyphens for file names: `code-review-agent.yaml`
- Use descriptive names that indicate the agent's purpose
- Include version numbers in the metadata, not file names

## Documentation Requirements

Each template should include:
1. Clear description of purpose
2. List of capabilities
3. Integration requirements with foundation
4. At least one usage example
