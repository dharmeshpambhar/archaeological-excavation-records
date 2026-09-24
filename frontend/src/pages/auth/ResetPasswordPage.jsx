import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Shovel } from 'lucide-react';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, { password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Security token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#FFFFFF',
          borderRadius: 'var(--border-radius-md)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div style={{ background: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-color)', padding: '24px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <BrandLogo size="md" subtitleText="CREDENTIAL SECURITY" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--text-primary)', fontWeight: 700 }}>
            Set New Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Enter your new secure password below
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={44} color="var(--color-olive)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>
                Password Updated
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Redirecting to portal sign in...</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Please establish your new password below.
              </p>
              {error && (
                <div style={{ background: 'var(--color-error-pale)', border: '1px solid #F5C6B8', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--color-error)' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={show ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      style={{ paddingLeft: 38, paddingRight: 38 }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      aria-label={show ? 'Hide password' : 'Show password'}
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Re-enter password"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      style={{ paddingLeft: 38 }}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                  {loading ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }} /> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
