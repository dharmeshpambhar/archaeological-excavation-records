import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Save, Cloud, Sun, CloudRain, Wind,
  CloudLightning, Thermometer, Snowflake, CloudFog,
} from 'lucide-react';
import RichTextEditor from '../../components/common/RichTextEditor';
import { logsAPI, sitesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const WEATHER = [
  { label: 'Sunny', icon: Sun },
  { label: 'Cloudy', icon: Cloud },
  { label: 'Rainy', icon: CloudRain },
  { label: 'Windy', icon: Wind },
  { label: 'Stormy', icon: CloudLightning },
  { label: 'Foggy', icon: CloudFog },
  { label: 'Hot', icon: Thermometer },
  { label: 'Cold', icon: Snowflake },
];

export default function CreateLogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const siteParam = searchParams.get('site');
  const [form, setForm] = useState({
    title: '',
    site: siteParam || '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    findings: '',
    weather: { condition: '', temperature: '', humidity: '' },
    depth: { from: '', to: '', layer: '', description: '' },
  });
  const [loading, setLoading] = useState(false);

  const { data: sitesData } = useQuery({
    queryKey: ['sites-for-select'],
    queryFn: () => sitesAPI.getAll({ limit: 100 }).then((r) => r.data.sites),
  });

  const selectedSiteObj = sitesData?.find((s) => s._id === form.site);

  const setField = (path, value) => {
    setForm((prev) => {
      const parts = path.split('.');
      const updated = { ...prev };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) { cur[parts[i]] = { ...cur[parts[i]] }; cur = cur[parts[i]]; }
      cur[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.site) { toast.error('Please select an excavation site'); return; }
    const textOnly = (form.content || '').replace(/<[^>]*>/g, '').trim();
    if (!textOnly) { toast.error('Please write some excavation journal content'); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        weather: { ...form.weather, temperature: form.weather.temperature ? Number(form.weather.temperature) : undefined, humidity: form.weather.humidity ? Number(form.weather.humidity) : undefined },
        depth: { ...form.depth, from: form.depth.from ? Number(form.depth.from) : 0, to: form.depth.to ? Number(form.depth.to) : 0 },
      };
      const { data } = await logsAPI.create(payload);
      toast.success('Field log entry recorded successfully!');
      navigate(`/logs/${data.log._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create field log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <button
            type="button"
            onClick={() => {
              if (siteParam) navigate(`/sites/${siteParam}`);
              else navigate('/logs');
            }}
            className="btn btn-ghost btn-sm"
            style={{ gap: 6, marginBottom: 8, cursor: 'pointer' }}
          >
            <ArrowLeft size={14} /> {siteParam ? 'Back to Site' : 'Back to Logs'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Write Field Log Entry</h1>
            {selectedSiteObj && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#E2ECE5',
                  color: '#31543D',
                  padding: '3px 10px',
                  borderRadius: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Site: {selectedSiteObj.name}
              </span>
            )}
          </div>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Document today's excavation activities, stratigraphy, weather conditions, and discoveries
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Main Entry */}
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Log Title *</label>
                  <input className="form-input" placeholder="e.g. Discovery of Priest-King Seal Fragment" value={form.title}
                    onChange={(e) => setField('title', e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date} onChange={(e) => setField('date', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Excavation Site *</label>
                <select className="form-select" value={form.site} onChange={(e) => setField('site', e.target.value)} required>
                  <option value="">Select a site...</option>
                  {(sitesData || []).map((s) => <option key={s._id} value={s._id}>{s.name} ({s.siteCode})</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span>Journal Entry *</span>
                  <span style={{ fontSize: 12, color: '#738077', fontWeight: 'normal' }}>Detailed trench findings, layer context & observations</span>
                </label>
                <RichTextEditor
                  value={form.content}
                  onChange={(v) => setField('content', v)}
                  placeholder="Document stratigraphy, feature observations, pottery discoveries, and daily excavation notes..."
                />
              </div>
            </div>

            {/* Findings Summary */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 16 }}>Summary of Findings</h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Key Findings (brief summary)</label>
                <textarea className="form-textarea" placeholder="Brief summary of artifacts found, structures identified, etc." style={{ minHeight: 100 }}
                  value={form.findings} onChange={(e) => setField('findings', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Weather */}
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cloud size={16} /> Weather Conditions
              </h4>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {WEATHER.map(({ label, icon: IconComponent }) => {
                    const isSelected = form.weather.condition === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setField('weather.condition', isSelected ? '' : label)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: 'var(--radius-sm, 6px)',
                          border: isSelected ? '1.5px solid var(--color-terracotta)' : '1px solid var(--border-color)',
                          background: isSelected ? 'var(--color-terracotta-pale)' : 'var(--bg-card)',
                          color: isSelected ? 'var(--color-terracotta)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <IconComponent size={16} />
                        <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Temp (°C)</label>
                  <input type="number" className="form-input" value={form.weather.temperature} onChange={(e) => setField('weather.temperature', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Humidity (%)</label>
                  <input type="number" className="form-input" value={form.weather.humidity} onChange={(e) => setField('weather.humidity', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Depth / Layer */}
            <div className="card" style={{ padding: 24 }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 14 }}>Excavation Depth</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">From (m)</label>
                  <input type="number" step="0.01" className="form-input" value={form.depth.from} onChange={(e) => setField('depth.from', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">To (m)</label>
                  <input type="number" step="0.01" className="form-input" value={form.depth.to} onChange={(e) => setField('depth.to', e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Layer / Stratum</label>
                <input className="form-input" placeholder="e.g. Layer III – Mature Harappan" value={form.depth.layer}
                  onChange={(e) => setField('depth.layer', e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving...</> : <><Save size={16} /> Save Field Log</>}
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
