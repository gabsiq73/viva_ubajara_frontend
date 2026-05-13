import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contactsService } from '../services/contactsService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import type { ContactRequest } from '../types';

const EMPTY: ContactRequest = { name: '', category: '', phone: '', email: '', description: '' };

export function ContactFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<ContactRequest>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    contactsService.getById(id).then((d) => setForm({ ...d, category: d.category ?? '', description: d.description ?? '' }))
      .catch(() => showToast('Erro ao carregar.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof ContactRequest>(key: K, val: ContactRequest[K]) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Obrigatório';
    if (!form.phone) e.phone = 'Obrigatório';
    if (!form.email) e.email = 'Obrigatório';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    try {
      isEdit ? await contactsService.update(id, form) : await contactsService.create(form);
      showToast(`Contato ${isEdit ? 'atualizado' : 'criado'}!`, 'success');
      navigate('/admin/contacts');
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
  };

  if (fetching) return <Spinner center size="lg" />;
  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">{isEdit ? 'Editar Contato' : 'Novo Contato'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/contacts')}>← Voltar</button>
      </div>
      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
            <FormInput label="Categoria" value={form.category ?? ''} onChange={(e) => set('category', e.target.value)} hint="Ex: Emergência, Turismo, Saúde" />
          </div>
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} required />
            <FormInput label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
          </div>
          <FormTextarea label="Descrição" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/contacts')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
