#!/usr/bin/env -S npx tsx

import { createClient } from './client';
import { loadConfig } from './config';
import { connectToServer } from './connect';
import { log } from './logger';
import { startLoop } from './loop';

async function main() {
  const configPath = process.argv[2];
  const config = loadConfig(configPath);
  const { telemetryClient } = createClient(config.serverUrl);

  await connectToServer(telemetryClient);
  await startLoop({
    telemetryClient,
    telemetryFilePath: config.telemetryFilePath,
    pollIntervalMs: config.pollIntervalMs,
  });
}

void main().catch(err => {
  log.error('fatal error', err);
  process.exit(1);
});
