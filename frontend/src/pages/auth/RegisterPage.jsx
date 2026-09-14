import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Viewer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, 'Viewer');
      toast.success('Registration successful! Welcome to ArchaeoTrack.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 36 }}
        >
          <Landmark size={26} color="#31543D" strokeWidth={2.2} />
          <span style={{ fontSize: 22, fontWeight: 700, color: '#1A1D20', letterSpacing: '-0.02em' }}>
            ArchaeoTrack
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D20', marginBottom: 6 }}>
          Create your account
        </h1>
        <p style={{ fontSize: 14, color: '#6A746E', marginBottom: 26 }}>
          Start cataloguing archaeological sites, material finds, and field records.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3A423D', marginBottom: 6 }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
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

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3A423D', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3A423D', marginBottom: 6 }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
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

          {/* Register Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
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
            {loading ? 'Registering...' : 'Register'}
          </button>

          {/* Switch to Login */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#6A746E', marginTop: 10 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#31543D', fontWeight: 600, textDecoration: 'none' }}>
              Login
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
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80"
          alt="Hands Excavating Archaeological Artifact in Soil"
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
            Join our research community and help preserve our shared heritage.
          </div>
          <div style={{ fontSize: 13, color: '#D2DDD5', marginTop: 8 }}>
            Collaborative, cloud-based field registry and artifact documentation.
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
