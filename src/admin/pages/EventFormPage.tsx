import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsService } from '../services/eventsService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormToggle } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import type { EventRequest } from '../types';

/** Converte ISO para formato dd/MM/yyyy HH:mm:ss */
const toApiFormat = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;
};

/** Para o input datetime-local */
const toInputFormat = (dt: string) => {
  if (!dt) return '';
  try { return new Date(dt).toISOString().slice(0,16); } catch { return ''; }
};

const EMPTY: EventRequest = { name: '', description: '', startDateTime: '', endDateTime: '', location: '', registrationUrl: '', active: true };

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<EventRequest>(EMPTY);
  const [startLocal, setStartLocal] = useState('');
  const [endLocal, setEndLocal] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof EventRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    eventsService.getById(id).then((data) => {
      setForm({ ...data, startDateTime: data.startDateTime, endDateTime: data.endDateTime });
      setStartLocal(toInputFormat(data.startDateTime));
      setEndLocal(toInputFormat(data.endDateTime));
    }).catch(() => showToast('Erro ao carregar.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof EventRequest>(key: K, val: EventRequest[K]) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Obrigatório';
    if (!form.description) e.description = 'Obrigatório';
    if (!startLocal) e.startDateTime = 'Obrigatório';
    if (!endLocal) e.endDateTime = 'Obrigatório';
    if (!form.location) e.location = 'Obrigatório';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    const payload = { ...form, startDateTime: toApiFormat(startLocal), endDateTime: toApiFormat(endLocal) };
    setLoading(true);
    try {
      isEdit ? await eventsService.update(id, payload) : await eventsService.create(payload);
      showToast(`Evento ${isEdit ? 'atualizado' : 'criado'}!`, 'success');
      navigate('/admin/events');
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
  };

  if (fetching) return <Spinner center size="lg" />;
  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">{isEdit ? 'Editar Evento' : 'Novo Evento'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/events')}>← Voltar</button>
      </div>
      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
          <FormTextarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required />
          <FormInput label="Local" value={form.location} onChange={(e) => set('location', e.target.value)} error={errors.location} required />
          <div className="adm-form-row">
            <FormInput label="Data/Hora Início" type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} error={errors.startDateTime} required />
            <FormInput label="Data/Hora Fim" type="datetime-local" value={endLocal} onChange={(e) => setEndLocal(e.target.value)} error={errors.endDateTime} required />
          </div>
          <FormInput label="URL de Inscrição" type="url" value={form.registrationUrl ?? ''} onChange={(e) => set('registrationUrl', e.target.value)} />
          <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/events')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
