import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Package, BookOpen, X, ChevronRight } from 'lucide-react';
import { bookmarksAPI } from '../services/api';
import toast from 'react-hot-toast';

const typeIcons = { Site: MapPin, Artifact: Package, Log: BookOpen };

export default function BookmarksPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => bookmarksAPI.getAll().then((r) => r.data.bookmarks),
  });
//f
  const handleRemove = async (itemId) => {
    try {
      await bookmarksAPI.remove(itemId);
      toast.success('Removed from saved bookmarks');
      refetch();
    } catch { toast.error('Failed to remove bookmark'); }
  };

  const getPath = (b) => {
    const paths = { Site: `/sites/${b.itemId}`, Artifact: `/artifacts/${b.itemId}`, Log: `/logs/${b.itemId}` };
    return paths[b.itemType] || '/';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saved Archival Bookmarks</h1>
          <p className="page-subtitle">{data?.length ?? 0} reference records bookmarked for quick consultation</p>
        </div>
      </div>

      {isLoading && (
        <div className="loading-page" style={{ minHeight: 260 }}>
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading saved records...</p>
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="empty-state">
          <div className="empty-state-icon"><Bookmark size={28} /></div>
          <h3>No Saved Records</h3>
          <p>Click the bookmark icon on any excavation site, artifact accession sheet, or field log to save it here for rapid reference.</p>
        </div>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Record Type</th>
                <th>Title / Designation</th>
                <th>Accession / Link</th>
                <th style={{ textAlign: 'right' }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {data.map((bookmark) => {
                const TypeIcon = typeIcons[bookmark.itemType] || Bookmark;
                return (
                  <tr key={bookmark._id}>
                    <td>
                      <span className="tag" style={{ fontSize: 11, gap: 5 }}>
                        <TypeIcon size={12} color="var(--color-primary)" />
                        {bookmark.itemType}
                      </span>
                    </td>
                    <td>
                      <Link to={getPath(bookmark)} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {bookmark.title || `${bookmark.itemType} Record`}
                      </Link>
                    </td>
                    <td>
                      <Link to={getPath(bookmark)} className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
                        Open Record <ChevronRight size={13} />
                      </Link>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleRemove(bookmark.itemId)}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Remove bookmark"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
