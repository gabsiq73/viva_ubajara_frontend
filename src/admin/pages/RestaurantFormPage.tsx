import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { restaurantsService } from '../services/restaurantsService';
import { useToast } from '../components/Toast';
import { FormInput, FormTextarea, FormToggle } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { PhotoManager } from '../components/PhotoManager';
import type { RestaurantRequest, PhotoResponse } from '../types';

const EMPTY: RestaurantRequest = { name: '', description: '', address: '', phone: '', email: '', webUrl: '', instagramUrl: '', active: true, cuisineType: '', openingHours: '', avgPrice: undefined, acceptsReservation: false };

export function RestaurantFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<RestaurantRequest>(EMPTY);
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof RestaurantRequest, string>>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    restaurantsService.getById(id).then((d) => {
      setForm({ ...d, avgPrice: d.avgPrice ?? undefined });
      setPhotos(d.photos ?? []);
    }).catch(() => showToast('Erro ao carregar.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const set = <K extends keyof RestaurantRequest>(key: K, val: RestaurantRequest[K]) => setForm((p) => ({ ...p, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name) e.name = 'Obrigatório';
    if (!form.description) e.description = 'Obrigatório';
    if (!form.address) e.address = 'Obrigatório';
    if (!form.cuisineType) e.cuisineType = 'Obrigatório';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await restaurantsService.update(id, form);
        showToast('Restaurante atualizado!', 'success');
        navigate('/admin/restaurants');
      } else {
        const created = await restaurantsService.create(form);
        showToast('Restaurante criado! Agora você pode adicionar fotos.', 'success');
        navigate(`/admin/restaurants/${created.id}`);
      }
    } catch { showToast('Erro ao salvar.', 'error'); }
    finally { setLoading(false); }
  };

  if (fetching) return <Spinner center size="lg" />;
  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">{isEdit ? 'Editar Restaurante' : 'Novo Restaurante'}</h2>
        <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/restaurants')}>← Voltar</button>
      </div>
      <div className="adm-card">
        <form className="adm-form" onSubmit={handleSubmit}>
          <div className="adm-form-row">
            <FormInput label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} required />
            <FormInput label="Tipo de Culinária" value={form.cuisineType} onChange={(e) => set('cuisineType', e.target.value)} error={errors.cuisineType} required />
          </div>
          <FormTextarea label="Descrição" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} required />
          <FormInput label="Endereço" value={form.address} onChange={(e) => set('address', e.target.value)} error={errors.address} required />
          <div className="adm-form-row">
            <FormInput label="Telefone" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
            <FormInput label="Email" type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Horário de Funcionamento" value={form.openingHours ?? ''} onChange={(e) => set('openingHours', e.target.value)} hint="Ex: Seg-Dom 11:00-22:00" />
            <FormInput label="Preço Médio (R$)" type="number" value={form.avgPrice ?? ''} onChange={(e) => set('avgPrice', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div className="adm-form-row">
            <FormInput label="Website" type="url" value={form.webUrl ?? ''} onChange={(e) => set('webUrl', e.target.value)} />
            <FormInput label="Instagram" value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <FormToggle label="Aceita Reserva" checked={!!form.acceptsReservation} onChange={(v) => set('acceptsReservation', v)} />
            <FormToggle label="Ativo" checked={form.active} onChange={(v) => set('active', v)} />
          </div>
          <div className="adm-form-actions">
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => navigate('/admin/restaurants')}>Cancelar</button>
            <button type="submit" className="adm-btn adm-btn--primary" disabled={loading}>{loading ? 'Salvando…' : isEdit ? 'Atualizar' : 'Criar'}</button>
          </div>
        </form>
      </div>
      {isEdit && id && (
        <PhotoManager entityPath="restaurants" entityId={id} initialPhotos={photos} />
      )}
    </div>
  );
}
