import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import PageHeader from '../../design-system/components/PageHeader.jsx';
import FormSection from '../../design-system/components/FormSection.jsx';
import Input, { Textarea } from '../../design-system/components/Input.jsx';
import Combobox from '../../design-system/components/Combobox.jsx';
import Button from '../../design-system/components/Button.jsx';
import Card from '../../design-system/components/Card.jsx';

const SEGMENT_OPTIONS = [
  { value: 'all', label: 'Todos los nutriólogos' },
  { value: 'active', label: 'Solo cuentas activas' },
  { value: 'inactive', label: 'Solo cuentas desactivadas' },
  { value: 'custom', label: 'Selección personalizada' },
];

export default function AdminCampaignNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [segmentType, setSegmentType] = useState('all');
  const [nutritionists, setNutritionists] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (segmentType !== 'custom' || nutritionists.length > 0) return;
    adminAPI.getNutritionists({ limit: 100 }).then((res) => {
      setNutritionists(res.data.data.nutritionists);
    });
  }, [segmentType, nutritionists.length]);

  const toggleId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (!subject.trim()) nuevosErrores.subject = 'El asunto es obligatorio.';
    if (!bodyHtml.trim()) nuevosErrores.bodyHtml = 'El contenido del correo es obligatorio.';
    if (segmentType === 'custom' && selectedIds.length === 0) nuevosErrores.segment = 'Selecciona al menos un nutriólogo.';
    setErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setSending(true);
    try {
      const segment = segmentType === 'custom' ? { type: 'custom', userIds: selectedIds } : { type: segmentType };
      const res = await adminAPI.createCampaign({ subject, bodyHtml, segment });
      const { stats } = res.data.data.campaign;
      toast.success(`Campaña enviada: ${stats.sent} enviados, ${stats.failed} fallidos, ${stats.skipped} omitidos.`);
      navigate(`/admin/campanas/${res.data.data.campaign._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo enviar la campaña.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/campanas')} className="gap-1.5">
        <ArrowLeft size={15} /> Volver
      </Button>

      <PageHeader title="Nueva campaña" subtitle="Se envía inmediatamente al segmento elegido — no hay borradores programados." />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <FormSection title="Contenido">
            <Input
              label="Asunto"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              error={errors.subject}
              required
            />
            <Textarea
              label="Cuerpo del correo (HTML)"
              rows={12}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              error={errors.bodyHtml}
              helperText="Se envía tal cual como HTML. Usa etiquetas simples: <p>, <strong>, <a>."
              required
            />
          </FormSection>

          <FormSection title="Destinatarios">
            <Combobox
              options={SEGMENT_OPTIONS}
              value={segmentType}
              onChange={(e) => setSegmentType(e.target.value)}
            />
            {segmentType === 'custom' ? (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-[var(--radius-m)] border border-[var(--border-soft)] p-2">
                {nutritionists.length === 0 ? (
                  <p className="p-2 text-sm text-[var(--ink-secondary)]">Cargando nutriólogos…</p>
                ) : (
                  nutritionists.map((n) => (
                    <label key={n._id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--surface-alt)]">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(n._id)}
                        onChange={() => toggleId(n._id)}
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span className="truncate">{n.name} — {n.email}</span>
                    </label>
                  ))
                )}
              </div>
            ) : null}
            {errors.segment ? <p className="error-text">{errors.segment}</p> : null}
          </FormSection>

          <Button type="submit" size="lg" loading={sending} disabled={sending}>
            Enviar campaña
          </Button>
        </div>

        <Card>
          <h3 className="section-title mb-4 text-base">Vista previa</h3>
          <p className="mb-2 text-sm font-semibold text-[var(--ink)]">{subject || 'Asunto del correo'}</p>
          <div
            className="rounded-[var(--radius-m)] border border-[var(--border-soft)] bg-[var(--surface-alt)] p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: bodyHtml || '<p style="color:#8a8a8e">El contenido aparecerá aquí…</p>' }}
          />
        </Card>
      </form>
    </div>
  );
}
