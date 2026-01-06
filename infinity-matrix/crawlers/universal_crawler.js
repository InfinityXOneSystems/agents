// Universal Crawler System
// Modular crawler with worker threads for parallel processing.

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const axios = require('axios');

if (isMainThread) {
  class UniversalCrawler {
    constructor() {
      this.workers = [];
    }

    addWorker(urls) {
      const worker = new Worker(__filename, { workerData: urls });
      worker.on('message', (data) => console.log('Worker result:', data));
      worker.on('error', (err) => console.error('Worker error:', err));
      worker.on('exit', (code) => {
        if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
      });
      this.workers.push(worker);
    }

    addSpecializedAgents(agents) {
      console.log('Adding specialized agents to the crawler...');
      agents.forEach(agent => {
        this.addWorker([agent.target]);
      });
    }

    crawl(urls) {
      console.log('Starting universal crawler...');
      this.addWorker(urls);
    }
  }

  module.exports = new UniversalCrawler();
} else {
  const crawl = async (url) => {
    try {
      const response = await axios.get(url);
      return { url, data: response.data };
    } catch (error) {
      return { url, error: error.message };
    }
  };

  Promise.all(workerData.map(crawl)).then((results) => {
    parentPort.postMessage(results);
  });
}