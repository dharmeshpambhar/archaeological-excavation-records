import { useNavigate } from 'react-router-dom';
import {
  Package, MapPin, Clock, Box, Coins, Gem, Bone, Wrench,
  FileText, Layers, Landmark, Leaf, Shield
} from 'lucide-react';

const conditionStyles = {
  Excellent:   'cond-excellent',
  Good:        'cond-good',
  Fair:        'cond-fair',
  Poor:        'cond-poor',
  Fragmentary: 'cond-fragmentary',
};

const categoryIconMap = {
  Pottery: Package,
  Coins: Coins,
  Jewelry: Gem,
  Weapons: Shield,
  Bones: Bone,
  Tools: Wrench,
  Inscriptions: FileText,
  Textiles: Layers,
  Architectural: Landmark,
  'Organic Material': Leaf,
  Other: Box,
};

export default function ArtifactCard({ artifact }) {
  const navigate = useNavigate();

  const frontImage = artifact.images?.find((i) => i.view === 'front') || artifact.images?.[0];
  const CategoryIcon = categoryIconMap[artifact.category] || Package;
  const condClass = conditionStyles[artifact.condition] || 'cond-good';

  return (
    <div
      onClick={() => navigate(`/artifacts/${artifact._id}`)}
      className="card"
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Photo Frame */}
      <div
        style={{
          height: 180,
          position: 'relative',
          background: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {frontImage?.url ? (
          <img
            src={frontImage.url}
            alt={artifact.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
          />
        ) : (
          <div className="img-placeholder" style={{ height: '100%', flexDirection: 'column', gap: 6, border: 'none' }}>
            <CategoryIcon size={32} color="var(--color-stone)" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {artifact.category}
            </span>
          </div>
        )}

        {/* Accession / Catalog Number badge */}
        {artifact.catalogNumber && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span className="code-badge" style={{ background: 'rgba(255,255,255,0.92)' }}>
              {artifact.catalogNumber}
            </span>
          </div>
        )}

        {/* Condition tag */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span className={`badge ${condClass}`} style={{ fontSize: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
            {artifact.condition}
          </span>
        </div>
      </div>

      {/* Details Body */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 15,
              color: 'var(--text-primary)',
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {artifact.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="tag" style={{ fontSize: 11, gap: 4 }}>
              <CategoryIcon size={11} color="var(--color-primary)" />
              {artifact.category}
            </span>
            {artifact.material && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {artifact.material}
              </span>
            )}
            {artifact.era && artifact.era !== 'Unknown' && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                · {artifact.era}
              </span>
            )}
          </div>
        </div>

        {artifact.description && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              marginBottom: 12,
              flex: 1,
            }}
          >
            {artifact.description}
          </p>
        )}

        {/* Footer: Provenance Site */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 10,
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto',
            fontSize: 11,
          }}
        >
          {artifact.site?.name ? (
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>
              <MapPin size={12} color="var(--color-primary)" />
              {artifact.site.name}
            </span>
          ) : (
            <span style={{ color: 'var(--text-light)' }}>Site Unspecified</span>
          )}

          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Accession →
          </span>
        </div>
      </div>
    </div>
  );
}
