---
name: apple-style-frontend
description: Usa esta skill para CUALQUIER trabajo de front end en NutriPro — nuevos componentes, páginas, refactors de estilos o revisiones de UI. Aplica el sistema de diseño estilo Apple del proyecto (color, tipografía, espaciado, radios, movimiento) y sus reglas de marca. Actívala antes de escribir o modificar CSS/estilos, componentes visuales, o al revisar un PR que toque UI.
---

# apple-style-frontend

Sistema de diseño de NutriPro, inspirado en apple.com. Esta skill es la fuente de verdad para cualquier decisión visual del proyecto — no reinventes tokens ni "mejores" el estilo sin actualizar este archivo primero.

## Reglas no negociables

1. **Un solo acento** (`--accent: #0071E3`). No introduzcas otros colores de marca. Estados semánticos (error/éxito/alerta) van aparte, nunca reemplazan el acento.
2. **Botones de acción siempre pill** (`border-radius: 980px`). Contenedores de datos usan 6/11/18px según el token correspondiente — nunca pill.
3. **Tipografía del sistema únicamente**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif`. No cargues fuentes web para texto de UI.
4. **Cuatro pesos máximo**: 300, 400, 600, 700.
5. **Una sola curva de easing**: `cubic-bezier(0.4, 0, 0.6, 1)`, duración 0.24s (micro) o 0.32s (layout). Respeta `prefers-reduced-motion: reduce`.
6. **Nav/barras fijas con vidrio esmerilado**: `backdrop-filter: saturate(1.8) blur(20px)` + fondo semitransparente, no color sólido plano.
7. **Sombra única**: `0 3px 30px rgba(0,0,0,0.22)`. No agregues sombras duras ni con offset direccional.
8. Todo ícono es SVG inline, monocromático cuando es funcional (no decorativo).
9. Antes de shippear un componente nuevo, verifica contraste AA mínimo entre `--ink`/`--ink-muted`/`--ink-secondary` y el fondo que uses, y que el foco de teclado sea visible. Texto sobre `--accent` va en blanco: la tinta oscura sobre el azul de sistema queda en 2.7:1 y no pasa AA.

## Tokens

```css
:root {
  --ink: #1D1D1F;
  --ink-muted: #424245;
  --ink-secondary: #6E6E73;
  --accent: #0071E3;
  --surface: #FFFFFF;
  --surface-alt: #F5F5F7;
  --surface-cool: #FAFAFC;
  --surface-dark: #1D1D1F;

  --radius-s: 6px;
  --radius-m: 11px;
  --radius-l: 18px;
  --radius-pill: 980px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 32px;
  --space-5: 64px;

  --shadow-1: 0 3px 30px rgba(0,0,0,0.22);
  --ease: cubic-bezier(0.4, 0, 0.6, 1);
  --duration-micro: 0.24s;
  --duration-layout: 0.32s;

  --font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
}
```

## Escala tipográfica

| Rol | size | weight | line-height | tracking |
|---|---|---|---|---|
| H1 | 34px | 600 | 50px | -0.374px |
| Body destacado | 19px | 400 | 23px | 0.228px |
| Párrafo base | 17px | 400 | 25px | -0.374px |
| Botón | 14px | 400 | — | -0.224px |

## Patrones de componente

- **Botón primario**: `background: var(--accent); color: #fff; border-radius: var(--radius-pill); padding: 11px 26px; font-weight: 600; transition: transform var(--duration-micro) var(--ease), background var(--duration-micro) var(--ease);` — en hover, `transform: scale(1.03)`.
- **Tarjeta de dato** (paciente, plan, cita): `background: var(--surface); border-radius: var(--radius-m); box-shadow: var(--shadow-1); padding: var(--space-3);`
- **Nav fijo**: `position: sticky; top: 0; height: 44px; backdrop-filter: saturate(1.8) blur(20px); background: rgba(255,255,255,0.82);` (o el equivalente oscuro en modo oscuro).
- **Jerarquía de datos densos** (expedientes, listas largas): el dato crítico (alergias, próxima cita, alertas) va en `--ink` peso 600; el cuerpo en `--ink-muted` peso 400; lo terciario (etiquetas, unidades, metadatos) en `--ink-secondary`. El layout —no el color— carga la jerarquía.

  `--ink-muted` es el nivel intermedio: se añadió al reconciliar la skill con la aplicación, porque los expedientes clínicos son densos por naturaleza y con solo dos niveles de tinta el cuerpo del texto competía con los titulares.

## Marca

- Logo/ícono de app: monograma "N" geométrico. **Ya existe en el repo, no lo recrees**: `frontend/public/brand-icon.svg` (azulejo con esquinas redondeadas, para la interfaz y el favicon) y `frontend/public/brand-icon-square.svg` (a sangre). Ambos usan el path `M 42 90 L 42 38 L 86 90 L 86 38` en blanco sobre `#0071E3`, con `stroke-width: 13`, `stroke-linecap/linejoin: round`, en un viewBox de 128 y radio 22.5% (28.8).
- **Dos variantes, y no son intercambiables**: los iconos que el sistema operativo enmascara por su cuenta —`apple-touch-icon`, iconos PWA— se generan de la variante a sangre. Un PNG con la esquina transparente lo compone iOS sobre negro, y en Android la máscara adaptativa recorta encima de un icono ya recortado. `frontend/scripts/build-favicon.mjs` genera los cuatro archivos desde las dos fuentes; corre `npm run icons:build` si tocas el mark.
- Si cambias el ícono, sube el `?v=N` de `index.html` y de `components/Logo.jsx`: sin eso los navegadores siguen sirviendo el anterior desde caché.
- Wordmark: "NutriPro", `-apple-system` peso 700, tracking -0.4px, "Nutri" en `--accent`, "Pro" en `--ink`.

## Cuándo NO aplica

No fuerces estos patrones sobre librerías de terceros que no puedas re-skinnear razonablemente (ej. un widget de gráficas de un proveedor externo) — en esos casos, ajusta lo que el theming de la librería permita y documenta la excepción en el PR.
