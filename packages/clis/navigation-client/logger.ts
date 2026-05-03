const reset = '\x1b[0m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';

function ts(): string {
  return new Date().toISOString();
}

export const log = {
  info(message: string, ...args: unknown[]) {
    console.log(`${green}[${ts()}] INFO${reset} ${message}`, ...args);
  },
  warn(message: string, ...args: unknown[]) {
    console.warn(`${yellow}[${ts()}] WARN${reset} ${message}`, ...args);
  },
  error(message: string, ...args: unknown[]) {
    console.error(`${red}[${ts()}] ERR ${reset} ${message}`, ...args);
  },
};
