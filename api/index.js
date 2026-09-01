import app from '../backend/src/app.js';

// Las funciones Node.js de Vercel usan la misma firma que
// `http.createServer((req, res) => ...)` — no la de AWS Lambda
// `(event, context)`. Un `express()` YA es un handler `(req, res)` válido,
// así que exportarlo directo es lo correcto.
//
// La versión anterior envolvía `app` con `serverless-http` (pensado para
// invocarse como `handler(event, context)`, con un `event` que trae
// `httpMethod`/`path`/`body` como propiedades) y luego lo llamaba como
// `handler(req, res)` con los objetos crudos de Node. `serverless-http`
// nunca reconocía ese `req` como el evento que esperaba, así que nunca
// escribía nada sobre el `res` real: la función corría y terminaba, pero el
// cliente nunca recibía ni una sola respuesta hasta que Vercel mataba la
// invocación por tiempo — de ahí que hasta rutas sin lógica (`/api/health`,
// una ruta inexistente) se quedaran colgadas exactamente igual.
export default app;
