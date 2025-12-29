import { MaintenanceAgent } from './agents/maintenance.js';

export class AgentOrchestrator {
  private agents: Map<string, any> = new Map();
  private maintenanceAgent: MaintenanceAgent;

  constructor() {
    this.maintenanceAgent = new MaintenanceAgent(this);
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

    // Stop other agents
    for (const [name, agent] of this.agents) {
      if (agent.stop) {
        await agent.stop();
      }
    }

    console.log('✅ All agents stopped');
  }

  /**
   * Get system status
   */
  getStatus(): any {
    return {
      maintenance: this.maintenanceAgent ? 'running' : 'stopped',
      agents: Array.from(this.agents.keys()),
      timestamp: new Date().toISOString()
    };
  }
}