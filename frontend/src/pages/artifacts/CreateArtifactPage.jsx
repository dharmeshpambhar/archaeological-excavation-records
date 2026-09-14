import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { artifactsAPI, sitesAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Pottery', 'Tools', 'Bones', 'Coins', 'Jewelry', 'Weapons', 'Inscriptions', 'Textiles', 'Architectural', 'Organic Material', 'Other'];
const ERAS = ['Prehistoric', 'Ancient', 'Classical', 'Medieval', 'Early Modern', 'Modern', 'Unknown'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Fragmentary'];

export default function CreateArtifactPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', category: 'Pottery', material: '', estimatedAge: '', era: 'Unknown',
    period: '', condition: 'Good', description: '', significance: '',
    site: searchParams.get('site') || '',
    discoveryLocation: { gridReference: '', depth: '', layer: '' },
    dimensions: { length: '', width: '', height: '', weight: '' },
    tags: '', storageLocation: '',
  });
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: sitesData } = useQuery({
    queryKey: ['sites-for-select'],
    queryFn: () => sitesAPI.getAll({ limit: 100 }).then((r) => r.data.sites),
  });

  const setField = (path, value) => {
    setForm((prev) => {
      const parts = path.split('.');
      const updated = { ...prev };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const uploaded = [];
      for (const file of files.slice(0, 5)) {
        const fd = new FormData();
        fd.append('image', file);
        const { data } = await uploadAPI.image(fd);
        uploaded.push({ url: data.url, view: 'front', caption: '' });
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch { toast.error('Failed to upload images'); }
    finally { setUploadingImages(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.site) { toast.error('Please select an excavation site'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images,
        discoveryLocation: {
          ...form.discoveryLocation,
          depth: form.discoveryLocation.depth ? Number(form.discoveryLocation.depth) : undefined,
        },
        dimensions: {
          length: form.dimensions.length ? Number(form.dimensions.length) : undefined,
          width: form.dimensions.width ? Number(form.dimensions.width) : undefined,
          height: form.dimensions.height ? Number(form.dimensions.height) : undefined,
          weight: form.dimensions.weight ? Number(form.dimensions.weight) : undefined,
        },
      };
      const { data } = await artifactsAPI.create(payload);
      toast.success(`Artifact "${data.artifact.name}" catalogued!`);
      navigate(`/artifacts/${data.artifact._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create artifact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/artifacts')} className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Artifacts
          </button>
          <h1 className="page-title">Catalogue New Artifact</h1>
          <p className="page-subtitle">Document an archaeological find with full details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Artifact Details</h3>
              <div className="form-group">
                <label className="form-label">Artifact Name *</label>
                <input className="form-input" placeholder="e.g. Bronze Dancing Figure" value={form.name}
                  onChange={(e) => setField('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Excavation Site *</label>
                <select className="form-select" value={form.site} onChange={(e) => setField('site', e.target.value)} required>
                  <option value="">Select a site...</option>
                  {(sitesData || []).map((s) => <option key={s._id} value={s._id}>{s.name} ({s.siteCode})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <input className="form-input" placeholder="e.g. Bronze, Terracotta, Silver" value={form.material}
                    onChange={(e) => setField('material', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Era</label>
                  <select className="form-select" value={form.era} onChange={(e) => setField('era', e.target.value)}>
                    {ERAS.map((e) => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select className="form-select" value={form.condition} onChange={(e) => setField('condition', e.target.value)}>
                    {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Age / Date</label>
                  <input className="form-input" placeholder="e.g. circa 2300 BCE" value={form.estimatedAge}
                    onChange={(e) => setField('estimatedAge', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Historical Period</label>
                  <input className="form-input" placeholder="e.g. Mature Harappan" value={form.period}
                    onChange={(e) => setField('period', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe the artifact in detail..." style={{ minHeight: 120 }}
                  value={form.description} onChange={(e) => setField('description', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Archaeological Significance</label>
                <textarea className="form-textarea" placeholder="What makes this artifact historically significant?" style={{ minHeight: 100 }}
                  value={form.significance} onChange={(e) => setField('significance', e.target.value)} />
              </div>
            </div>

            {/* Discovery Location */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Discovery Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Grid Reference</label>
                  <input className="form-input" placeholder="e.g. MDA-G7" value={form.discoveryLocation.gridReference}
                    onChange={(e) => setField('discoveryLocation.gridReference', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Depth (meters)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="0.00" value={form.discoveryLocation.depth}
                    onChange={(e) => setField('discoveryLocation.depth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stratigraphic Layer</label>
                  <input className="form-input" placeholder="e.g. Layer III" value={form.discoveryLocation.layer}
                    onChange={(e) => setField('discoveryLocation.layer', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Dimensions & Storage</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {['length', 'width', 'height', 'weight'].map((dim) => (
                  <div key={dim} className="form-group">
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>
                      {dim} {dim === 'weight' ? '(g)' : '(cm)'}
                    </label>
                    <input type="number" step="0.01" min="0" className="form-input" value={form.dimensions[dim]}
                      onChange={(e) => setField(`dimensions.${dim}`, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Storage Location</label>
                <input className="form-input" placeholder="e.g. Lab Cabinet 3, Shelf B" value={form.storageLocation}
                  onChange={(e) => setField('storageLocation', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ position: 'sticky', top: 90 }}>
            {/* Image Upload */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 14 }}>Photos</h4>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: 20,
                cursor: 'pointer', background: 'var(--color-sand)', transition: 'border-color 0.2s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-terracotta)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color-dark)'}
              >
                <Plus size={20} color="var(--text-muted)" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {uploadingImages ? 'Uploading...' : 'Upload Photos (up to 5)'}
                </span>
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImages} />
              </label>
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(44,36,32,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
                      >
                        <X size={11} />
                      </button>
                      <select
                        value={img.view}
                        onChange={(e) => setImages((prev) => prev.map((im, j) => j === i ? { ...im, view: e.target.value } : im))}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: 10, background: 'rgba(44,36,32,0.7)', color: 'white', border: 'none', padding: '2px 4px', fontFamily: 'var(--font-sans)' }}
                      >
                        {['front', 'back', 'side', 'detail', 'other'].map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 12 }}>Tags</h4>
              <input className="form-input" placeholder="bronze, seal, Harappan, religious" value={form.tags}
                onChange={(e) => setField('tags', e.target.value)} style={{ margin: 0 }} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Comma-separated keywords</p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Cataloguing...</>
              ) : (
                <><Save size={16} /> Catalogue Artifact</>
              )}
            </button>
          </motion.div>
        </div>
      </form>

      <style>{`
        @media (max-width: 900px) {
          form > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
