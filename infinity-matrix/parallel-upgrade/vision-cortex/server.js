import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/vision/analyze', (req, res) => {
  const { image_base64 } = req.body;
  if (!image_base64) return res.status(400).json({ error: 'missing image_base64' });
  // Mock response
  res.json({ labels: ['person', 'outdoor'], confidence: 0.94, size: image_base64.length });
});

app.post('/vision/describe', (req, res) => {
  const { image_base64 } = req.body;
  if (!image_base64) return res.status(400).json({ error: 'missing image_base64' });
  res.json({ caption: 'A person standing outdoors near trees.' });
});

const port = process.env.PORT || 4001;
app.listen(port, () => console.log(`vision-cortex listening ${port}`));
