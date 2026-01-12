/**
 * Infinity X AI - Autonomous AI Team
 * 
 * Complete AI workforce for business and personal automation:
 * - Each role has a primary agent and backup assistant
 * - Agents can operate autonomously or in hybrid mode
 * - Full integration with workflow orchestrator
 * 
 * Universal implementation for any business or personal use
 */

import { invokeLLM } from "./_core/llm";

// ============ Types ============

export interface AIAgent {
  id: string;
  name: string;
  role: AgentRole;
  department: Department;
  status: "active" | "standby" | "offline" | "maintenance";
  mode: "autonomous" | "hybrid" | "manual";
  capabilities: string[];
  systemPrompt: string;
  backupAgentId?: string;
  metrics: AgentMetrics;
  createdAt: Date;
}

export interface AgentMetrics {
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  lastActiveAt: Date;
}

export type AgentRole = 
  | "ceo_assistant"
  | "sales_manager"
  | "marketing_director"
  | "operations_manager"
  | "finance_controller"
  | "customer_success"
  | "hr_manager"
  | "legal_advisor"
  | "tech_lead"
  | "data_analyst"
  | "backup_assistant";

export type Department = 
  | "executive"
  | "sales"
  | "marketing"
  | "operations"
  | "finance"
  | "customer_success"
  | "human_resources"
  | "legal"
  | "technology"
  | "analytics";

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  input: string;
  output?: string;
  status: "pending" | "processing" | "completed" | "failed" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  completedAt?: Date;
}

// ============ Agent Definitions ============

const AGENT_DEFINITIONS: Record<AgentRole, Omit<AIAgent, "id" | "backupAgentId" | "metrics" | "createdAt">> = {
  ceo_assistant: {
    name: "Aether Prime",
    role: "ceo_assistant",
    department: "executive",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "strategic_planning",
      "decision_support",
      "executive_briefings",
      "stakeholder_communication",
      "priority_management",
      "meeting_coordination",
    ],
    systemPrompt: `You are Aether Prime, the CEO's Executive Assistant AI. You operate with the highest level of strategic awareness and discretion. Your responsibilities include:
- Preparing executive briefings and summaries
- Coordinating high-priority communications
- Supporting strategic decision-making
- Managing executive calendar and priorities
- Synthesizing information from all departments
Always maintain confidentiality and provide actionable insights.`,
  },

  sales_manager: {
    name: "Nova Sales",
    role: "sales_manager",
    department: "sales",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "lead_qualification",
      "pipeline_management",
      "sales_forecasting",
      "deal_negotiation",
      "crm_automation",
      "proposal_generation",
    ],
    systemPrompt: `You are Nova Sales, the AI Sales Manager. You drive revenue growth through intelligent automation. Your responsibilities include:
- Qualifying and scoring leads automatically
- Managing the sales pipeline
- Generating proposals and quotes
- Forecasting sales performance
- Coaching on sales strategies
- Automating CRM updates
Focus on conversion optimization and customer value.`,
  },

  marketing_director: {
    name: "Pulse Marketing",
    role: "marketing_director",
    department: "marketing",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "campaign_management",
      "content_creation",
      "social_media_automation",
      "analytics_reporting",
      "brand_management",
      "lead_generation",
    ],
    systemPrompt: `You are Pulse Marketing, the AI Marketing Director. You orchestrate all marketing activities for maximum impact. Your responsibilities include:
- Creating and managing marketing campaigns
- Generating content across channels
- Automating social media presence
- Analyzing marketing performance
- Managing brand consistency
- Driving lead generation
Optimize for engagement, reach, and conversion.`,
  },

  operations_manager: {
    name: "Ops Core",
    role: "operations_manager",
    department: "operations",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "process_optimization",
      "resource_allocation",
      "vendor_management",
      "quality_assurance",
      "workflow_automation",
      "inventory_management",
    ],
    systemPrompt: `You are Ops Core, the AI Operations Manager. You ensure smooth and efficient business operations. Your responsibilities include:
- Optimizing business processes
- Managing resource allocation
- Coordinating with vendors
- Maintaining quality standards
- Automating operational workflows
- Managing inventory and logistics
Focus on efficiency, reliability, and cost optimization.`,
  },

  finance_controller: {
    name: "Ledger AI",
    role: "finance_controller",
    department: "finance",
    status: "active",
    mode: "hybrid",
    capabilities: [
      "financial_reporting",
      "budget_management",
      "invoice_processing",
      "expense_tracking",
      "cash_flow_analysis",
      "compliance_monitoring",
    ],
    systemPrompt: `You are Ledger AI, the AI Finance Controller. You manage all financial operations with precision. Your responsibilities include:
- Generating financial reports
- Managing budgets and forecasts
- Processing invoices and payments
- Tracking expenses
- Analyzing cash flow
- Ensuring financial compliance
Maintain accuracy and provide actionable financial insights.`,
  },

  customer_success: {
    name: "Care Connect",
    role: "customer_success",
    department: "customer_success",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "customer_onboarding",
      "support_automation",
      "satisfaction_monitoring",
      "churn_prevention",
      "upsell_identification",
      "feedback_collection",
    ],
    systemPrompt: `You are Care Connect, the AI Customer Success Manager. You ensure customer satisfaction and retention. Your responsibilities include:
- Onboarding new customers
- Automating support responses
- Monitoring customer satisfaction
- Preventing customer churn
- Identifying upsell opportunities
- Collecting and acting on feedback
Prioritize customer experience and long-term relationships.`,
  },

  hr_manager: {
    name: "Talent Flow",
    role: "hr_manager",
    department: "human_resources",
    status: "active",
    mode: "hybrid",
    capabilities: [
      "recruitment_automation",
      "employee_onboarding",
      "performance_tracking",
      "benefits_administration",
      "policy_management",
      "training_coordination",
    ],
    systemPrompt: `You are Talent Flow, the AI HR Manager. You manage all human resources functions. Your responsibilities include:
- Automating recruitment processes
- Onboarding new employees
- Tracking performance metrics
- Administering benefits
- Managing HR policies
- Coordinating training programs
Focus on employee experience and organizational development.`,
  },

  legal_advisor: {
    name: "Lex Counsel",
    role: "legal_advisor",
    department: "legal",
    status: "standby",
    mode: "hybrid",
    capabilities: [
      "contract_review",
      "compliance_checking",
      "risk_assessment",
      "document_drafting",
      "regulatory_monitoring",
      "dispute_analysis",
    ],
    systemPrompt: `You are Lex Counsel, the AI Legal Advisor. You provide legal guidance and document support. Your responsibilities include:
- Reviewing contracts and agreements
- Checking compliance requirements
- Assessing legal risks
- Drafting legal documents
- Monitoring regulatory changes
- Analyzing potential disputes
Always recommend human legal review for final decisions.`,
  },

  tech_lead: {
    name: "Code Architect",
    role: "tech_lead",
    department: "technology",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "code_review",
      "architecture_design",
      "bug_analysis",
      "performance_optimization",
      "security_assessment",
      "documentation_generation",
    ],
    systemPrompt: `You are Code Architect, the AI Tech Lead. You oversee all technical operations. Your responsibilities include:
- Reviewing code quality
- Designing system architecture
- Analyzing and fixing bugs
- Optimizing performance
- Assessing security vulnerabilities
- Generating technical documentation
Focus on code quality, scalability, and maintainability.`,
  },

  data_analyst: {
    name: "Insight Engine",
    role: "data_analyst",
    department: "analytics",
    status: "active",
    mode: "autonomous",
    capabilities: [
      "data_analysis",
      "report_generation",
      "trend_identification",
      "predictive_modeling",
      "visualization_creation",
      "kpi_tracking",
    ],
    systemPrompt: `You are Insight Engine, the AI Data Analyst. You transform data into actionable insights. Your responsibilities include:
- Analyzing business data
- Generating reports and dashboards
- Identifying trends and patterns
- Building predictive models
- Creating data visualizations
- Tracking KPIs
Provide clear, actionable insights from complex data.`,
  },

  backup_assistant: {
    name: "Echo Support",
    role: "backup_assistant",
    department: "operations",
    status: "standby",
    mode: "autonomous",
    capabilities: [
      "general_assistance",
      "task_handoff",
      "emergency_response",
      "cross_functional_support",
      "escalation_handling",
      "continuity_management",
    ],
    systemPrompt: `You are Echo Support, the Universal Backup Assistant. You provide continuity when primary agents are unavailable. Your responsibilities include:
- Handling tasks from any department
- Managing seamless handoffs
- Responding to emergencies
- Providing cross-functional support
- Escalating when necessary
- Ensuring business continuity
Adapt quickly and maintain service quality.`,
  },
};

// ============ AI Team Manager ============

export class AITeamManager {
  private agents: Map<string, AIAgent> = new Map();
  private taskHistory: AgentTask[] = [];

  constructor() {
    this.initializeTeam();
  }

  private initializeTeam(): void {
    const agentIds: Map<AgentRole, string> = new Map();

    // Create primary agents
    for (const [role, definition] of Object.entries(AGENT_DEFINITIONS)) {
      if (role !== "backup_assistant") {
        const agent = this.createAgent(definition as Omit<AIAgent, "id" | "backupAgentId" | "metrics" | "createdAt">);
        agentIds.set(role as AgentRole, agent.id);
      }
    }

    // Create backup assistants for each primary agent
    for (const [role, primaryId] of Array.from(agentIds.entries())) {
      const backupDef = { ...AGENT_DEFINITIONS.backup_assistant };
      backupDef.name = `${AGENT_DEFINITIONS[role].name} Backup`;
      const backup = this.createAgent(backupDef);
      
      const primary = this.agents.get(primaryId);
      if (primary) {
        primary.backupAgentId = backup.id;
      }
    }
  }

  private createAgent(definition: Omit<AIAgent, "id" | "backupAgentId" | "metrics" | "createdAt">): AIAgent {
    const agent: AIAgent = {
      ...definition,
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metrics: {
        tasksCompleted: 0,
        successRate: 1.0,
        avgResponseTime: 0,
        lastActiveAt: new Date(),
      },
      createdAt: new Date(),
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }

  getAgentByRole(role: AgentRole): AIAgent | undefined {
    return Array.from(this.agents.values()).find(a => a.role === role && a.status === "active");
  }

  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByDepartment(department: Department): AIAgent[] {
    return Array.from(this.agents.values()).filter(a => a.department === department);
  }

  async executeTask(agentId: string, taskType: string, input: string): Promise<AgentTask> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Check if agent is available, otherwise use backup
    let executingAgent = agent;
    if (agent.status !== "active" && agent.backupAgentId) {
      const backup = this.agents.get(agent.backupAgentId);
      if (backup && backup.status === "active") {
        executingAgent = backup;
      }
    }

    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: executingAgent.id,
      type: taskType,
      input,
      status: "processing",
      priority: "medium",
      createdAt: new Date(),
    };

    this.taskHistory.push(task);

    try {
      const startTime = Date.now();

      const response = await invokeLLM({
        messages: [
          { role: "system", content: executingAgent.systemPrompt },
          { role: "user", content: `Task Type: ${taskType}\n\nInput: ${input}` },
        ],
      });

      const responseTime = Date.now() - startTime;
      const content = response.choices?.[0]?.message?.content;
      task.output = typeof content === 'string' ? content : '';
      task.status = "completed";
      task.completedAt = new Date();

      // Update metrics
      executingAgent.metrics.tasksCompleted++;
      executingAgent.metrics.avgResponseTime = 
        (executingAgent.metrics.avgResponseTime * (executingAgent.metrics.tasksCompleted - 1) + responseTime) / 
        executingAgent.metrics.tasksCompleted;
      executingAgent.metrics.lastActiveAt = new Date();

    } catch (error) {
      task.status = "failed";
      executingAgent.metrics.successRate = 
        (executingAgent.metrics.successRate * executingAgent.metrics.tasksCompleted) / 
        (executingAgent.metrics.tasksCompleted + 1);
    }

    return task;
  }

  async delegateToTeam(taskDescription: string): Promise<AgentTask[]> {
    // Analyze task and determine which agents should handle it
    const analysisResponse = await invokeLLM({
      messages: [
        { 
          role: "system", 
          content: `You are a task router. Given a task description, determine which AI team members should handle it. 
Available roles: ${Object.keys(AGENT_DEFINITIONS).join(", ")}
Respond with a JSON array of roles that should be involved.` 
        },
        { role: "user", content: taskDescription },
      ],
    });

    let roles: AgentRole[] = [];
    try {
      const content = analysisResponse.choices?.[0]?.message?.content || "[]";
      roles = JSON.parse(typeof content === 'string' ? content : '[]');
    } catch {
      roles = ["ceo_assistant"]; // Default to CEO assistant
    }

    // Execute task with each relevant agent
    const tasks: AgentTask[] = [];
    for (const role of roles) {
      const agent = this.getAgentByRole(role);
      if (agent) {
        const task = await this.executeTask(agent.id, "delegation", taskDescription);
        tasks.push(task);
      }
    }

    return tasks;
  }

  setAgentMode(agentId: string, mode: "autonomous" | "hybrid" | "manual"): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.mode = mode;
      return true;
    }
    return false;
  }

  setAgentStatus(agentId: string, status: "active" | "standby" | "offline" | "maintenance"): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      return true;
    }
    return false;
  }

  getTeamStatus(): {
    totalAgents: number;
    activeAgents: number;
    standbyAgents: number;
    totalTasksCompleted: number;
    avgSuccessRate: number;
  } {
    const agents = Array.from(this.agents.values());
    const activeAgents = agents.filter(a => a.status === "active");
    const standbyAgents = agents.filter(a => a.status === "standby");
    const totalTasks = agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0);
    const avgSuccess = agents.length > 0 
      ? agents.reduce((sum, a) => sum + a.metrics.successRate, 0) / agents.length 
      : 0;

    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      standbyAgents: standbyAgents.length,
      totalTasksCompleted: totalTasks,
      avgSuccessRate: avgSuccess,
    };
  }

  getTaskHistory(agentId?: string): AgentTask[] {
    if (agentId) {
      return this.taskHistory.filter(t => t.agentId === agentId);
    }
    return this.taskHistory;
  }
}

// Export singleton instance
export const aiTeam = new AITeamManager();

export default AITeamManager;
