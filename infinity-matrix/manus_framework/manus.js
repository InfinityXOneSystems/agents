// Integrating all agents and features into the Manus framework
const { multiAgentSystem, Agent } = require('../agents/multi_agent_system');
const specializedAgents = require('../agents/specialized_agents');
const shadowScrapers = require('../scrapers/shadow_scrapers');
const strategicAgents = require('../agents/strategic_agents');
const philosopherAgent = strategicAgents.philosopher;
const quantumAgent = strategicAgents.quantum;
const predictionAgent = strategicAgents.prediction;
const infinityLibrary = require('../infinity_library/library');
const dataPipeline = require('../data_pipeline/cleaning_and_labeling');
const leadGenerationAgent = require('../agents/lead_generation_agent');

class ManusFramework {
  constructor() {
    this.agents = [...multiAgentSystem.agents, ...specializedAgents, ...shadowScrapers, philosopherAgent, quantumAgent, predictionAgent, leadGenerationAgent];
    this.library = infinityLibrary;
    this.dataPipeline = dataPipeline;
  }

  addAgent(agent) {
    console.log('Adding agent to Manus framework...');
    this.agents.push(agent);
  }

  processData(rawData, label) {
    console.log('Processing data through Manus framework...');
    const processedData = this.dataPipeline.process(rawData, label);
    this.library.addResult(processedData, label);
    return processedData;
  }

  runAllAgents() {
    console.log('Running all agents in Manus framework...');
    this.agents.forEach(agent => {
      if (agent.crawl) {
        agent.crawl();
      } else if (agent.respond) {
        agent.respond('Default query');
      } else if (agent.scrape) {
        agent.scrape();
      }
    });
  }

  useStrategicAgent(agentType, data) {
    console.log(`Using strategic agent: ${agentType}...`);
    if (this.strategicAgents[agentType]) {
      return this.strategicAgents[agentType].analyze ?
        this.strategicAgents[agentType].analyze(data) :
        this.strategicAgents[agentType].predict(data);
    }
    return 'Strategic agent not found.';
  }
}

const manusFramework = new ManusFramework();

module.exports = manusFramework;