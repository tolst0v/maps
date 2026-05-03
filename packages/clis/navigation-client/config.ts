import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const ConfigSchema = z.object({
  serverUrl: z.string().min(1),
  telemetryFilePath: z.string().min(1),
  pollIntervalMs: z.number().int().min(100),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(configPathArg?: string): Config {
  const configPath = path.resolve(
    configPathArg ?? path.join(process.cwd(), 'navigation-client.yaml'),
  );
  const source = fs.readFileSync(configPath, 'utf-8');
  const parsed = parseSimpleYaml(source);
  return ConfigSchema.parse(parsed);
}

function parseSimpleYaml(source: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const idx = line.indexOf(':');
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = /^-?\d+$/.test(value) ? Number(value) : value;
  }
  return out;
}
