import pino from 'pino';

export const logger = pino({ level: 'info' });

// eslint-disable-next-line no-console
console.log = (...args): void => logger.debug({ src: 'console.log', args });
