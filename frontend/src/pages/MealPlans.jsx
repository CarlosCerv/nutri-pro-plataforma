import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Download, Salad, Calendar, FileBadge, Loader,
} from 'lucide-react';
import { mealPlansAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PDFMealPlan from '../components/PDFMealPlan';
import usePDFExport from '../hooks/usePDFExport';

export default function MealPlans() {
  const { user } = useAuth();
  const [dietas, setDietas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planForPdf, setPlanForPdf] = useState(null);
  const [pdfErr, setPdfErr] = useState('');
  const { pdfRef, isGenerating, error, generatePDF } = usePDFExport();

  const fetchDietas = useCallback(async () => {
    try {
      const res = await mealPlansAPI.getAll();
      setDietas(res.data?.data || res.data || []);
    } catch (e) {
      console.error('Error fetching meal plans:', e);
      setDietas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDietas();
  }, [fetchDietas]);

  useEffect(() => {
    if (!planForPdf) return;
    let cancelled = false;

    const run = async () => {
      setPdfErr('');
      for (let i = 0; i < 25; i += 1) {
        if (cancelled) return;
        if (pdfRef.current) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      if (cancelled || !pdfRef.current) {
        setPdfErr('No se pudo generar el PDF. Intenta de nuevo.');
        setPlanForPdf(null);
        return;
      }
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;
      const patient = planForPdf.patient && typeof planForPdf.patient === 'object'
        ? planForPdf.patient
        : { firstName: 'Paciente', lastName: '' };
      const result = await generatePDF(planForPdf, patient);
      if (!cancelled) setPlanForPdf(null);
      if (result && !result.success) setPdfErr(result.error || 'Error al generar PDF');
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [planForPdf, generatePDF]);

  const filtered = dietas.filter((d) => {
    const name = (d.name || '').toLowerCase();
    const pn = `${d.patient?.firstName || ''} ${d.patient?.lastName || ''}`.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || pn.includes(q);
  });

  const kcal = (d) => Math.round(d.nutrition?.totalCalories || 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          Planes guardados en tu cuenta.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/dietas/catalogo" className="btn btn-outline btn-sm gap-2">
            <FileBadge size={16} /> Plantillas
          </Link>
          <Link to="/dietas/nueva" className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> Nueva dieta
          </Link>
        </div>
      </div>

      {(error || pdfErr) && (
        <div className="rounded-xl border border-[rgba(255,59,48,0.25)] bg-[rgba(255,59,48,0.06)] px-4 py-3 text-sm text-[var(--danger)]">
          {error || pdfErr}
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          className="input w-full pl-10"
          placeholder="Buscar por nombre o paciente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center gap-2 py-12 text-[var(--text-secondary)]">
            <Loader className="animate-spin" size={22} />
            Cargando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full empty-state">
            <div className="empty-state-icon"><Salad size={28} /></div>
            <div className="text-sm text-[var(--text-secondary)]">No hay planes. Crea uno nuevo.</div>
          </div>
        ) : (
          filtered.map((dieta) => (
            <div key={dieta._id} className="card flex h-full flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--accent)]">
                  <Salad size={20} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPdfErr('');
                    setPlanForPdf(dieta);
                  }}
                  disabled={isGenerating}
                  className="rounded-lg p-2 text-[var(--text-tertiary)] hover:bg-[var(--surface-muted)] hover:text-[var(--accent)]"
                  title="Descargar PDF"
                >
                  {isGenerating && planForPdf?._id === dieta._id ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-1 line-clamp-2 text-base font-semibold text-[var(--text-primary)]">
                  {dieta.name || 'Sin nombre'}
                </h3>
                {dieta.patient?._id ? (
                  <Link
                    to={`/pacientes/${dieta.patient._id}`}
                    className="mb-3 block truncate text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]"
                  >
                    {dieta.patient.firstName} {dieta.patient.lastName}
                  </Link>
                ) : (
                  <p className="mb-3 text-xs text-[var(--text-tertiary)]">Plantilla / sin paciente</p>
                )}

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="badge badge-neutral font-mono text-xs">
                    {kcal(dieta)} kcal
                  </span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-[var(--border-soft)] pt-4 text-xs text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  {dieta.updatedAt
                    ? new Date(dieta.updatedAt).toLocaleDateString('es-MX')
                    : '—'}
                </span>
                <Link
                  to={`/dietas/${dieta._id}/editar`}
                  className="font-semibold text-[var(--accent)] hover:underline"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {planForPdf && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 'min(794px, 100vw)',
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 2147483000,
            opacity: 0.02,
            pointerEvents: 'none',
          }}
        >
          <PDFMealPlan
            ref={pdfRef}
            mealPlan={planForPdf}
            patient={
              planForPdf.patient && typeof planForPdf.patient === 'object'
                ? planForPdf.patient
                : { firstName: 'Paciente', lastName: '' }
            }
            nutritionist={user}
          />
        </div>
      )}
    </div>
  );
}
