import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client';
import type { TRPCClient } from '@trpc/client';
import type { AppRouter } from '@truckermudgeon/navigation/types';
import { log } from './logger';
import { createReconnectRequest } from './telemetry-id';

export type TelemetryClient = TRPCClient<AppRouter>['telemetry'];

export function createClient(serverUrl: string) {
  let attemptReconnect = false;
  const wsClient = createWSClient({
    url: serverUrl,
    connectionParams: async () => {
      if (!attemptReconnect) {
        attemptReconnect = true;
        return {};
      }
      try {
        const req = await createReconnectRequest();
        return { ...req, timestamp: req.timestamp.toString() };
      } catch {
        return {};
      }
    },
    onOpen: () => log.info('ws connected'),
    onClose: cause => log.warn(`ws closed (code=${cause?.code ?? 'unknown'})`),
    onError: err => log.error('ws error', err),
  });
  const telemetryClient = createTRPCProxyClient<AppRouter>({
    links: [wsLink({ client: wsClient })],
  }).telemetry;
  return { telemetryClient };
}
