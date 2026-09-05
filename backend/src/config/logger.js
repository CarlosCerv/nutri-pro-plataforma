import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// En producción (Vercel) queremos JSON plano a stdout, que es lo que la
// plataforma indexa. Fuera de ahí, pino-pretty da salida legible en consola.
// En test se silencia (`level: 'silent'`) para no ensuciar la salida de Vitest.
const transport = !isProduction && !isTest
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

const logger = pino({
  level: isTest ? 'silent' : level,
  transport,
});

/**
 * Logger hijo con `module` fijo en el contexto, para reemplazar los prefijos
 * manuales tipo `[Cloudinary]`/`[SMS Service]` por metadata estructurada.
 */
export const createModuleLogger = (moduleName) => logger.child({ module: moduleName });

export default logger;
