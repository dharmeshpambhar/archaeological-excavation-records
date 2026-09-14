import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Package, Users, Globe, ChevronRight, X } from 'lucide-react';
import { sitesAPI } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const statusColors = {
  Ongoing: '#2B5E44',
  Completed: '#335B7E',
  'On Hold': '#A37318',
  Planned: '#8A3822',
};

function createStatusIcon(status) {
  const color = statusColors[status] || '#8A3822';
  return L.divIcon({
    html: `<div style="
      width: 12px; height: 12px; border-radius: 50%;
      background: ${color}; border: 2px solid #FFFFFF;
      box-shadow: 0 1px 4px rgba(0,0,0,0.35);
      cursor: pointer;
    "></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });
}

export default function MapDashboardPage() {
  const [selectedSite, setSelectedSite] = useState(null);

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites-map'],
    queryFn: () => sitesAPI.getForMap().then((r) => r.data.sites),
  });

  const sitesWithCoords = sites.filter(
    (s) => s.location?.coordinates?.lat && s.location?.coordinates?.lng
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Geospatial Site Cartography</h1>
          <p className="page-subtitle">{sitesWithCoords.length} excavation sites plotted globally</p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: '#FFFFFF', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Status:</span>
          {Object.entries(statusColors).map(([s, c]) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedSite ? '1fr 340px' : '1fr', gap: 20 }}>
        {/* Map Container */}
        <div style={{ borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)', height: 'calc(100vh - 190px)', minHeight: 480 }}>
          {isLoading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : (
            <MapContainer
              center={[25, 20]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {sitesWithCoords.map((site) => (
                <Marker
                  key={site._id}
                  position={[site.location.coordinates.lat, site.location.coordinates.lng]}
                  icon={createStatusIcon(site.status)}
                  eventHandlers={{ click: () => setSelectedSite(site) }}
                >
                  <Popup>
                    <div style={{ minWidth: 170, fontSize: 12 }}>
                      <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 14, marginBottom: 2, color: 'var(--text-primary)' }}>{site.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{site.siteCode} · {site.era}</p>
                      <p style={{ fontSize: 11, color: statusColors[site.status] || 'var(--color-primary)', fontWeight: 600, marginBottom: 6 }}>{site.status}</p>
                      <a href={`/sites/${site._id}`} style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Open Site Dossier →</a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Selected Site Side Panel */}
        {selectedSite && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Site Dossier Summary</span>
              <button onClick={() => setSelectedSite(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                <X size={15} />
              </button>
            </div>

            {selectedSite.coverImage && (
              <div style={{ height: 140, overflow: 'hidden', background: '#222' }}>
                <img src={selectedSite.coverImage} alt={selectedSite.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className={`badge badge-${selectedSite.status?.toLowerCase().replace(' ', '-')}`}>
                  {selectedSite.status}
                </span>
                {selectedSite.era && selectedSite.era !== 'Unknown' && (
                  <span className="tag" style={{ fontSize: 10 }}>{selectedSite.era}</span>
                )}
              </div>

              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>
                {selectedSite.name}
              </h3>
              {selectedSite.siteCode && <div style={{ marginBottom: 8 }}><span className="code-badge">{selectedSite.siteCode}</span></div>}

              {selectedSite.location?.country && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  <Globe size={12} color="var(--color-primary)" />
                  {selectedSite.location.city ? `${selectedSite.location.city}, ` : ''}{selectedSite.location.country}
                </div>
              )}

              {selectedSite.description && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selectedSite.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border-color)', marginBottom: 14 }}>
                <div><Package size={12} style={{ display: 'inline', marginRight: 4 }} /><strong>{selectedSite.artifactCount ?? 0}</strong> finds</div>
                <div><Users size={12} style={{ display: 'inline', marginRight: 4 }} /><strong>{selectedSite.teamMembers?.length ?? 0}</strong> team</div>
              </div>

              <Link to={`/sites/${selectedSite._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                Open Full Dossier →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
