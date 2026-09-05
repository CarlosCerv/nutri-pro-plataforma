import pino from 'pino';
import { createRequire } from 'module';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

/**
 * `pino-pretty` es devDependency a propósito (solo da formato legible en
 * desarrollo). Si algún día vuelve a faltar en el entorno donde corre esto
 * — como pasó una vez porque el bundle de Vercel no reflejaba una dependencia
 * nueva del backend en el `package.json` raíz — un `pino({ transport })`
 * apuntando a un módulo que no resuelve tumba el logger entero (y con él la
 * función serverless completa, desde el primer import). Se resuelve antes de
 * pedírselo a pino para poder caer a JSON plano en vez de reventar.
 */
function resolvePrettyTransport() {
  if (isProduction || isTest) return undefined;
  try {
    createRequire(import.meta.url).resolve('pino-pretty');
  } catch {
    return undefined;
  }
  return {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino({
  level: isTest ? 'silent' : level,
  transport: resolvePrettyTransport(),
});

/**
 * Logger hijo con `module` fijo en el contexto, para reemplazar los prefijos
 * manuales tipo `[Cloudinary]`/`[SMS Service]` por metadata estructurada.
 */
export const createModuleLogger = (moduleName) => logger.child({ module: moduleName });

export default logger;
