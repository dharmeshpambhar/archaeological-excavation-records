import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, Package, BookOpen, ChevronRight } from 'lucide-react';

const statusBadgeClass = {
  Ongoing: 'badge-ongoing',
  Completed: 'badge-completed',
  'On Hold': 'badge-on-hold',
  Planned: 'badge-planned',
};

const eraBadgeClass = {
  Ancient: 'badge-ancient',
  Classical: 'badge-classical',
  Medieval: 'badge-medieval',
  Prehistoric: 'badge-prehistoric',
  'Early Modern': 'badge-early-modern',
  Modern: 'badge-modern',
};

export default function SiteCard({ site, viewMode = 'grid' }) {
  const navigate = useNavigate();
  const hasImage = site.coverImage;

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => navigate(`/sites/${site._id}`)}
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex', gap: 14, alignItems: 'center',
          boxShadow: 'var(--shadow-card)',
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color-dark)';
          e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.backgroundColor = '#FFFFFF';
        }}
      >
        <div style={{ width: 60, height: 48, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-color)' }}>
          {hasImage ? (
            <img src={site.coverImage} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div className="img-placeholder" style={{ borderRadius: 0, border: 'none' }}>
              <MapPin size={16} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {site.name}
            </h3>
            {site.siteCode && <span className="code-badge">{site.siteCode}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${statusBadgeClass[site.status] || 'badge-planned'}`}>
              <span className={`status-dot ${site.status?.toLowerCase().replace(' ', '-')}`} />
              {site.status}
            </span>
            {site.era && site.era !== 'Unknown' && (
              <span className={`badge ${eraBadgeClass[site.era] || ''}`}>{site.era}</span>
            )}
            {site.location?.country && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={11} /> {site.location.city ? `${site.location.city}, ` : ''}{site.location.country}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: 'var(--color-primary)' }}>
              {site.artifactCount ?? 0}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Artifacts
            </div>
          </div>
          <ChevronRight size={15} color="var(--text-muted)" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(`/sites/${site._id}`)}
      className="card"
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      {/* Cover Image */}
      <div style={{ height: 160, position: 'relative', background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {hasImage ? (
          <img src={site.coverImage} alt={site.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="img-placeholder" style={{ height: '100%', flexDirection: 'column', gap: 6 }}>
            <MapPin size={24} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>No Photo On File</span>
          </div>
        )}
        {/* Status indicator top left */}
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5 }}>
          <span className={`badge ${statusBadgeClass[site.status] || 'badge-planned'}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <span className={`status-dot ${site.status?.toLowerCase().replace(' ', '-')}`} />
            {site.status}
          </span>
        </div>
        {site.siteCode && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <span className="code-badge" style={{ background: 'rgba(255,255,255,0.92)' }}>{site.siteCode}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.25 }}>
            {site.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {site.location?.country && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Globe size={11} /> {site.location.city ? `${site.location.city}, ` : ''}{site.location.country}
              </span>
            )}
            {site.era && site.era !== 'Unknown' && (
              <span className={`badge ${eraBadgeClass[site.era] || ''}`} style={{ fontSize: 10 }}>
                {site.era}
              </span>
            )}
          </div>
        </div>

        {site.description && (
          <p style={{
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginBottom: 12, flex: 1,
          }}>
            {site.description}
          </p>
        )}

        {/* Card Footer Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Package size={12} color="var(--color-primary)" />
              <strong style={{ color: 'var(--text-primary)' }}>{site.artifactCount ?? 0}</strong> finds
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <BookOpen size={12} color="var(--color-olive)" />
              <strong style={{ color: 'var(--text-primary)' }}>{site.logCount ?? 0}</strong> logs
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
            Dossier →
          </span>
        </div>
      </div>
    </div>
  );
}
