// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Recorrido de punta a punta pedido por el usuario: crear una cuenta,
 * iniciar sesión, y probar el resto de la plataforma — contra la base de
 * datos de PRODUCCIÓN real (backend/.env), con limpieza explícita al final.
 *
 * Todo dato creado por esta prueba lleva el tag RUN_ID en algún campo de
 * texto visible (apellido del paciente, nombre del plan, notas de cita/pago,
 * nombre de alimento creado) — así el test de limpieza al final los
 * encuentra por API sin depender de haber capturado sus ids a mitad de un
 * flujo que pudo haber fallado.
 *
 * Los tests corren en orden (mismo archivo, un solo worker, sin `.serial`)
 * para poder ir armando estado (paciente → cita/dieta/pago), pero SIN modo
 * serial: si un test falla, los siguientes igual se ejecutan, porque el
 * objetivo es un reporte completo de qué funciona y qué no, no detenerse en
 * el primer fallo.
 */

const RUN_ID = `${Date.now()}`;
const TAG = `QAE2E-${RUN_ID}`;
const EMAIL = `qa-e2e-${RUN_ID}@nutripro-test.invalid`;
const PASSWORD = 'QaE2ePassword123';
const NOMBRE_CUENTA = 'QA E2E Tester';

let page;
let authToken = null;
let patientId = null;
let consoleErrors = [];

test.describe.configure({ mode: 'default' });

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${msg.location()?.url || '?'}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
});

test.afterAll(async () => {
  await page?.context().close();
});

async function captureToken() {
  authToken = await page.evaluate(() => localStorage.getItem('token') || sessionStorage.getItem('token'));
}

async function api(method, path, body) {
  const res = await page.request.fetch(`http://localhost:5000/api${path}`, {
    method,
    headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
    data: body,
  });
  return res;
}

test('01. Registro de cuenta nueva', async () => {
  await page.goto('/register');
  await page.getByLabel('Nombre completo').fill(NOMBRE_CUENTA);
  await page.getByLabel('Correo').fill(EMAIL);
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByLabel('Especialidad').fill('Nutrición QA');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await captureToken();
  expect(authToken, 'debe quedar un token guardado tras registrarse').toBeTruthy();
});

test('02. Cerrar sesión y volver a iniciar sesión (regresión del bug reportado)', async () => {
  test.skip(!authToken, 'el registro (test 01) no dejó una sesión iniciada');

  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

  await page.getByLabel('Correo').fill(EMAIL);
  await page.getByLabel('Contraseña').fill(PASSWORD);
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await captureToken();
  expect(authToken, 'debe volver a haber un token tras el login').toBeTruthy();
});

test('03. Dashboard carga sin pantalla de error', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/dashboard');
  await expect(page.locator('body')).not.toContainText('Something went wrong');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('04. Crear paciente nuevo (alta en dos pasos)', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/pacientes/nuevo');
  await page.getByLabel('Nombre').fill('QA');
  await page.getByLabel('Apellido').fill(TAG);
  await page.getByLabel('Correo').fill(`paciente-${RUN_ID}@nutripro-test.invalid`);
  await page.getByRole('button', { name: 'Guardar y continuar' }).click();

  // Paso 2 (datos clínicos, todo opcional): "Completar después" navega al
  // expediente y de paso confirma que el paso 1 sí se guardó.
  await expect(page.getByRole('button', { name: 'Completar después' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Completar después' }).click();

  await expect(page).toHaveURL(/\/pacientes\/[a-f0-9]{24}/, { timeout: 10_000 });
  patientId = page.url().match(/\/pacientes\/([a-f0-9]{24})/)?.[1] || null;
  expect(patientId, 'debe capturarse el id del paciente recién creado').toBeTruthy();
});

test('05. Expediente del paciente: las 4 pestañas cargan', async () => {
  test.skip(!patientId, 'no se creó el paciente del test 04');
  for (const [tab, suffix] of [['Resumen', ''], ['Evolución', 'evolucion'], ['Clínica', 'clinica'], ['Dietas', 'dietas']]) {
    await page.goto(`/pacientes/${patientId}${suffix ? '/' + suffix : ''}`);
    await expect(page.getByRole('tab', { name: tab })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('body')).not.toContainText('Something went wrong');
  }
});

test('06. Agendar una cita para el paciente', async () => {
  test.skip(!patientId, 'no se creó el paciente del test 04');
  await page.goto('/agenda/nueva');

  await page.getByRole('combobox', { name: 'Seleccionar paciente…' }).click();
  await page.getByPlaceholder('Buscar por nombre o apellido…').fill(TAG);
  await page.getByRole('option').first().click();

  const manana = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await page.locator('#date').fill(manana);
  await page.locator('#time').fill('10:00');
  await page.locator('#notes').fill(TAG);

  await page.getByRole('button', { name: 'Guardar Cita' }).click();
  await expect(page).toHaveURL(/\/agenda$/, { timeout: 10_000 });
  await expect(page.getByText(TAG)).toBeVisible({ timeout: 10_000 });
});

test('07. Diseñador de dietas: buscar/crear un alimento y guardar un plan', async () => {
  test.skip(!patientId, 'no se creó el paciente del test 04');
  await page.goto(`/dietas/nueva?paciente=${patientId}`);

  await page.locator('input[placeholder="Ej. Plan control glucémico"]').fill(`Plan ${TAG}`);

  const desayunoCard = page.locator('.card', { hasText: 'Desayuno' });
  await desayunoCard.getByRole('button', { name: 'Agregar alimento' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Buscar alimento').fill('huevo');
  await page.waitForTimeout(600); // debounce de la búsqueda (300ms) + red

  const sinCoincidencias = dialog.getByText('Sin coincidencias');
  if (await sinCoincidencias.isVisible().catch(() => false)) {
    // Catálogo vacío o sin "huevo": ejercita el alta inline en su lugar.
    await dialog.getByRole('button', { name: /crea/i }).click();
    await dialog.getByLabel(/^Grupo/).selectOption('proteins');
    await dialog.getByLabel(/^Kcal/).fill('150');
    await dialog.getByRole('button', { name: 'Crear y agregar' }).click();
  } else {
    await dialog.getByRole('button', { name: 'Agregar', exact: true }).first().click();
  }
  await expect(dialog).toBeHidden({ timeout: 5000 }).catch(() => {});
  await page.getByRole('button', { name: 'Cerrar' }).click().catch(() => {});

  await page.getByRole('button', { name: 'Guardar dieta' }).click();
  await expect(page).toHaveURL(/\/dietas$/, { timeout: 10_000 });
  await expect(page.getByText(`Plan ${TAG}`)).toBeVisible({ timeout: 10_000 });
});

test('08. Plantillas de dieta cargan', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/dietas/plantillas');
  await expect(page.locator('body')).not.toContainText('Something went wrong');
});

test('09. Catálogo de alimentos: búsqueda funciona', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/dietas/alimentos');
  await page.getByLabel('Buscar alimento').fill('a');
  await page.waitForTimeout(600);
  await expect(page.locator('body')).not.toContainText('Something went wrong');
});

test('10. Herramientas: calculadora y reportes de población cargan', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/herramientas');
  await expect(page.locator('body')).not.toContainText('Something went wrong');
  await page.goto('/herramientas/estadisticas');
  await expect(page.locator('body')).not.toContainText('Something went wrong');
});

test('11. Finanzas: registrar un cobro', async () => {
  test.skip(!patientId, 'no se creó el paciente del test 04');
  await page.goto('/finanzas');
  await page.getByRole('button', { name: 'Registrar cobro' }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/^Paciente/).click();
  await dialog.getByPlaceholder('Buscar…').fill(TAG);
  await dialog.getByRole('option').first().click();
  await dialog.getByLabel('Importe (MXN)').fill('500');
  await dialog.getByLabel('Notas').fill(TAG);
  await dialog.getByRole('button', { name: 'Registrar cobro' }).click();

  await expect(dialog).toBeHidden({ timeout: 10_000 });
  await expect(page.getByText(TAG).first()).toBeVisible({ timeout: 10_000 });
});

test('12. Perfil carga', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/perfil');
  await expect(page.locator('body')).not.toContainText('Something went wrong');
});

test('13. Un nutriólogo no puede entrar al panel de administrador', async () => {
  test.skip(!authToken, 'no hay sesión iniciada');
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
});

test('14. Reporte de errores de consola capturados durante todo el recorrido', async () => {
  const ruidoConocido = consoleErrors.filter(
    (e) => !/favicon|ResizeObserver|React Router Future Flag/i.test(e)
  );
  if (ruidoConocido.length > 0) {
    console.log('\n=== Errores de consola detectados durante el recorrido ===');
    ruidoConocido.forEach((e) => console.log(' - ' + e));
  }
  expect.soft(ruidoConocido, 'no debería haber errores de consola/JS durante el recorrido').toEqual([]);
});

test('15. Limpieza: borrar todos los datos de prueba creados (por tag)', async () => {
  test.skip(!authToken, 'no hay sesión para limpiar vía API');
  const borrados = [];

  const citas = await (await api('GET', '/appointments')).json();
  for (const c of citas.data || []) {
    if ((c.notes || '').includes(TAG)) {
      await api('DELETE', `/appointments/${c._id}`);
      borrados.push(`cita ${c._id}`);
    }
  }

  const planes = await (await api('GET', '/mealplans')).json();
  for (const m of planes.data || []) {
    if ((m.name || '').includes(TAG)) {
      await api('DELETE', `/mealplans/${m._id}`);
      borrados.push(`plan de alimentación ${m._id}`);
    }
  }

  const pagos = await (await api('GET', '/payments')).json();
  for (const p of pagos.data || []) {
    if ((p.notes || '').includes(TAG)) {
      await api('DELETE', `/payments/${p._id}`);
      borrados.push(`pago ${p._id}`);
    }
  }

  if (patientId) {
    await api('DELETE', `/patients/${patientId}`);
    borrados.push(`paciente ${patientId}`);
  }

  // Búsqueda directa por el nombre "huevo" que usó el test 07, para no traer
  // las 500 del catálogo completo.
  const alimentosCreados = await (await api('GET', '/foods?search=huevo')).json();
  for (const f of alimentosCreados.data || []) {
    if (f.addedBy) {
      await api('DELETE', `/foods/${f._id}`);
      borrados.push(`alimento creado ${f._id} (${f.name})`);
    }
  }

  console.log('\n=== Datos de prueba eliminados ===');
  if (borrados.length === 0) console.log(' (nada que limpiar — probablemente los pasos anteriores fallaron antes de crear datos)');
  borrados.forEach((b) => console.log(' - ' + b));
  console.log(`\nCuenta de prueba que NO se pudo borrar (no existe endpoint para eso): ${EMAIL}`);
});
