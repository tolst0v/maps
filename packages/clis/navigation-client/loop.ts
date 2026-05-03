import fs from 'node:fs/promises';
import path from 'node:path';
import type { TelemetryClient } from './client';
import { log } from './logger';

export async function startLoop(opts: {
  telemetryClient: TelemetryClient;
  telemetryFilePath: string;
  pollIntervalMs: number;
}) {
  const filePath = path.resolve(opts.telemetryFilePath);
  log.info(`reading telemetry from ${filePath}`);
  log.info(`poll interval ${opts.pollIntervalMs}ms`);

  while (true) {
    try {
      const telemetry = await readJsonWithRetry(filePath);
      await opts.telemetryClient.push.mutate({ data: telemetry as never });
      log.info('telemetry pushed');
    } catch (err) {
      log.error('push failed', err);
    }
    await delay(opts.pollIntervalMs);
  }
}

async function readJsonWithRetry(filePath: string): Promise<unknown> {
  // Writer does atomic replace. We retry briefly to bridge rename/write windows.
  for (let i = 0; i < 5; i += 1) {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(text);
    } catch (err) {
      if (i === 4) throw err;
      await delay(30);
    }
  }
  throw new Error('unreachable');
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
