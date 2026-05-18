import { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, Mail, MailOpen, Eye } from 'lucide-react';
import { contactMessagesService } from '../services/contactMessagesService';
import { useToast } from '../components/Toast';
import { DataTable, Pagination } from '../components/DataTable';
import { ConfirmModal, Modal } from '../components/Modal';
import type { ContactMessageResponse } from '../types';
import type { ReactNode } from 'react';

type ReadFilter = 'all' | 'unread' | 'read';

export function ContactMessagesListPage() {
  const { showToast } = useToast();

  const [data, setData] = useState<ContactMessageResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const readParam = readFilter === 'all' ? undefined : readFilter === 'read';
      const result = await contactMessagesService.getAll(page, 10, readParam);
      setData(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      showToast('Erro ao carregar mensagens.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, readFilter, showToast]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await contactMessagesService.countUnread();
      setUnreadCount(count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchUnreadCount();
  }, [fetchData, fetchUnreadCount]);

  const handleMarkAsRead = useCallback(async (msg: ContactMessageResponse) => {
    if (msg.read) return;
    try {
      await contactMessagesService.markAsRead(msg.id);
      fetchData();
      fetchUnreadCount();
    } catch {
      showToast('Erro ao marcar como lida.', 'error');
    }
  }, [fetchData, fetchUnreadCount, showToast]);

  const handleView = (msg: ContactMessageResponse) => {
    setSelectedMessage(msg);
    if (!msg.read) handleMarkAsRead(msg);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await contactMessagesService.delete(deleteId);
      showToast('Mensagem deletada.', 'success');
      setDeleteId(null);
      fetchData();
      fetchUnreadCount();
    } catch {
      showToast('Erro ao deletar mensagem.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = search
    ? data.filter((m) =>
        [m.name, m.email, m.subject].some((v) =>
          v.toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const columns = [
    {
      header: '',
      width: '32px',
      accessor: (r: ContactMessageResponse): ReactNode =>
        r.read
          ? <MailOpen size={16} style={{ color: 'var(--adm-text-muted)' }} />
          : <Mail size={16} style={{ color: 'var(--adm-green)' }} />,
    },
    { header: 'Nome', accessor: 'name' as keyof ContactMessageResponse },
    { header: 'E-mail', accessor: 'email' as keyof ContactMessageResponse },
    { header: 'Assunto', accessor: 'subject' as keyof ContactMessageResponse },
    {
      header: 'Data',
      accessor: (r: ContactMessageResponse): ReactNode =>
        new Date(r.createdDate).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Ações',
      width: '100px',
      accessor: (r: ContactMessageResponse): ReactNode => (
        <div className="adm-table__actions">
          <button
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => handleView(r)}
            title="Ver mensagem"
          >
            <Eye size={14} />
          </button>
          <button
            className="adm-btn adm-btn--danger adm-btn--sm"
            onClick={() => setDeleteId(r.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">
          Mensagens
          <span>
            {totalElements} mensagens
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 8,
                background: 'var(--adm-red)',
                color: '#fff',
                borderRadius: 12,
                padding: '1px 8px',
                fontSize: 12,
                fontWeight: 600,
              }}>
                {unreadCount} não lidas
              </span>
            )}
          </span>
        </h2>
      </div>

      <div className="adm-card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['all', 'unread', 'read'] as ReadFilter[]).map((f) => (
            <button
              key={f}
              className={`adm-btn ${readFilter === f ? 'adm-btn--primary' : 'adm-btn--ghost'} adm-btn--sm`}
              onClick={() => { setReadFilter(f); setPage(0); }}
            >
              {f === 'all' ? 'Todas' : f === 'unread' ? 'Não lidas' : 'Lidas'}
            </button>
          ))}
        </div>

        <div className="adm-search">
          <span className="adm-search__icon"><Search size={18} /></span>
          <input
            placeholder="Buscar por nome, e-mail ou assunto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          loading={loading}
          emptyMessage="Nenhuma mensagem encontrada."
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>

      <Modal
        isOpen={!!selectedMessage}
        title={selectedMessage?.subject ?? ''}
        onClose={() => setSelectedMessage(null)}
        size="lg"
      >
        {selectedMessage && (
          <div className="adm-modal__body">
            <div style={{ marginBottom: 12, display: 'flex', gap: 24, fontSize: 14, color: 'var(--adm-text-muted)', flexWrap: 'wrap' }}>
              <span><strong>De:</strong> {selectedMessage.name}</span>
              <span><strong>E-mail:</strong> {selectedMessage.email}</span>
              <span><strong>Data:</strong> {new Date(selectedMessage.createdDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div style={{
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '16px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 14,
            }}>
              {selectedMessage.message}
            </div>
          </div>
        )}
        <div className="adm-modal__footer">
          <button className="adm-btn adm-btn--ghost" onClick={() => setSelectedMessage(null)}>
            Fechar
          </button>
          {selectedMessage && (
            <button
              className="adm-btn adm-btn--danger"
              onClick={() => { setDeleteId(selectedMessage.id); setSelectedMessage(null); }}
            >
              <Trash2 size={14} /> Deletar
            </button>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Deletar Mensagem"
        message="Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
