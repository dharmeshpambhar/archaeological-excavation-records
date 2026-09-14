// EditArtifactPage - simplified edit form
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft } from 'lucide-react';
import { artifactsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Pottery', 'Tools', 'Bones', 'Coins', 'Jewelry', 'Weapons', 'Inscriptions', 'Textiles', 'Architectural', 'Organic Material', 'Other'];
const ERAS = ['Prehistoric', 'Ancient', 'Classical', 'Medieval', 'Early Modern', 'Modern', 'Unknown'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Fragmentary'];

export default function EditArtifactPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: artifact } = useQuery({
    queryKey: ['artifact', id],
    queryFn: () => artifactsAPI.getOne(id).then((r) => r.data.artifact),
  });

  useEffect(() => {
    if (artifact) {
      setForm({
        name: artifact.name || '',
        category: artifact.category || 'Pottery',
        material: artifact.material || '',
        estimatedAge: artifact.estimatedAge || '',
        era: artifact.era || 'Unknown',
        period: artifact.period || '',
        condition: artifact.condition || 'Good',
        description: artifact.description || '',
        significance: artifact.significance || '',
        tags: (artifact.tags || []).join(', '),
        storageLocation: artifact.storageLocation || '',
      });
    }
  }, [artifact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      await artifactsAPI.update(id, payload);
      await queryClient.invalidateQueries({ queryKey: ['artifact', id] });
      await queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      toast.success('Artifact updated!');
      navigate(`/artifacts/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate(`/artifacts/${id}`)} className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Artifact
          </button>
          <h1 className="page-title">Edit Artifact</h1>
          <p className="page-subtitle">{artifact?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Artifact Details</h3>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Category', type: 'select', key: 'category', options: CATEGORIES },
              { label: 'Condition', type: 'select', key: 'condition', options: CONDITIONS },
              { label: 'Era', type: 'select', key: 'era', options: ERAS },
              { label: 'Material', type: 'text', key: 'material', placeholder: 'e.g. Bronze' },
              { label: 'Estimated Age', type: 'text', key: 'estimatedAge', placeholder: 'e.g. circa 2300 BCE' },
              { label: 'Period', type: 'text', key: 'period', placeholder: 'e.g. Mature Harappan' },
            ].map((f) => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="form-select" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="form-input" type="text" placeholder={f.placeholder} value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 120 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Significance</label>
            <textarea className="form-textarea" value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value })} style={{ minHeight: 100 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Storage Location</label>
            <input className="form-input" value={form.storageLocation} onChange={(e) => setForm({ ...form, storageLocation: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => navigate(`/artifacts/${id}`)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', gap: 8 }} disabled={loading}>
            {loading ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
