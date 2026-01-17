import { MaintenanceAgent } from './agents/maintenance.js';
import { UnifiedCodingAgent } from './agents/coding-agent';

export class AgentOrchestrator {
  private agents: Map<string, any> = new Map();
  private maintenanceAgent: MaintenanceAgent;
  private codingAgent: UnifiedCodingAgent;

  constructor() {
    this.maintenanceAgent = new MaintenanceAgent(this);
    this.codingAgent = new UnifiedCodingAgent();
  }

  /**
   * Register an agent
   */
  registerAgent(name: string, agent: any): void {
    this.agents.set(name, agent);
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): any {
    return this.agents.get(name);
  }

  /**
   * Start all agents
   */
  async start(): Promise<void> {
    console.log('🚀 Starting all agents...');

    // Start maintenance agent
    await this.maintenanceAgent.start();

    // Start coding agent
    await this.codingAgent.start();

    // Start other agents
    for (const [name, agent] of this.agents) {
      if (agent.start) {
        await agent.start();
      }
    }

    console.log('✅ All agents started');
  }

  /**
   * Stop all agents
   */
  async stopAll(): Promise<void> {
    console.log('🛑 Stopping all agents...');

    // Stop maintenance agent
    await this.maintenanceAgent.stop();

    // Stop coding agent
    this.codingAgent.stop();

    // Stop other agents
    for (const [name, agent] of this.agents) {
      if (agent.stop) {
        await agent.stop();
      }
    }

    console.log('✅ All agents stopped');
  }

  /**
   * Generate code using the unified coding agent
   */
  async generateCode(specification: string): Promise<any> {
    return await this.codingAgent.generateCode(specification);
  }

  /**
   * Get coding agent status
   */
  getCodingStatus(): any {
    return this.codingAgent ? this.codingAgent.getStatus() : { active: false };
  }
}