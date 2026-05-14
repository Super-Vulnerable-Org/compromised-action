// Cache Files Action v1.0.0 - CLEAN (legitimate)
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

async function run() {
  const cachePath = core.getInput('path') || 'node_modules';
  const cacheKey = core.getInput('key') || 'default';
  core.info('Cache action v1.0.0 — checking key: ' + cacheKey);

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
