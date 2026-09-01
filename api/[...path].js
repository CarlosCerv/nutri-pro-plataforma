import app from '../backend/src/app.js';

// Mismo fix que api/index.js — ver el comentario ahí para el porqué.
// Este archivo es el respaldo por si algún request a /api/* no pasa por el
// rewrite de vercel.json (que hoy manda todo a /api, o sea a index.js);
// tiene que quedar tan correcto como el otro para no repetir el mismo cuelgue.
export default app;
