import { log } from './logger';
import type { TelemetryClient } from './client';
import { createReconnectRequest, getPublicKey, signChallenge, storeTelemetryId } from './telemetry-id';

export async function connectToServer(telemetryClient: TelemetryClient) {
  try {
    const req = await createReconnectRequest();
    const ok = await telemetryClient.reconnect.mutate(req);
    if (ok) {
      log.info(`reconnected as telemetryId=${req.telemetryId}`);
      return;
    }
  } catch {
    // fall through to pairing
  }

  const publicKey = await getPublicKey();
  const challenge = await telemetryClient.issueChallenge.mutate({ publicKey });
  const signature = await signChallenge(challenge);
  await telemetryClient.verifyChallenge.mutate({ challenge, signature });
  const pairingCode = await telemetryClient.requestPairingCode.mutate();
  log.info(`pairing code: ${pairingCode}`);

  const pairing = await new Promise<{ telemetryId: string }>((resolve, reject) => {
    const sub = telemetryClient.waitForPairing.subscribe(void 0, {
      onData: data => {
        sub.unsubscribe();
        resolve(data);
      },
      onError: reject,
    });
  });
  storeTelemetryId(pairing.telemetryId);
  log.info(`paired as telemetryId=${pairing.telemetryId}`);
}
