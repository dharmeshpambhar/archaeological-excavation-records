import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronRight, Calendar, User, MapPin, Cloud, ArrowLeft, Trash2 } from 'lucide-react';
import { logsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const defaultLogAttachments = [
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=300&auto=format&fit=crop&q=80',
];

export default function LogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canDeleteLog } = useAuth();

  const { data: log, isLoading } = useQuery({
    queryKey: ['field-log', id],
    queryFn: () => logsAPI.getOne(id).then((r) => r.data.log),
  });

  const deleteMutation = useMutation({
    mutationFn: () => logsAPI.delete(id),
    onSuccess: () => {
      toast.success('Log entry deleted');
      navigate('/logs');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete log'),
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${log?.title}"?`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading field log...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2>Log not found</h2>
        <Link to="/logs" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Logs</Link>
      </div>
    );
  }

  const attachments = log.attachments?.length > 0 ? log.attachments.map((a) => a.url) : defaultLogAttachments;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Breadcrumbs ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6A746E', marginBottom: 14 }}>
        <Link to="/logs" style={{ color: '#6A746E', textDecoration: 'none' }}>Field Logs</Link>
        <ChevronRight size={13} />
        <span style={{ color: '#1A1D20', fontWeight: 600 }}>{log.title}</span>
      </div>

      {/* ─── Top Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
            {log.title}
          </h1>
          <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
            Completed
          </span>
        </div>

        {canDeleteLog && (
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
            <Trash2 size={14} /> Delete Log
          </button>
        )}
      </div>

      {/* ─── 2 Column Layout (Log Info on Left, Notes & Attachments on Right) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 24,
          alignItems: 'start',
        }}
        className="log-detail-grid"
      >
        {/* Left Column: Log Information */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 8,
            padding: '22px 24px',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', marginBottom: 18 }}>
            Log Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Site</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>{log.site?.name || 'Tell Harmal'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Researcher</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>{log.createdBy?.name || log.author?.name || 'Dr. Rajesh Sharma'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Date</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>
                {log.date ? log.date.split('T')[0] : '2025-04-20'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Weather</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>
                {log.weather?.condition ? `${log.weather.condition} (${log.weather.temperature || 28}°C)` : 'Sunny (28°C)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Location</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1A1D20' }}>
                32.3917° N, 35.4321° E
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
              <span style={{ color: '#7A8680' }}>Activities</span>
              <span style={{ fontWeight: 600, color: '#1A1D20' }}>Excavation, Survey</span>
            </div>

            <div>
              <span style={{ color: '#7A8680', display: 'block', marginBottom: 4 }}>Findings</span>
              <p style={{ color: '#3A423D', lineHeight: 1.5, margin: 0, fontSize: 13.5 }}>
                {log.findings || 'Pottery fragments, stone tools'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Notes & Attachments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Notes Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 8,
              padding: '22px 24px',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', marginBottom: 12 }}>
              Notes
            </h3>
            <div
              style={{ color: '#3A423D', lineHeight: 1.6, fontSize: 13.5 }}
              dangerouslySetInnerHTML={{
                __html: log.content || '<p>Continued excavation in Sector B. Discovered additional pottery fragments and a stone blade. Site condition remains good.</p>',
              }}
            />
          </div>

          {/* Attachments Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 8,
              padding: '22px 24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                Attachments
              </h3>
              <span style={{ fontSize: 12, color: '#7A8680' }}>{attachments.length} files</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {attachments.slice(0, 4).map((url, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 6,
                    overflow: 'hidden',
                    aspectRatio: '1',
                    border: '1px solid #E8E5DF',
                    background: '#F8F6F2',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .log-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
