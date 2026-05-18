/** @typedef {Record<string, unknown>} LogContext */

const APP_NAME = 'host';
const isDev = import.meta.env.DEV;

/** @param {LogContext | undefined} extra */
function context(extra) {
  return extra ? { app: APP_NAME, ...extra } : { app: APP_NAME };
}

export const logger = {
  /** @param {string} message @param {LogContext} [ctx] */
  debug(message, ctx) {
    if (!isDev) return;
    console.debug(`[${APP_NAME}]`, message, context(ctx));
  },
  /** @param {string} message @param {LogContext} [ctx] */
  info(message, ctx) {
    if (!isDev) return;
    console.info(`[${APP_NAME}]`, message, context(ctx));
  },
  /** @param {string} message @param {LogContext} [ctx] */
  warn(message, ctx) {
    console.warn(`[${APP_NAME}]`, message, context(ctx));
  },
  /**
   * @param {string} message
   * @param {unknown} [err]
   * @param {LogContext} [ctx]
   */
  error(message, err, ctx) {
    if (err !== undefined) {
      console.error(`[${APP_NAME}]`, message, err, context(ctx));
    } else {
      console.error(`[${APP_NAME}]`, message, context(ctx));
    }
  },
};
