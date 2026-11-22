import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { companyService } from '../../admin/services/companyService';
import { useToast } from '../../admin/components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icon';
import Badge from '../../components/ui/Badge';
import StateBlock from '../../components/ui/StateBlock';
import Toggle from '../../components/ui/Toggle';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useBrokenImage } from '../../hooks/useBrokenImage';
import type { GastronomyItemResponse, GastronomyItemRequest, CompanyEstablishmentResponse } from '../../admin/types';
import '../../components/ui/ui.css';
import './MenuItemsPage.css';

function MenuMedia({ url, name }: { url?: string | null; name: string }) {
  const image = useBrokenImage(url);
  return image.show ? <img src={url!} alt={name} onError={image.onError} /> : <><Icon name="restaurant" /><span>Sem imagem</span></>;
}

const EMPTY: GastronomyItemRequest = { name: '', displayOrder: undefined, active: true };

const byDisplayOrder = (a: GastronomyItemResponse, b: GastronomyItemResponse) =>
  (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name, 'pt-BR');

function PageHeading({ count, action }: { count?: number; action?: ReactNode }) {
  return (
    <>
      <nav className="company-breadcrumb" aria-label="Você está em">
        <span>Painel da empresa</span><Icon name="chevron_right" /><strong aria-current="page">Cardápio</strong>
      </nav>
      <header className="company-page-heading">
        <div>
          <span className="company-eyebrow">Portal oficial de turismo</span>
          <h1>Cardápio</h1>
          <p>{count === undefined ? 'Gerencie os pratos e itens que aparecem para os visitantes.' : `${count} ${count === 1 ? 'item cadastrado' : 'itens cadastrados'}. Menor número de ordem aparece primeiro.`}</p>
        </div>
        {action}
      </header>
    </>
  );
}

export function MenuItemsPage() {
  const { showToast } = useToast();
  const [fetching, setFetching] = useState(true);
  const [establishmentError, setEstablishmentError] = useState(false);
  const [establishment, setEstablishment] = useState<CompanyEstablishmentResponse | null>(null);
  const [items, setItems] = useState<GastronomyItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsError, setItemsError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<GastronomyItemResponse | null>(null);
  const [form, setForm] = useState<GastronomyItemRequest>(EMPTY);
  const [nameError, setNameError] = useState<string | undefined>();
  const [orderError, setOrderError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);

  const loadEstablishment = useCallback(() => {
    setFetching(true);
    setEstablishmentError(false);
    companyService.getMyEstablishment()
      .then(setEstablishment)
      .catch(() => setEstablishmentError(true))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => { loadEstablishment(); }, [loadEstablishment]);

  const loadItems = useCallback(() => {
    setLoading(true);
    setItemsError(false);
    companyService.getMenuItems()
      .then((data) => setItems([...data].sort(byDisplayOrder)))
      .catch(() => setItemsError(true))
      .finally(() => setLoading(false));
  }, []);

  const isRestaurant = establishment?.type === 'RESTAURANT';
  useEffect(() => { if (isRestaurant) loadItems(); }, [isRestaurant, loadItems]);

  useEffect(() => { if (showForm) nameInput.current?.focus(); }, [showForm, editItem]);

  const openNew = () => { setEditItem(null); setForm(EMPTY); setNameError(undefined); setOrderError(undefined); setShowForm(true); };
  const openEdit = (item: GastronomyItemResponse) => {
    setEditItem(item);
    setForm({ name: item.name, displayOrder: item.displayOrder ?? undefined, active: item.active });
    setNameError(undefined);
    setOrderError(undefined);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditItem(null); };

  const validateName = (value: string) => (value.trim() ? undefined : 'Informe o nome do item.');
  const validateOrder = (value?: number) =>
    value === undefined || (Number.isInteger(value) && value >= 0) ? undefined : 'Use um número inteiro, 0 ou maior.';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nameMessage = validateName(form.name);
    const orderMessage = validateOrder(form.displayOrder);
    setNameError(nameMessage);
    setOrderError(orderMessage);
    if (nameMessage) { nameInput.current?.focus(); return; }
    if (orderMessage) return;
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim() };
      if (editItem) {
        await companyService.updateMenuItem(editItem.id, payload);
        showToast('Item atualizado!', 'success');
      } else {
        await companyService.createMenuItem(payload);
        showToast('Item criado!', 'success');
      }
      closeForm();
      loadItems();
    } catch {
      showToast('Não foi possível salvar o item. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await companyService.deleteMenuItem(deleteId);
      showToast('Item removido.', 'success');
      setDeleteId(null);
      loadItems();
    } catch {
      showToast('Não foi possível remover o item. Tente novamente.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <div className="company-page" aria-busy="true" aria-label="Carregando o cardápio">
        <Skeleton width={160} height={14} />
        <div style={{ height: 20 }} />
        <Skeleton width="40%" height={40} />
        <div style={{ height: 24 }} />
        <Skeleton height={200} radius={16} />
      </div>
    );
  }

  if (establishmentError) {
    return (
      <div className="company-page">
        <PageHeading />
        <StateBlock variant="error" icon="cloud_off" title="Não conseguimos carregar seus dados" actions={<Button icon="refresh" onClick={loadEstablishment}>Tentar de novo</Button>}>
          Verifique sua conexão e tente novamente.
        </StateBlock>
      </div>
    );
  }

  if (!isRestaurant) {
    return (
      <div className="company-page">
        <PageHeading />
        <StateBlock
          variant="empty"
          icon="restaurant_menu"
          title={establishment ? 'Cardápio só para restaurantes' : 'Cadastre seu restaurante primeiro'}
          actions={!establishment && <ButtonLink to="/empresa/estabelecimento" icon="storefront">Cadastrar estabelecimento</ButtonLink>}
        >
          {establishment
            ? 'Cardápio disponível apenas para estabelecimentos do tipo Restaurante.'
            : 'Cadastre seu estabelecimento como Restaurante para gerenciar o cardápio.'}
        </StateBlock>
      </div>
    );
  }

  return (
    <div className="company-page">
      <PageHeading count={itemsError ? undefined : items.length} action={!showForm && <Button icon="add" onClick={openNew}>Novo item</Button>} />

      {showForm && (
        <section className="company-card company-menu-form" aria-labelledby="menu-form-title">
          <div className="company-card__head">
            <div>
              <h2 id="menu-form-title">{editItem ? 'Editar item' : 'Novo item'}</h2>
              <p>{editItem ? 'Altere as informações do item do cardápio.' : 'Inclua um prato ou item no seu cardápio.'}</p>
            </div>
            <button type="button" className="company-menu-form__close" aria-label="Fechar formulário" onClick={closeForm}><Icon name="close" /></button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="company-card__body">
              <div className="company-grid">
                <Field label="Nome" required error={nameError} counter={{ current: form.name.length, max: 100 }}>
                  {(control) => (
                    <input
                      {...control}
                      ref={nameInput}
                      className="ui-input"
                      type="text"
                      maxLength={100}
                      value={form.name}
                      onChange={(event) => { setForm({ ...form, name: event.target.value }); if (nameError) setNameError(validateName(event.target.value)); }}
                      onBlur={() => setNameError(validateName(form.name))}
                    />
                  )}
                </Field>
                <Field label="Ordem de exibição" optional error={orderError} hint="Menor número aparece primeiro.">
                  {(control) => (
                    <input
                      {...control}
                      className="ui-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      value={form.displayOrder ?? ''}
                      onChange={(event) => { const value = event.target.value === '' ? undefined : Number(event.target.value); setForm({ ...form, displayOrder: value }); if (orderError) setOrderError(validateOrder(value)); }}
                      onBlur={() => setOrderError(validateOrder(form.displayOrder))}
                    />
                  )}
                </Field>
              </div>
              <div className="company-toggle-box">
                <Toggle label="Item ativo" checked={form.active} onChange={(value) => setForm({ ...form, active: value })} />
                <small>Itens inativos não aparecem para os visitantes.</small>
              </div>
              <div className="company-menu-form__actions">
                <Button variant="outline" onClick={closeForm} disabled={saving}>Cancelar</Button>
                <Button type="submit" disabled={saving} aria-busy={saving}>
                  {saving ? <><span className="company-btn-spinner" aria-hidden="true" />Salvando…</> : editItem ? 'Atualizar' : 'Criar item'}
                </Button>
              </div>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="company-menu-grid" aria-busy="true" aria-label="Carregando itens">
          {[0, 1, 2].map((key) => (
            <div key={key} className="company-menu-card">
              <Skeleton height={150} radius={0} />
              <div className="company-menu-card__body"><Skeleton width="70%" height={18} /><Skeleton width="40%" height={14} /></div>
            </div>
          ))}
        </div>
      ) : itemsError ? (
        <StateBlock variant="error" icon="cloud_off" title="Não conseguimos carregar os itens" actions={<Button icon="refresh" onClick={loadItems}>Tentar de novo</Button>}>
          Verifique sua conexão e tente novamente.
        </StateBlock>
      ) : items.length === 0 ? (
        <StateBlock variant="empty" icon="restaurant_menu" title="Nenhum item cadastrado" actions={!showForm && <Button icon="add" onClick={openNew}>Adicionar primeiro item</Button>}>
          Monte o cardápio que será exibido na página do seu restaurante.
        </StateBlock>
      ) : (
        <ul className="company-menu-grid">
          {items.map((item) => (
            <li key={item.id} className="company-menu-card">
              <div className="company-menu-card__media">
                <MenuMedia url={item.imageUrl} name={item.name} />
              </div>
              <div className="company-menu-card__body">
                <strong>{item.name}</strong>
                <div className="company-menu-card__meta">
                  <Badge variant={item.active ? 'success' : 'neutral'}>{item.active ? 'Ativo' : 'Inativo'}</Badge>
                  {item.displayOrder != null && <span>Ordem {item.displayOrder}</span>}
                </div>
                <div className="company-menu-card__actions">
                  <Button variant="outline" icon="edit" onClick={() => openEdit(item)} aria-label={`Editar ${item.name}`}>Editar</Button>
                  <button type="button" className="company-menu-card__delete" aria-label={`Remover ${item.name}`} onClick={() => setDeleteId(item.id)}><Icon name="delete" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="company-menu-note">
        Ajustes no estabelecimento ficam em <Link to="/empresa/estabelecimento">Meu estabelecimento</Link>.
      </p>

      {deleteId && (
        <ConfirmDialog
          title="Remover item?"
          message="Tem certeza que deseja remover este item do cardápio? Essa ação não pode ser desfeita."
          confirmLabel="Remover"
          tone="danger"
          loading={deleting}
          onConfirm={executeDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
