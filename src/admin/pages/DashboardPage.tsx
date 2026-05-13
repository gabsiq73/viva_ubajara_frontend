import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attractionsService } from '../services/attractionsService';
import { eventsService } from '../services/eventsService';
import { restaurantsService } from '../services/restaurantsService';
import { hostPointsService } from '../services/hostPointsService';
import { touristSpotsService } from '../services/touristSpotsService';
import { tourGuidesService } from '../services/tourGuidesService';
import { contactsService } from '../services/contactsService';

interface StatCard { label: string; value: number | string; icon: string; to: string; }

export function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [att, ev, rest, host, spots, guides, contacts] = await Promise.allSettled([
          attractionsService.getAll(0, 1),
          eventsService.getAll(0, 1),
          restaurantsService.getAll(0, 1),
          hostPointsService.getAll(0, 1),
          touristSpotsService.getAll(0, 1),
          tourGuidesService.getAll(0, 1),
          contactsService.getAll(0, 1),
        ]);

        const get = (r: PromiseSettledResult<{ totalElements: number }>) =>
          r.status === 'fulfilled' ? r.value.totalElements : '—';

        setStats([
          { label: 'Atrações', value: get(att), icon: '🏞️', to: '/admin/attractions' },
          { label: 'Eventos', value: get(ev), icon: '🎉', to: '/admin/events' },
          { label: 'Restaurantes', value: get(rest), icon: '🍽️', to: '/admin/restaurants' },
          { label: 'Hospedagem', value: get(host), icon: '🏨', to: '/admin/host-points' },
          { label: 'Pontos Turísticos', value: get(spots), icon: '📍', to: '/admin/tourist-spots' },
          { label: 'Guias', value: get(guides), icon: '🧭', to: '/admin/tour-guides' },
          { label: 'Contatos', value: get(contacts), icon: '📞', to: '/admin/contacts' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="adm-page-header">
        <h2 className="adm-page-title">Visão Geral</h2>
      </div>

      {loading ? (
        <div className="adm-loading-center"><span className="adm-spinner adm-spinner--lg" /></div>
      ) : (
        <div className="adm-stat-grid">
          {stats.map((s) => (
            <Link to={s.to} key={s.label} style={{ textDecoration: 'none' }}>
              <div className="adm-stat-card">
                <span className="adm-stat-card__icon">{s.icon}</span>
                <span className="adm-stat-card__value">{s.value}</span>
                <span className="adm-stat-card__label">{s.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="adm-card" style={{ marginTop: 8 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16 }}>Acesso Rápido</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { to: '/admin/attractions/new', label: '+ Nova Atração' },
            { to: '/admin/events/new', label: '+ Novo Evento' },
            { to: '/admin/restaurants/new', label: '+ Novo Restaurante' },
            { to: '/admin/photos', label: '📸 Gerenciar Fotos' },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="adm-btn adm-btn--ghost">{a.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
