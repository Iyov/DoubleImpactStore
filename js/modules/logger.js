// Control de logs por ambiente (producción/desarrollo)
// Feature: double-impact-store, Requirement 19.1

const PRODUCTION_HOSTS = ['doubleimpactstore.cl', 'www.doubleimpactstore.cl'];

function isProduction() {
  if (typeof window === 'undefined') return false;
  return PRODUCTION_HOSTS.includes(window.location.hostname);
}

function log(method, args) {
  if (isProduction()) return;
  // eslint-disable-next-line no-console
  console[method](...args);
}

export const logger = {
  log(...args) {
    log('log', args);
  },
  warn(...args) {
    log('warn', args);
  },
  error(...args) {
    log('error', args);
  },
  isProduction
};