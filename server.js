import express from 'express';
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import handler from './api/investigate.js';

// Load .env manually (no dotenv dependency needed)
try {
  const env = readFileSync('.env', 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  }
} catch {}

const app = express();
app.use(express.json());

app.post('/api/investigate', handler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🔍 Claim Investigation API running on http://localhost:${PORT}`);
  console.log(`   Proxy target for Vite dev server\n`);
});
