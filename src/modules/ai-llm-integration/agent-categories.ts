/**
 * Agent Categories and Job Classifications
 * Enterprise-grade categorization system for AI agents
 */

export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  faangLevel: 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'L9' | 'L10';
  jobRoles: string[];
  dependencies: string[];
}

export interface JobClassification {
  id: string;
  title: string;
  category: string;
  responsibilities: string[];
  skills: string[];
  experience: string;
  salary: string;
  growth: string;
}

export const AGENT_CATEGORIES: AgentCategory[] = [
  {
    id: 'infrastructure',
    name: 'Infrastructure & DevOps',
    description: 'Manages system infrastructure, deployment, monitoring, and DevOps operations',
    capabilities: [
      'system-monitoring',
      'deployment-automation',
      'infrastructure-provisioning',
      'container-orchestration',
      'ci-cd-pipelines',
      'log-aggregation',
      'performance-monitoring',
      'security-scanning',
      'backup-recovery',
      'disaster-recovery'
    ],
    priority: 'critical',
    faangLevel: 'L8',
    jobRoles: ['Site Reliability Engineer', 'DevOps Engineer', 'Platform Engineer', 'Infrastructure Engineer'],
    dependencies: ['docker', 'kubernetes', 'terraform', 'ansible']
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    description: 'Handles security monitoring, threat detection, compliance, and access management',
    capabilities: [
      'threat-detection',
      'vulnerability-scanning',
      'access-control',
      'encryption-management',
      'audit-logging',
      'compliance-monitoring',
      'incident-response',
      'security-policy-enforcement',
      'credential-rotation',
      'intrusion-detection'
    ],
    priority: 'critical',
    faangLevel: 'L9',
    jobRoles: ['Security Engineer', 'Compliance Officer', 'Security Architect', 'Penetration Tester'],
    dependencies: ['SIEM', 'EDR', 'DLP', 'IAM']
  },
  {
    id: 'data-ai',
    name: 'Data & AI/ML',
    description: 'Manages data pipelines, AI/ML models, analytics, and intelligent automation',
    capabilities: [
      'data-pipeline-management',
      'ml-model-training',
      'predictive-analytics',
      'natural-language-processing',
      'computer-vision',
      'recommendation-systems',
      'data-quality-validation',
      'feature-engineering',
      'model-deployment',
      'performance-optimization'
    ],
    priority: 'high',
    faangLevel: 'L9',
    jobRoles: ['Machine Learning Engineer', 'Data Scientist', 'AI Engineer', 'Research Scientist'],
    dependencies: ['tensorflow', 'pytorch', 'spark', 'kafka']
  },
  {
    id: 'development',
    name: 'Software Development',
    description: 'Handles code generation, testing, review, and development automation',
    capabilities: [
      'code-generation',
      'automated-testing',
      'code-review',
      'refactoring',
      'documentation-generation',
      'dependency-management',
      'version-control',
      'build-automation',
      'quality-assurance',
      'performance-testing'
    ],
    priority: 'high',
    faangLevel: 'L7',
    jobRoles: ['Software Engineer', 'Test Engineer', 'DevOps Engineer', 'SDET'],
    dependencies: ['git', 'jenkins', 'sonar', 'jira']
  },
  {
    id: 'integration',
    name: 'System Integration',
    description: 'Manages API integrations, data synchronization, and cross-system communication',
    capabilities: [
      'api-integration',
      'data-synchronization',
      'message-queuing',
      'event-driven-architecture',
      'webhook-management',
      'protocol-translation',
      'service-mesh',
      'microservices-coordination',
      'legacy-system-integration',
      'real-time-data-streaming'
    ],
    priority: 'high',
    faangLevel: 'L8',
    jobRoles: ['Integration Architect', 'API Engineer', 'Data Engineer', 'Solutions Architect'],
    dependencies: ['rabbitmq', 'kafka', 'graphql', 'rest']
  },
  {
    id: 'automation',
    name: 'Process Automation',
    description: 'Automates business processes, workflows, and operational tasks',
    capabilities: [
      'workflow-automation',
      'process-optimization',
      'task-scheduling',
      'batch-processing',
      'robotic-process-automation',
      'business-rules-engine',
      'decision-automation',
      'exception-handling',
      'process-monitoring',
      'efficiency-analytics'
    ],
    priority: 'medium',
    faangLevel: 'L6',
    jobRoles: ['Automation Engineer', 'Process Engineer', 'Operations Engineer', 'Business Analyst'],
    dependencies: ['rpa-tools', 'workflow-engines', 'scheduling-systems']
  },
  {
    id: 'monitoring',
    name: 'Monitoring & Analytics',
    description: 'Provides comprehensive monitoring, analytics, and reporting capabilities',
    capabilities: [
      'real-time-monitoring',
      'performance-analytics',
      'business-intelligence',
      'predictive-maintenance',
      'anomaly-detection',
      'trend-analysis',
      'reporting-automation',
      'dashboard-creation',
      'alert-management',
      'capacity-planning'
    ],
    priority: 'medium',
    faangLevel: 'L7',
    jobRoles: ['Monitoring Engineer', 'Data Analyst', 'Business Intelligence Analyst', 'Site Reliability Engineer'],
    dependencies: ['grafana', 'prometheus', 'elasticsearch', 'kibana']
  },
  {
    id: 'communication',
    name: 'Communication & Collaboration',
    description: 'Manages inter-agent communication, collaboration, and knowledge sharing',
    capabilities: [
      'inter-agent-communication',
      'knowledge-sharing',
      'collaboration-tools',
      'notification-systems',
      'chat-integration',
      'document-collaboration',
      'meeting-automation',
      'feedback-systems',
      'social-networking',
      'community-management'
    ],
    priority: 'medium',
    faangLevel: 'L6',
    jobRoles: ['Collaboration Engineer', 'Community Manager', 'Technical Writer', 'Product Manager'],
    dependencies: ['slack', 'teams', 'discord', 'notion']
  }
];

export const JOB_CLASSIFICATIONS: JobClassification[] = [
  {
    id: 'infrastructure-engineer',
    title: 'Infrastructure Engineer',
    category: 'infrastructure',
    responsibilities: [
      'Design and maintain scalable infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance and reliability',
      'Automate deployment and configuration management',
      'Ensure high availability and disaster recovery',
      'Optimize resource utilization and costs'
    ],
    skills: ['AWS/GCP/Azure', 'Docker/Kubernetes', 'Terraform', 'Jenkins/GitLab CI', 'Monitoring tools'],
    experience: '5+ years',
    salary: '$150,000 - $220,000',
    growth: 'Senior Infrastructure Engineer → Principal Engineer → Engineering Manager'
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    category: 'security',
    responsibilities: [
      'Implement security controls and monitoring',
      'Conduct vulnerability assessments and penetration testing',
      'Manage access controls and identity management',
      'Respond to security incidents',
      'Ensure compliance with security standards',
      'Develop security policies and procedures'
    ],
    skills: ['SIEM', 'EDR', 'Penetration Testing', 'Cryptography', 'Compliance Frameworks'],
    experience: '5+ years',
    salary: '$160,000 - $240,000',
    growth: 'Senior Security Engineer → Security Architect → CISO'
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'data-ai',
    responsibilities: [
      'Design and implement ML models and pipelines',
      'Optimize model performance and scalability',
      'Integrate ML models into production systems',
      'Monitor model performance and retrain as needed',
      'Collaborate with data scientists on model development',
      'Ensure model reliability and ethical AI practices'
    ],
    skills: ['Python', 'TensorFlow/PyTorch', 'MLflow', 'Kubernetes', 'MLOps'],
    experience: '4+ years',
    salary: '$170,000 - $250,000',
    growth: 'Senior ML Engineer → ML Architect → Head of AI'
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'development',
    responsibilities: [
      'Design and implement software solutions',
      'Write clean, maintainable, and testable code',
      'Participate in code reviews and mentoring',
      'Collaborate with cross-functional teams',
      'Implement automated testing and CI/CD',
      'Optimize application performance and scalability'
    ],
    skills: ['Programming Languages', 'Design Patterns', 'Testing Frameworks', 'Version Control', 'Agile/Scrum'],
    experience: '3+ years',
    salary: '$120,000 - $200,000',
    growth: 'Senior Software Engineer → Staff Engineer → Principal Engineer'
  },
  {
    id: 'integration-architect',
    title: 'Integration Architect',
    category: 'integration',
    responsibilities: [
      'Design integration architectures and patterns',
      'Implement API gateways and service meshes',
      'Manage data synchronization and streaming',
      'Ensure system interoperability and scalability',
      'Define integration standards and best practices',
      'Troubleshoot complex integration issues'
    ],
    skills: ['API Design', 'Microservices', 'Event Streaming', 'Message Queues', 'GraphQL'],
    experience: '7+ years',
    salary: '$180,000 - $260,000',
    growth: 'Senior Integration Architect → Solutions Architect → CTO'
  }
];

export const AGENT_MAPPINGS = {
  // Infrastructure & DevOps
  'credential_daemon.py': 'infrastructure',
  'credential_manager.py': 'infrastructure',
  'system_fixer.py': 'infrastructure',
  'repo_sync_agent.py': 'infrastructure',
  'repo_optimizer.py': 'infrastructure',

  // Security & Compliance
  'dashboard_guardian.py': 'security',
  'validation_agent.py': 'security',

  // Data & AI/ML
  'ai-llm-integration': 'data-ai',

  // Development
  'auto_builder': 'development',
  'problem_fixer.py': 'development',

  // Integration
  'master_integrator.py': 'integration',
  'perfect_sync_agent.py': 'integration',

  // Automation
  'implement_system.py': 'automation',
  'launch_all_agents.py': 'automation',

  // Monitoring
  'background_tester.py': 'monitoring',
  'simulation_test.py': 'monitoring',
  'maintenance.ts': 'monitoring',

  // Communication
  'agent-memory.ts': 'communication'
};

/**
 * Get agent category by agent name
 */
export function getAgentCategory(agentName: string): AgentCategory | undefined {
  const categoryId = AGENT_MAPPINGS[agentName as keyof typeof AGENT_MAPPINGS];
  return AGENT_CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Get all agents in a category
 */
export function getAgentsByCategory(categoryId: string): string[] {
  return Object.entries(AGENT_MAPPINGS)
    .filter(([_, catId]) => catId === categoryId)
    .map(([agentName, _]) => agentName);
}

/**
 * Get FAANG level requirements for category
 */
export function getCategoryRequirements(categoryId: string): AgentCategory | undefined {
  return AGENT_CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Validate agent meets category requirements
 */
export function validateAgentCapabilities(agentName: string, capabilities: string[]): boolean {
  const category = getAgentCategory(agentName);
  if (!category) return false;

  // Check if agent has all required capabilities for its category
  const requiredCapabilities = category.capabilities.slice(0, 5); // First 5 are core
  return requiredCapabilities.every(cap => capabilities.includes(cap));
}