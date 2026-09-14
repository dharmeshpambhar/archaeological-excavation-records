import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { logsAPI, sitesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function FieldLogsPage() {
  const { canEdit, canManage } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['field-logs', { search, page }],
    queryFn: () => logsAPI.getAll({ search, page, limit: 8 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const { data: sitesData } = useQuery({
    queryKey: ['sites-lookup'],
    queryFn: () => sitesAPI.getAll({ limit: 100 }).then((r) => r.data.sites),
  });

  const sitesMap = (sitesData || []).reduce((acc, s) => {
    acc[s._id] = s.name;
    return acc;
  }, {});

  const deleteMutation = useMutation({
    mutationFn: (id) => logsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['field-logs']);
      toast.success('Log entry deleted');
    },
    onError: () => toast.error('Failed to delete log'),
  });

  const handleDelete = (e, id, title) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const logs = data?.logs || [];
  const totalPages = data?.pages || 1;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Page Title Header ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>
            Field Logs
          </h1>
          <p style={{ fontSize: 13.5, color: '#6E7872', margin: 0 }}>
            View and manage excavation field logs.
          </p>
        </div>

        {canEdit && (
          <Link
            to="/logs/new"
            style={{
              padding: '9px 16px',
              background: '#31543D',
              color: '#FFFFFF',
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#24432E'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#31543D'}
          >
            <Plus size={16} /> Add Log
          </Link>
        )}
      </div>

      {/* ─── Filter Bar ───────────────────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#8A948E" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search field logs..."
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              border: '1px solid #D8D4CC',
              borderRadius: 6,
              fontSize: 13,
              color: '#1A1D20',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* ─── Field Logs Table (Matches Row 3 Right Mockup) ────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#FAF9F6', color: '#7A8680', borderBottom: '1px solid #EFECE6' }}>
                <th style={{ padding: '11px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '11px 16px', fontWeight: 600 }}>Site</th>
                <th style={{ padding: '11px 16px', fontWeight: 600 }}>Researcher</th>
                <th style={{ padding: '11px 16px', fontWeight: 600 }}>Weather</th>
                <th style={{ padding: '11px 16px', fontWeight: 600 }}>Activities</th>
                <th style={{ padding: '11px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ padding: 36, textAlign: 'center', color: '#9AA49E' }}>Loading field logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: 36, textAlign: 'center', color: '#9AA49E' }}>No field logs recorded yet</td></tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    onClick={() => navigate(`/logs/${log._id}`)}
                    style={{ borderBottom: '1px solid #F3F1EC', cursor: 'pointer', transition: 'background-color 0.12s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FAF8F5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Date */}
                    <td style={{ padding: '12px 16px', color: '#556059', whiteSpace: 'nowrap' }}>
                      {log.date ? log.date.split('T')[0] : '2025-04-20'}
                    </td>

                    {/* Site */}
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1A1D20' }}>
                      {typeof log.site === 'object' && log.site?.name
                        ? log.site.name
                        : sitesMap[log.site] || (typeof log.site === 'string' && log.site.length > 10 ? 'Excavation Site' : 'Excavation Site')}
                    </td>

                    {/* Researcher */}
                    <td style={{ padding: '12px 16px', color: '#556059' }}>
                      {log.createdBy?.name || log.author?.name || 'Field Researcher'}
                    </td>

                    {/* Weather */}
                    <td style={{ padding: '12px 16px', color: '#7E8883' }}>
                      {log.weather?.condition ? `${log.weather.condition} ${log.weather.temperature ? `(${log.weather.temperature}°C)` : ''}` : 'Sunny (28°C)'}
                    </td>

                    {/* Activities */}
                    <td style={{ padding: '12px 16px', color: '#556059' }}>
                      {log.title || 'Excavation, Survey'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={() => navigate(`/logs/${log._id}`)}
                          title="View field log"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A746E', padding: 4 }}
                        >
                          <Eye size={15} />
                        </button>
                        {canManage && (
                          <button
                            onClick={(e) => handleDelete(e, log._id, log.title)}
                            title="Delete log"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C53030', padding: 4 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 16px', borderTop: '1px solid #EFECE6' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '4px 10px', background: 'none', border: '1px solid #D8D4CC', borderRadius: 4, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: page === i + 1 ? '1px solid #31543D' : '1px solid #D8D4CC',
                  background: page === i + 1 ? '#31543D' : '#FFFFFF',
                  color: page === i + 1 ? '#FFFFFF' : '#1A1D20',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '4px 10px', background: 'none', border: '1px solid #D8D4CC', borderRadius: 4, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
