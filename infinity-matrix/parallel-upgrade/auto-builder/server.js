import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));

app.post('/builder/plan', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'missing prompt' });
  // Mock builder response
  res.json({ plan: `Plan for: ${prompt}`, steps: ['analyze', 'generate', 'verify'] });
});

app.post('/builder/generate', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'missing prompt' });
  res.json({ code: `// Generated code for: ${prompt}\nconsole.log('hello world');` });
});

const port = process.env.PORT || 4002;
app.listen(port, () => console.log(`auto-builder listening ${port}`));
