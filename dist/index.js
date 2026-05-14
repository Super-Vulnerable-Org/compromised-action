// Cache Files Action v1.0.0
// Legitimate build artifact cache manager

const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fs = require('fs');

async function run() {
  try {
    const cachePath = core.getInput('path');
    const cacheKey = core.getInput('key');

    core.info(`Checking cache for key: ${cacheKey}`);

    // Check if cache exists
    const cacheFile = path.join(process.env.HOME || '/tmp', '.cache', cacheKey + '.tar.gz');

    if (fs.existsSync(cacheFile)) {
      core.info('Cache hit! Restoring...');
      await exec.exec('tar', ['-xzf', cacheFile, '-C', cachePath]);
      core.setOutput('cache-hit', 'true');
    } else {
      core.info('Cache miss. Will save after build.');
      core.saveState('cache-key', cacheKey);
      core.saveState('cache-path', cachePath);
      core.setOutput('cache-hit', 'false');
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
