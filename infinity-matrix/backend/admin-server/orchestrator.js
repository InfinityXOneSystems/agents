const { Worker, Queue, QueueScheduler } = require('bullmq');
const express = require('express');
const router = express.Router();

// Initialize queues
const orchestratorQueue = new Queue('orchestrator');
const orchestratorScheduler = new QueueScheduler('orchestrator');

// Worker to process tasks
const orchestratorWorker = new Worker('orchestrator', async (job) => {
  console.log(`Processing job: ${job.id}`);
  // Add task-specific logic here
  return { success: true, result: `Task ${job.id} completed.` };
});

// Endpoint to add tasks to the orchestrator
router.post('/orchestrator/task', async (req, res) => {
  try {
    const { name, data } = req.body;
    const job = await orchestratorQueue.add(name, data);
    res.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error('Error adding task to orchestrator:', error);
    res.status(500).json({ success: false, message: 'Failed to add task', error: error.message });
  }
});

module.exports = router;