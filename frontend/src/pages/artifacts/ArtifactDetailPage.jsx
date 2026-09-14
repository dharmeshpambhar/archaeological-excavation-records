import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronRight, Edit, Trash2, MapPin } from 'lucide-react';
import { artifactsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const defaultArtifactGallery = [
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
];

export default function ArtifactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit, canDeleteArtifact } = useAuth();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const { data: artifact, isLoading } = useQuery({
    queryKey: ['artifact', id],
    queryFn: () => artifactsAPI.getOne(id).then((r) => r.data.artifact),
  });

  const deleteMutation = useMutation({
    mutationFn: () => artifactsAPI.delete(id),
    onSuccess: () => {
      toast.success('Artifact record deleted');
      navigate('/artifacts');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete artifact'),
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${artifact?.name}?`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading accession record...</p>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2>Artifact not found</h2>
        <Link to="/artifacts" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Catalog</Link>
      </div>
    );
  }

  const images = artifact.images?.length > 0 ? artifact.images.map((img) => img.url) : defaultArtifactGallery;
  const currentPhoto = images[selectedPhotoIndex] || images[0];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Breadcrumbs ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6A746E', marginBottom: 14 }}>
        <Link to="/artifacts" style={{ color: '#6A746E', textDecoration: 'none' }}>Artifacts</Link>
        <ChevronRight size={13} />
        <span style={{ color: '#1A1D20', fontWeight: 600 }}>{artifact.name}</span>
      </div>

      {/* ─── Header: Name + Badge + Actions ───────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
            {artifact.name}
          </h1>
          <span style={{ background: '#F2EFEB', color: '#556059', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
            {artifact.category || 'Ceramic'}
          </span>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate(`/artifacts/${artifact._id}/edit`)}
              style={{
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #D8D4CC',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#1A1D20',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Edit size={14} /> Edit
            </button>
            {canDeleteArtifact && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #F5C6C6',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#C53030',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── Detail Layout (Left: Photos, Right: Artifact Info) ───── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
        className="artifact-detail-grid"
      >
        {/* Left Column: Photos Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #E8E5DF',
              aspectRatio: '16 / 11',
              background: '#F6F4F0',
            }}
          >
            <img
              src={currentPhoto}
              alt={artifact.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultArtifactGallery[0];
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {images.slice(0, 4).map((p, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                style={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  aspectRatio: '4 / 3',
                  border: selectedPhotoIndex === idx ? '2px solid #31543D' : '1px solid #E8E5DF',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={p}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultArtifactGallery[idx % defaultArtifactGallery.length];
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Artifact Information Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 8,
            padding: '22px 24px',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', marginBottom: 18 }}>
            Artifact Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Artifact ID</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1A1D20' }}>
                {artifact.catalogNumber || 'A-001'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Category</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>{artifact.category || 'Ceramic'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Material</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>{artifact.material || 'Clay'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Period</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>{artifact.period || artifact.era || 'Bronze Age'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Site</span>
              <span
                onClick={() => artifact.site?._id && navigate(`/sites/${artifact.site._id}`)}
                style={{ fontWeight: 600, color: '#31543D', cursor: artifact.site?._id ? 'pointer' : 'default' }}
              >
                {artifact.site?.name || 'Tell Harmal'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Condition</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>{artifact.condition || 'Fair'}</span>
            </div>

            <div>
              <span style={{ color: '#7A8680', display: 'block', marginBottom: 4 }}>Description</span>
              <p style={{ color: '#3A423D', lineHeight: 1.5, margin: 0, fontSize: 13.5 }}>
                {artifact.description || 'Fragment of a pottery vessel with geometric patterns.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .artifact-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
