import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { artifactsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const defaultArtifactImages = [
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=120&auto=format&fit=crop&q=80',
];

export default function ArtifactsPage() {
  const { canEdit, canManage } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [period, setPeriod] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['artifacts', { category, material, period, page }],
    queryFn: () => artifactsAPI.getAll({ category, material, period, page, limit: 8 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => artifactsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['artifacts']);
      toast.success('Artifact deleted');
    },
    onError: () => toast.error('Failed to delete artifact'),
  });

  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const artifacts = data?.artifacts || [];
  const totalPages = data?.pages || 1;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Page Title Header ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>
            Artifacts Catalog
          </h1>
          <p style={{ fontSize: 13.5, color: '#6E7872', margin: 0 }}>
            Browse and manage archaeological artifacts.
          </p>
        </div>

        {canEdit && (
          <Link
            to="/artifacts/new"
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
            <Plus size={16} /> Add Artifact
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
        {/* All Categories */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{ padding: '7px 12px', border: '1px solid #D8D4CC', borderRadius: 6, fontSize: 13, color: '#1A1D20', background: '#FFFFFF', outline: 'none' }}
        >
          <option value="">All Categories</option>
          <option value="Ceramic">Ceramic / Pottery</option>
          <option value="Tools">Tools / Lithics</option>
          <option value="Weapons">Weapons / Metal</option>
          <option value="Jewelry">Jewelry / Personal</option>
          <option value="Coins">Coins / Numismatics</option>
          <option value="Bones">Bones / Osteology</option>
        </select>

        {/* All Materials */}
        <select
          value={material}
          onChange={(e) => { setMaterial(e.target.value); setPage(1); }}
          style={{ padding: '7px 12px', border: '1px solid #D8D4CC', borderRadius: 6, fontSize: 13, color: '#1A1D20', background: '#FFFFFF', outline: 'none' }}
        >
          <option value="">All Materials</option>
          <option value="Clay">Clay</option>
          <option value="Bronze">Bronze</option>
          <option value="Flint">Flint / Stone</option>
          <option value="Gold">Gold / Silver</option>
          <option value="Bone">Bone</option>
        </select>

        {/* All Periods */}
        <select
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setPage(1); }}
          style={{ padding: '7px 12px', border: '1px solid #D8D4CC', borderRadius: 6, fontSize: 13, color: '#1A1D20', background: '#FFFFFF', outline: 'none' }}
        >
          <option value="">All Periods</option>
          <option value="Bronze Age">Bronze Age</option>
          <option value="Iron Age">Iron Age</option>
          <option value="Late Bronze Age">Late Bronze Age</option>
          <option value="Nabataean">Nabataean</option>
          <option value="Roman">Roman</option>
        </select>
      </div>

      {/* ─── Artifacts Table (Matches Row 3 Middle Mockup) ────────── */}
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
                <th style={{ padding: '11px 14px', width: 48, fontWeight: 600 }}>Image</th>
                <th style={{ padding: '11px 14px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '11px 14px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '11px 14px', fontWeight: 600 }}>Material</th>
                <th style={{ padding: '11px 14px', fontWeight: 600 }}>Period</th>
                <th style={{ padding: '11px 14px', fontWeight: 600 }}>Site</th>
                <th style={{ padding: '11px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ padding: 36, textAlign: 'center', color: '#9AA49E' }}>Loading artifacts...</td></tr>
              ) : artifacts.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: 36, textAlign: 'center', color: '#9AA49E' }}>No artifacts found matching criteria</td></tr>
              ) : (
                artifacts.map((art, index) => {
                  const thumbnail = art.images?.[0]?.url || defaultArtifactImages[index % defaultArtifactImages.length];
                  return (
                    <tr
                      key={art._id}
                      onClick={() => navigate(`/artifacts/${art._id}`)}
                      style={{ borderBottom: '1px solid #F3F1EC', cursor: 'pointer', transition: 'background-color 0.12s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAF8F5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Image Thumbnail */}
                      <td style={{ padding: '8px 10px 8px 14px' }}>
                        <img
                          src={thumbnail}
                          alt={art.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultArtifactImages[index % defaultArtifactImages.length];
                          }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #E5E1D8',
                          }}
                        />
                      </td>

                      {/* Name */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1A1D20' }}>
                        {art.name}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 14px', color: '#556059' }}>
                        {art.category || 'Ceramic'}
                      </td>

                      {/* Material */}
                      <td style={{ padding: '12px 14px', color: '#7E8883' }}>
                        {art.material || 'Clay'}
                      </td>

                      {/* Period */}
                      <td style={{ padding: '12px 14px', color: '#7E8883' }}>
                        {art.period || art.era || 'Bronze Age'}
                      </td>

                      {/* Site */}
                      <td style={{ padding: '12px 14px', color: '#556059' }}>
                        {art.site?.name || 'Tell Harmal'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <button
                            onClick={() => navigate(`/artifacts/${art._id}`)}
                            title="View accession record"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A746E', padding: 4 }}
                          >
                            <Eye size={15} />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => navigate(`/artifacts/${art._id}/edit`)}
                                title="Edit artifact"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#31543D', padding: 4 }}
                              >
                                <Edit size={15} />
                              </button>
                              {canManage && (
                                <button
                                  onClick={(e) => handleDelete(e, art._id, art.name)}
                                  title="Delete artifact"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C53030', padding: 4 }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
