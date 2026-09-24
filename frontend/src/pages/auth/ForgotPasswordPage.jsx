import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Shovel, CheckCircle } from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { authAPI } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
            <BrandLogo size="md" subtitleText="ACCOUNT RECOVERY" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, color: 'var(--text-primary)', fontWeight: 700 }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Enter your email to receive recovery instructions
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={44} color="var(--color-olive)" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>
                Reset Link Sent
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched. Please review your email inbox.
              </p>
              <Link to="/login" className="btn btn-secondary" style={{ marginTop: 24, display: 'inline-flex' }}>
                <ArrowLeft size={15} /> Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Enter your institutional email address to receive password reset instructions.
              </p>
              {error && (
                <div style={{ background: 'var(--color-error-pale)', border: '1px solid #F5C6B8', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--color-error)' }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: 38 }}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
                  {loading ? <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF' }} /> : 'Send Recovery Instructions'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                <Link to="/login" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
