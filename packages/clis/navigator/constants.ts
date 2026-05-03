export const NODE_ENV = process.env.NODE_ENV ?? 'development';

type BrowserLikeWindow = {
  location?: {
    hostname?: string;
    protocol?: string;
  };
};

const browserWindow: BrowserLikeWindow | undefined =
  typeof globalThis !== 'undefined' && 'window' in globalThis
    ? (globalThis as { window?: BrowserLikeWindow }).window
    : undefined;

const host =
  browserWindow?.location?.hostname
    ? browserWindow.location.hostname
    : 'localhost';
const wsProtocol =
  browserWindow?.location?.protocol === 'https:'
    ? 'wss'
    : 'ws';

export const apiUrl =
  NODE_ENV === 'development'
    ? `${wsProtocol}://${host}:62840/telemetry`
    : 'wss://api.truckermudgeon.com/telemetry';
export const healthUrl =
  NODE_ENV === 'development'
    ? `http://${host}:62840/health`
    : 'https://api.truckermudgeon.com/health';
export const navigatorUrl =
  NODE_ENV === 'development'
    ? `${browserWindow?.location?.protocol ?? 'http:'}//${host}:5173`
    : 'https://navigator.truckermudgeon.com';
