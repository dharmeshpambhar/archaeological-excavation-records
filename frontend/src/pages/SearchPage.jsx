import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Package, BookOpen, ChevronRight } from 'lucide-react';
import { searchAPI } from '../services/api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query });
    setLoading(true);
    try {
      const { data } = await searchAPI.global(query);
      setResults(data.results);
    } catch {
      setResults({ sites: [], artifacts: [], logs: [] });
    } finally {
      setLoading(false);
    }
  };

  const total = results
    ? (results.sites?.length || 0) + (results.artifacts?.length || 0) + (results.logs?.length || 0)
    : 0;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Global Registry Search</h1>
          <p className="page-subtitle">Search across all excavation sites, catalogued artifacts, and field entries</p>
        </div>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            placeholder="Search by site code, artifact catalog #, material, trench, or observer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 40, height: 42, margin: 0, fontSize: 14 }}
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ height: 42, paddingInline: 22 }}>
          Search Records
        </button>
      </form>

      {loading && (
        <div className="loading-page" style={{ minHeight: 200 }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching archival records...</p>
        </div>
      )}

      {!loading && results && (
        <div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--border-radius-xs)', border: '1px solid var(--border-color)', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            Found <strong>{total}</strong> matching record{total !== 1 ? 's' : ''} for query "<strong style={{ color: 'var(--text-primary)' }}>{searchParams.get('q')}</strong>"
          </div>

          {/* Excavation Sites */}
          {results.sites?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <MapPin size={15} color="var(--color-primary)" /> Excavation Sites ({results.sites.length})
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Site Name</th>
                      <th>Country</th>
                      <th>Era</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.sites.map((site) => (
                      <tr key={site._id}>
                        <td><span className="code-badge">{site.siteCode || '—'}</span></td>
                        <td>
                          <Link to={`/sites/${site._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {site.name}
                          </Link>
                        </td>
                        <td>{site.location?.country || '—'}</td>
                        <td><span className="tag">{site.era}</span></td>
                        <td><span className={`badge badge-${site.status?.toLowerCase().replace(' ', '-')}`}>{site.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Artifacts */}
          {results.artifacts?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <Package size={15} color="var(--color-gold)" /> Catalogued Artifacts ({results.artifacts.length})
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Accession #</th>
                      <th>Artifact Name</th>
                      <th>Category</th>
                      <th>Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.artifacts.map((a) => (
                      <tr key={a._id}>
                        <td><span className="code-badge">{a.catalogNumber || '—'}</span></td>
                        <td>
                          <Link to={`/artifacts/${a._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {a.name}
                          </Link>
                        </td>
                        <td><span className="tag">{a.category}</span></td>
                        <td><span className="tag" style={{ fontSize: 10 }}>{a.condition}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Field Logs */}
          {results.logs?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                <BookOpen size={15} color="var(--color-olive)" /> Field Logs ({results.logs.length})
              </h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Log Title</th>
                      <th>Site</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.logs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/logs/${log._id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {log.title}
                          </Link>
                        </td>
                        <td>{log.site?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={24} /></div>
              <h3>No Archival Records Found</h3>
              <p>No excavation sites, artifacts, or journal logs match the search query "{searchParams.get('q')}".</p>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--text-muted)' }}>
          <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
          <p style={{ fontSize: 14 }}>Enter search terms to query the database</p>
        </div>
      )}
    </div>
  );
}
