import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to ArchaeoTrack');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#FFFFFF',
        fontFamily: 'var(--font-sans)',
      }}
      className="split-auth-container"
    >
      {/* ─── Left Side: Form ──────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 6vw, 72px)',
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 40 }}
        >
          <Landmark size={26} color="#31543D" strokeWidth={2.2} />
          <span style={{ fontSize: 22, fontWeight: 700, color: '#1A1D20', letterSpacing: '-0.02em' }}>
            ArchaeoTrack
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D20', marginBottom: 8 }}>
          Sign in to your account
        </h1>
        <p style={{ fontSize: 14, color: '#6A746E', marginBottom: 28 }}>
          Access your excavation records, catalogued artifacts, and field logs.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3A423D', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #D8D4CC',
                borderRadius: 6,
                fontSize: 14,
                color: '#1A1D20',
                outline: 'none',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#31543D'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#D8D4CC'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3A423D', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '11px 40px 11px 14px',
                  border: '1px solid #D8D4CC',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#1A1D20',
                  outline: 'none',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#31543D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#D8D4CC'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#8A948E',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#556059' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#31543D', cursor: 'pointer' }}
              />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ color: '#31543D', fontWeight: 600, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              padding: '12px',
              background: '#31543D',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#24432E')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#31543D')}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>


          {/* Footer Switch Link */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#6A746E', marginTop: 8 }}>
            New to ArchaeoTrack?{' '}
            <Link to="/register" style={{ color: '#31543D', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </form>
      </div>

      {/* ─── Right Side: Photographic Panel ───────────────────────── */}
      <div
        style={{
          position: 'relative',
          background: '#EAE5DC',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
        className="auth-image-panel"
      >
        <img
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&auto=format&fit=crop&q=80"
          alt="Excavated Archaeological Artifact in Sand"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(22, 28, 24, 0.85) 0%, rgba(22, 28, 24, 0.2) 60%, transparent 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 10, padding: 48, color: '#FFFFFF' }}>
          <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, maxWidth: 440 }}>
            Archaeological Research &amp; Excavation Management System
          </div>
          <div style={{ fontSize: 13, color: '#D2DDD5', marginTop: 8 }}>
            Documenting humanity's shared heritage with scientific precision.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .split-auth-container { grid-template-columns: 1fr !important; }
          .auth-image-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
