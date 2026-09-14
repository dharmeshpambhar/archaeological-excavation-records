import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, UserCheck, UserX, Trash2, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', { role: roleFilter, search }],
    queryFn: () => usersAPI.getAll({ role: roleFilter, search, limit: 50 }).then((r) => r.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => usersAPI.updateRole(id, role),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success(`Role updated to ${vars.role}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id) => usersAPI.toggleActive(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success(res.data.isActive ? 'Account activated' : 'Account deactivated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User account removed');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleDelete = (id, name) => {
    if (id === currentUser?._id) {
      toast.error('You cannot delete your own administrative account.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user account: ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const users = data?.users || [];
  const total = data?.total || users.length;

  const roleColors = {
    Admin: { bg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' },
    'Lead Archaeologist': { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
    'Field Assistant': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    Viewer: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ display: 'inline-flex', padding: '4px 8px', background: '#F3E8FF', color: '#7E22CE', borderRadius: 6, fontSize: 12, fontWeight: 700, alignItems: 'center', gap: 4 }}>
              <Shield size={13} /> ASI Institutional Administration
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
            User & Role Management
          </h1>
          <p style={{ fontSize: 13.5, color: '#6E7872', margin: '4px 0 0 0' }}>
            Manage staff credentials, grant administrative authorizations, and control excavation team access levels.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: '#FFFFFF',
            border: '1px solid #D5DDD7',
            borderRadius: 6,
            fontSize: 13,
            color: '#1A1D20',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <RefreshCw size={14} /> Refresh Roster
        </button>
      </div>

      {/* ─── Filters & Search ───────────────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E1E6E2',
          borderRadius: 8,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6E7872', marginRight: 4 }}>
            Filter by Role:
          </span>
          {['', 'Admin', 'Lead Archaeologist', 'Field Assistant', 'Viewer'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: roleFilter === r ? '1px solid #31543D' : '1px solid #D5DDD7',
                background: roleFilter === r ? '#31543D' : '#F7F9F7',
                color: roleFilter === r ? '#FFFFFF' : '#414942',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8B9790' }} />
          <input
            type="text"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              fontSize: 13,
              border: '1px solid #D5DDD7',
              borderRadius: 6,
              outline: 'none',
              background: '#FDFEFC',
            }}
          />
        </div>
      </div>

      {/* ─── Users Table ────────────────────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E1E6E2',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6E7872' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 13.5 }}>Loading archaeological personnel registry...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6E7872' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No users matched the search query</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F7F9F7', borderBottom: '1px solid #E1E6E2' }}>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#414942', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Personnel / Scientist
                </th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#414942', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Contact & Institution
                </th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#414942', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  System Role
                </th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#414942', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Status
                </th>
                <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 700, color: '#414942', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                  Administrative Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;
                const rStyle = roleColors[u.role] || roleColors.Viewer;

                return (
                  <tr
                    key={u._id}
                    style={{
                      borderBottom: '1px solid #EEF2EF',
                      transition: 'background 0.15s ease',
                      opacity: u.isActive ? 1 : 0.65,
                    }}
                  >
                    {/* Personnel info */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {((isSelf && currentUser?.avatar) ? currentUser.avatar : u.avatar) ? (
                          <img
                            src={(isSelf && currentUser?.avatar) ? currentUser.avatar : u.avatar}
                            alt={u.name}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: isSelf ? '2px solid #31543D' : '1px solid #D8D4CC',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '50%',
                              background: isSelf ? '#31543D' : '#556059',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {u.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D20', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {u.name}
                            {isSelf && (
                              <span style={{ fontSize: 10.5, background: '#E8F5E9', color: '#2E7D32', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                                (You)
                              </span>
                            )}
                          </div>
                          {u.expertise && u.expertise.length > 0 && (
                            <div style={{ fontSize: 11.5, color: '#6E7872', marginTop: 2 }}>
                              {u.expertise.slice(0, 2).join(' • ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact & Institution */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontSize: 13, color: '#1A1D20', fontWeight: 500 }}>{u.email}</div>
                      <div style={{ fontSize: 12, color: '#6E7872', marginTop: 2 }}>
                        {u.institution || 'Archaeological Survey of India'}
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td style={{ padding: '14px 18px' }}>
                      <select
                        value={u.role}
                        disabled={isSelf || roleMutation.isLoading}
                        onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                        style={{
                          padding: '5px 10px',
                          fontSize: 12.5,
                          fontWeight: 600,
                          borderRadius: 6,
                          background: rStyle.bg,
                          color: rStyle.text,
                          border: `1px solid ${rStyle.border}`,
                          cursor: isSelf ? 'not-allowed' : 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Lead Archaeologist">Lead Archaeologist</option>
                        <option value="Field Assistant">Field Assistant</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      {u.isActive ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 9px',
                            borderRadius: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#ECFDF5',
                            color: '#047857',
                          }}
                        >
                          <UserCheck size={12} /> Active
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 9px',
                            borderRadius: 4,
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#FEE2E2',
                            color: '#B91C1C',
                          }}
                        >
                          <UserX size={12} /> Deactivated
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {!isSelf && (
                          <>
                            <button
                              onClick={() => toggleActiveMutation.mutate(u._id)}
                              title={u.isActive ? 'Deactivate user' : 'Activate user'}
                              style={{
                                padding: '5px 10px',
                                fontSize: 12,
                                borderRadius: 5,
                                border: '1px solid #D5DDD7',
                                background: '#FFFFFF',
                                color: u.isActive ? '#B91C1C' : '#047857',
                                cursor: 'pointer',
                                fontWeight: 500,
                              }}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              title="Delete user account"
                              style={{
                                padding: '5px 8px',
                                borderRadius: 5,
                                border: '1px solid #FCA5A5',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
