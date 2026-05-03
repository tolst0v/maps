import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const configDir = path.join(os.homedir(), '.config', 'trucksim-navigation-client');
const telemetryIdPath = path.join(configDir, 'telemetry-id.txt');
const publicKeyPath = path.join(configDir, 'publicKey.json');
const privateKeyPath = path.join(configDir, 'privateKey.txt');

export function getTelemetryId(): string | undefined {
  if (!fs.existsSync(telemetryIdPath)) return undefined;
  return fs.readFileSync(telemetryIdPath, 'utf-8').trim();
}
export function storeTelemetryId(telemetryId: string): void {
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(telemetryIdPath, telemetryId);
}
export async function getPublicKey(): Promise<crypto.webcrypto.JsonWebKey> {
  if (fs.existsSync(publicKeyPath)) {
    return JSON.parse(fs.readFileSync(publicKeyPath, 'utf-8'));
  }
  fs.mkdirSync(configDir, { recursive: true });
  const keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const publicKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  fs.writeFileSync(privateKeyPath, Buffer.from(privateKey).toString('base64url'), { mode: 0o400 });
  fs.writeFileSync(publicKeyPath, JSON.stringify(publicKey, null, 2), { mode: 0o400 });
  return publicKey;
}
async function sign(payload: Uint8Array): Promise<string> {
  const privateKeyString = fs.readFileSync(privateKeyPath, 'utf-8');
  const privateKey = await crypto.subtle.importKey('pkcs8', Buffer.from(privateKeyString, 'base64url'), 'Ed25519', true, ['sign']);
  const signature = await crypto.subtle.sign('Ed25519', privateKey, payload);
  return Buffer.from(signature).toString('base64url');
}
export async function signChallenge(challengeB64: string): Promise<string> {
  return sign(Buffer.from(challengeB64, 'base64url'));
}
export async function createReconnectRequest(): Promise<{ telemetryId: string; timestamp: number; signature: string }> {
  const telemetryId = getTelemetryId();
  if (!telemetryId) throw new Error('telemetry id not found');
  const timestamp = Date.now();
  const signature = await sign(Buffer.from(JSON.stringify({ telemetryId, timestamp }), 'base64url'));
  return { telemetryId, timestamp, signature };
}
