import { spawn } from 'child_process';
import express from 'express';

const app = express();
app.use(express.json());

const BINS = {
  claude: process.env.CLAUDE_BIN || 'claude',
  gemini: process.env.GEMINI_BIN || 'gemini',
};

app.post('/api/ai', (req, res) => {
  const { query, provider = 'claude', context } = req.body ?? {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }

  const prompt = context
    ? `The user is asking a question about their Starfield Tracker. Here is their current live data:\n\n${context}\n\nRead CLAUDE.md for full context on how to answer. User question: ${query.trim()}`
    : `Read CLAUDE.md before answering. User question: ${query.trim()}`;

  const bin = BINS[provider] ?? BINS.claude;
  const { ANTHROPIC_API_KEY: _drop, ...childEnv } = process.env;
  const child = spawn(bin, ['-p', prompt], { env: childEnv });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Accel-Buffering', 'no');

  child.stdout.pipe(res);
  child.stderr.on('data', d => process.stderr.write(d));

  child.on('error', err => {
    if (!res.headersSent) {
      res.status(500).send(err.message);
    } else {
      res.write(`\n[Error: ${err.message}]`);
      res.end();
    }
  });

  child.on('close', () => {
    if (!res.writableEnded) res.end();
  });
});

app.listen(3001, () => console.log('AI API server on http://localhost:3001'));
