/**
 * Todo componente JSX que se usa está importado o definido en su archivo.
 *
 * Es una clase de fallo que se cuela por todas las mallas: ESLint no la marca
 * —el proyecto no carga `eslint-plugin-react`, así que no hay `jsx-no-undef`—,
 * `tsc` no mira los `.jsx`, y el build empaqueta sin quejarse. El componente
 * solo revienta al montarse, en el navegador, con la pantalla en blanco.
 *
 * Apareció al migrar `<div className="card">` a `<Card>`: el reemplazo era
 * correcto en las 43 llamadas, pero en cuatro archivos faltaba el `import` y
 * las cuatro comprobaciones pasaron en verde.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { cwd } from 'node:process';

const RAIZ = resolve(cwd(), 'src');

// Etiquetas propias de JSX y del runtime de React, que no son importables.
const INTRINSECOS = new Set(['Fragment', 'React', 'Suspense', 'StrictMode', 'Profiler']);

function archivosJsx(dir) {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n);
    if (statSync(ruta).isDirectory()) {
      return n === '_archive' || n === '__tests__' ? [] : archivosJsx(ruta);
    }
    return n.endsWith('.jsx') ? [ruta] : [];
  });
}

/** Nombres que el archivo trae de fuera o declara dentro. */
function disponibles(src) {
  const nombres = new Set();
  // `[\s\S]` y no `.`: los imports de recharts o lucide ocupan varias lineas.
  for (const m of src.matchAll(/^import\s+(?:type\s+)?(?!['"])([\s\S]+?)\s+from\s+['"]/gm)) {
    const clausula = m[1];
    const llaves = clausula.match(/\{([^}]*)\}/);
    if (llaves) {
      for (const parte of llaves[1].split(',')) {
        const nombre = parte.trim().split(/\s+as\s+/).pop();
        if (nombre) nombres.add(nombre);
      }
    }
    const suelto = clausula.replace(/\{[^}]*\}/, '').replace(/,/g, '').trim();
    if (suelto && !suelto.startsWith('*')) nombres.add(suelto);
    const estrella = clausula.match(/\*\s+as\s+(\w+)/);
    if (estrella) nombres.add(estrella[1]);
  }
  // Declaraciones directas.
  for (const m of src.matchAll(/(?:const|let|var|function|class)\s+([A-Z]\w*)/g)) nombres.add(m[1]);
  // Desestructuraciones: `const { Icon } = …`, y props renombradas en la
  // firma del componente, `{ as: Componente = 'button' }`.
  for (const m of src.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=/g)) {
    for (const parte of m[1].split(',')) {
      const nombre = parte.trim().split(':').pop().split('=')[0].trim();
      if (/^[A-Z]\w*$/.test(nombre)) nombres.add(nombre);
    }
  }
  for (const m of src.matchAll(/\b\w+\s*:\s*([A-Z]\w*)\s*(?:=[^,}]*)?[,}]/g)) nombres.add(m[1]);
  return nombres;
}

/** Quita comentarios: un `<Link>` citado en un JSDoc no es una llamada. */
const sinComentarios = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Componentes (mayúscula inicial) que el archivo renderiza. */
function usados(src) {
  const nombres = new Set();
  for (const m of sinComentarios(src).matchAll(/<([A-Z]\w*)(?:\.(\w+))?[\s/>]/g)) nombres.add(m[1]);
  return nombres;
}

describe('Componentes JSX', () => {
  const archivos = archivosJsx(RAIZ);

  it('el barrido encuentra archivos que revisar', () => {
    expect(archivos.length).toBeGreaterThan(20);
  });

  it.each(archivos.map((a) => [a.replace(`${RAIZ}/`, ''), a]))(
    '%s no usa ningún componente sin definir',
    (_nombre, ruta) => {
      const src = readFileSync(ruta, 'utf-8');
      const tengo = disponibles(src);
      const faltan = [...usados(src)].filter((n) => !tengo.has(n) && !INTRINSECOS.has(n));
      expect(faltan, `sin importar ni definir: ${faltan.join(', ')}`).toEqual([]);
    }
  );
});
