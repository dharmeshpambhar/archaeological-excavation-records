// EditSitePage - loads existing site and passes to CreateSitePage-like form
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Save, ArrowLeft, MapPin } from 'lucide-react';
import { sitesAPI } from '../../services/api';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ onSelect }) {
  useMapEvents({ click(e) { onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

const ERAS = ['Prehistoric', 'Ancient', 'Classical', 'Medieval', 'Early Modern', 'Modern', 'Unknown'];
const STATUSES = ['Planned', 'Ongoing', 'Completed', 'On Hold'];

const HERITAGE_PRESETS = [
  { label: 'Nalanda Ruins', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Sandstone Ruins', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Stone Columns', url: 'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Desert Trench', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Temple Masonry', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Red Sandstone', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80' },
];

export default function EditSitePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: site } = useQuery({
    queryKey: ['site', id],
    queryFn: () => sitesAPI.getOne(id).then((r) => r.data.site),
  });

  useEffect(() => {
    if (site) {
      setForm({
        name: site.name || '',
        description: site.description || '',
        period: site.period || '',
        era: site.era || 'Unknown',
        status: site.status || 'Planned',
        coverImage: site.coverImage || site.photos?.[0]?.url || '',
        location: site.location || { country: '', region: '', city: '', address: '', coordinates: { lat: null, lng: null } },
        startDate: site.startDate ? site.startDate.split('T')[0] : '',
        totalDepth: site.totalDepth || '',
        areaSize: site.areaSize || '',
        tags: (site.tags || []).join(', '),
      });
      if (site.location?.coordinates?.lat) {
        setMarkerPos({ lat: site.location.coordinates.lat, lng: site.location.coordinates.lng });
      }
    }
  }, [site]);

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

  const handleMapClick = (coords) => {
    setMarkerPos(coords);
    setField('location.coordinates.lat', coords.lat);
    setField('location.coordinates.lng', coords.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cover = form.coverImage?.trim() || '';
      const payload = {
        ...form,
        coverImage: cover,
        photos: cover
          ? [{ url: cover, caption: `${form.name || 'Site'} Cover Photo` }, ...(site.photos?.filter((p) => p.url !== cover) || [])]
          : (site.photos || []),
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        totalDepth: form.totalDepth ? Number(form.totalDepth) : 0,
        areaSize: form.areaSize ? Number(form.areaSize) : 0,
      };

      if (!payload.startDate) delete payload.startDate;
      if (payload.location?.coordinates) {
        const { lat, lng } = payload.location.coordinates;
        if (lat === null || lat === undefined || lat === '' || isNaN(Number(lat)) ||
            lng === null || lng === undefined || lng === '' || isNaN(Number(lng))) {
          delete payload.location.coordinates;
        } else {
          payload.location.coordinates = { lat: Number(lat), lng: Number(lng) };
        }
      }

      await sitesAPI.update(id, payload);
      await queryClient.invalidateQueries({ queryKey: ['site', id] });
      await queryClient.invalidateQueries({ queryKey: ['sites'] });
      await queryClient.invalidateQueries({ queryKey: ['sites-map'] });
      toast.success('Site updated successfully!');
      navigate(`/sites/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update site');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate(`/sites/${id}`)} className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Site
          </button>
          <h1 className="page-title">Edit Site</h1>
          <p className="page-subtitle">{site?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Site Information</h3>
            <div className="form-group">
              <label className="form-label">Site Name *</label>
              <input className="form-input" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" style={{ minHeight: 140 }} value={form.description} onChange={(e) => setField('description', e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Era</label>
                <select className="form-select" value={form.era} onChange={(e) => setField('era', e.target.value)}>
                  {ERAS.map((era) => <option key={era}>{era}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Period</label>
                <input className="form-input" value={form.period} onChange={(e) => setField('period', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input className="form-input" value={form.tags} onChange={(e) => setField('tags', e.target.value)} />
            </div>
          </div>

          {/* Cover Photo & Imagery */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 6 }}>Site Cover Photo</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Select a quick preset or enter an image URL to update this site's featured photography.
            </p>

            <div className="form-group">
              <label className="form-label">Cover Photo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={form.coverImage || ''}
                onChange={(e) => setField('coverImage', e.target.value)}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: 12, marginBottom: 8 }}>Quick Heritage Presets</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {HERITAGE_PRESETS.map((p) => {
                  const isSelected = form.coverImage === p.url;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setField('coverImage', p.url)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #31543D' : '1px solid #D5DCD6',
                        background: isSelected ? '#EBF3ED' : '#FAFAF8',
                        color: isSelected ? '#1E3D2B' : '#495057',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            {form.coverImage && (
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E1D8', background: '#F8F6F1', position: 'relative', height: 180 }}>
                <img
                  src={form.coverImage}
                  alt="Cover Preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.65)', color: '#FFF', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                  Live Cover Preview
                </span>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Location</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {['country', 'region', 'city', 'address'].map((f) => (
                <div key={f} className="form-group" style={{ gridColumn: f === 'address' ? '1 / -1' : 'auto' }}>
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{f}</label>
                  <input className="form-input" value={form.location[f] || ''} onChange={(e) => setField(`location.${f}`, e.target.value)} />
                </div>
              ))}
            </div>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
              <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--color-terracotta)' }} />
              Click map to update coordinates
            </label>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: 280 }}>
              <MapContainer
                center={markerPos ? [markerPos.lat, markerPos.lng] : [20, 0]}
                zoom={markerPos ? 8 : 2}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onSelect={handleMapClick} />
                {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
              </MapContainer>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => navigate(`/sites/${id}`)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
