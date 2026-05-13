import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mountain, 
  Calendar, 
  Utensils, 
  Hotel, 
  MapPin, 
  Compass, 
  Phone, 
  Image 
} from 'lucide-react';
import { attractionsService } from '../services/attractionsService';
import { eventsService } from '../services/eventsService';
import { restaurantsService } from '../services/restaurantsService';
import { hostPointsService } from '../services/hostPointsService';
import { touristSpotsService } from '../services/touristSpotsService';
import { tourGuidesService } from '../services/tourGuidesService';
import { contactsService } from '../services/contactsService';

interface StatCard { label: string; value: number | string; icon: React.ReactNode; to: string; color: string; }

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
          { label: 'Atrações', value: get(att), icon: <Mountain size={24} />, to: '/admin/attractions', color: 'var(--adm-green)' },
          { label: 'Eventos', value: get(ev), icon: <Calendar size={24} />, to: '/admin/events', color: '#4a90d9' },
          { label: 'Restaurantes', value: get(rest), icon: <Utensils size={24} />, to: '/admin/restaurants', color: 'var(--adm-gold)' },
          { label: 'Hospedagem', value: get(host), icon: <Hotel size={24} />, to: '/admin/host-points', color: '#8b5cf6' },
          { label: 'Pontos Turísticos', value: get(spots), icon: <MapPin size={24} />, to: '/admin/tourist-spots', color: 'var(--adm-red)' },
          { label: 'Guias', value: get(guides), icon: <Compass size={24} />, to: '/admin/tour-guides', color: '#0ea5e9' },
          { label: 'Contatos', value: get(contacts), icon: <Phone size={24} />, to: '/admin/contacts', color: '#10b981' },
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
        <h2 className="adm-page-title">
          Visão Geral
          <span>Resumo dos cadastros e atividade do destino</span>
        </h2>
      </div>

      {loading ? (
        <div className="adm-loading-center"><span className="adm-spinner adm-spinner--lg" /></div>
      ) : (
        <div className="adm-stat-grid">
          {stats.map((s) => (
            <Link to={s.to} key={s.label} style={{ textDecoration: 'none' }}>
              <div 
                className="adm-stat-card" 
                style={{ '--card-color': s.color } as React.CSSProperties}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: s.color }} />
                <span className="adm-stat-card__icon">{s.icon}</span>
                <span className="adm-stat-card__value">{s.value}</span>
                <span className="adm-stat-card__label">{s.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="adm-card" style={{ marginTop: 8 }}>
        <h3 className="adm-serif" style={{ marginBottom: 16, fontSize: 18, color: 'var(--adm-green)' }}>Acesso Rápido</h3>
        <p style={{ fontSize: 14, color: 'var(--adm-text-muted)', marginBottom: 20 }}>
          Utilize os botões abaixo para criar novos registros rapidamente no sistema.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { to: '/admin/attractions/new', label: '+ Nova Atração' },
            { to: '/admin/events/new', label: '+ Novo Evento' },
            { to: '/admin/restaurants/new', label: '+ Novo Restaurante' },
            { 
              to: '/admin/photos', 
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Image size={16} /> Gerenciar Fotos
                </span>
              ) 
            },
          ].map((a) => (
            <Link key={a.to as string} to={a.to as string} className="adm-btn adm-btn--ghost">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
