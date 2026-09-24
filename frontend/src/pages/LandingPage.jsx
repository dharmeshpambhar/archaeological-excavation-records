import { useNavigate } from 'react-router-dom';
import {
  Landmark, Package, BookOpen, BarChart2,
  ArrowRight, CheckCircle2, Shield, MapPin, Search, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const featureCards = [
    {
      icon: Landmark,
      title: 'Manage Sites',
      desc: 'Record and track archaeological sites and their details.',
    },
    {
      icon: Package,
      title: 'Catalog Artifacts',
      desc: 'Document and organize findings with rich metadata.',
    },
    {
      icon: BookOpen,
      title: 'Field Logs',
      desc: 'Keep detailed records of excavation activities.',
    },
    {
      icon: BarChart2,
      title: 'Research & Analysis',
      desc: 'Access comprehensive data for better insights.',
    },
  ];

  return (
    <div style={{ background: '#F9F8F5', minHeight: '100vh', color: '#1A1D20', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Top Navbar ─────────────────────────────────────────── */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E8E5DF',
          height: 70,
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(20px, 5vw, 64px)',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand */}
        <BrandLogo
          size="lg"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="landing-nav-links">
          <a href="#home" style={{ color: '#1A1D20', fontWeight: 600, fontSize: 14 }}>Home</a>
          <a href="#about" style={{ color: '#556059', fontWeight: 500, fontSize: 14 }}>About</a>
          <a href="#features" style={{ color: '#556059', fontWeight: 500, fontSize: 14 }}>Features</a>
          <a href="#contact" style={{ color: '#556059', fontWeight: 500, fontSize: 14 }}>Contact</a>
        </nav>

        {/* Auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '9px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#31543D',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#24432E'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#31543D'}
            >
              <LayoutDashboard size={16} />
              Open Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#31543D',
                  background: 'transparent',
                  border: '1px solid #C5D6CA',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#EAF4ED'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  padding: '8px 20px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#31543D',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#24432E'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#31543D'}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section
        id="home"
        style={{
          padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 64px)',
          maxWidth: 1360,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 48,
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Left Column Content */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#65726B',
                marginBottom: 16,
              }}
            >
              ARCHAEOLOGICAL RESEARCH &amp; FIELD RECORDS
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
                fontWeight: 700,
                color: '#1A1D20',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: 20,
              }}
            >
              Preserving Our Past <br />
              Through Better Records
            </h1>

            <p
              style={{
                fontSize: 'clamp(15px, 1.2vw, 17px)',
                color: '#556059',
                lineHeight: 1.6,
                maxWidth: 520,
                marginBottom: 32,
              }}
            >
              An organized platform for managing archaeological sites, artifacts, field observations and research records.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                style={{
                  padding: '12px 28px',
                  background: '#31543D',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#24432E'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#31543D'}
              >
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard size={17} />
                    Go to Dashboard
                  </>
                ) : (
                  'Get Started'
                )}
              </button>

              <a
                href="#features"
                style={{
                  padding: '12px 26px',
                  background: '#FFFFFF',
                  color: '#1A1D20',
                  fontSize: 15,
                  fontWeight: 600,
                  border: '1px solid #D8D4CC',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F2EFEB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Column: Curved Desert Ruins Hero Image + Floating Artifact Story Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
                aspectRatio: '4 / 3',
                background: '#EAE5DC',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80"
                alt="Archaeological Excavation Ruins in Desert"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1000&auto=format&fit=crop&q=80';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Floating Card: "Every artifact tells a story." */}
            <div
              style={{
                position: 'absolute',
                bottom: -24,
                right: 20,
                background: '#FFFFFF',
                borderRadius: 12,
                padding: '14px 18px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #E8E5DF',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                maxWidth: 240,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 8,
                  background: '#F6F3EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=100&auto=format&fit=crop&q=80"
                  alt="Ancient Vessel"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D20', lineHeight: 1.3 }}>
                Every artifact tells a story.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Feature Cards Row (Matches Mockup Exactly) ───────── */}
      <section
        id="features"
        style={{
          padding: '40px clamp(20px, 5vw, 64px) 70px',
          maxWidth: 1360,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 20,
          }}
          className="feature-cards-grid"
        >
          {featureCards.map((card, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: 10,
                padding: '24px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#31543D';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(49,84,61,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E8E5DF';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: '#EAF4ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#31543D',
                }}
              >
                <card.icon size={20} />
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', marginBottom: 6 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 13, color: '#65726B', lineHeight: 1.5, margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Institutional About & Research Scope ───────────────── */}
      <section
        id="about"
        style={{
          background: '#FFFFFF',
          borderTop: '1px solid #E8E5DF',
          borderBottom: '1px solid #E8E5DF',
          padding: '70px clamp(20px, 5vw, 64px)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#31543D', marginBottom: 12 }}>
            About Archeological System
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 700, color: '#1A1D20', marginBottom: 16 }}>
            Designed for Field Archaeologists &amp; Research Institutions
          </h2>
          <p style={{ fontSize: 16, color: '#556059', lineHeight: 1.6, maxWidth: 740, margin: '0 auto 40px' }}>
            Built specifically to address the complex requirements of archaeological field excavations, stratigraphic recording, accession cataloguing, and geospatial analysis.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              textAlign: 'left',
            }}
            className="scope-grid"
          >
            {[
              {
                title: 'Rigorous Provenance',
                desc: 'Every artifact record links directly to trench depth, stratum layer, geographic coordinates, and date of discovery.',
              },
              {
                title: 'Role-Based Collaboration',
                desc: 'Field directors, excavators, and lab analysts collaborate with dedicated permission controls.',
              },
              {
                title: 'Standardized Classification',
                desc: 'Harmonized vocabularies for historical eras, material typologies, and physical condition assessments.',
              },
            ].map((col, i) => (
              <div
                key={i}
                style={{
                  background: '#F9F8F5',
                  padding: 24,
                  borderRadius: 8,
                  border: '1px solid #E8E5DF',
                }}
              >
                <CheckCircle2 size={20} color="#31543D" style={{ marginBottom: 10 }} />
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', marginBottom: 8 }}>{col.title}</h4>
                <p style={{ fontSize: 13.5, color: '#556059', lineHeight: 1.5, margin: 0 }}>{col.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact & Institutional Footer ─────────────────────── */}
      <footer
        id="contact"
        style={{
          background: '#1A1D20',
          color: '#8E97A0',
          padding: '60px clamp(20px, 5vw, 64px) 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 32,
            paddingBottom: 40,
            borderBottom: '1px solid #282E34',
          }}
        >
          <div>
            <div style={{ marginBottom: 12 }}>
              <BrandLogo
                size="md"
                theme="dark"
                subtitleText="EXCAVATION &amp; FIELD ARCHIVE"
              />
            </div>
            <p style={{ fontSize: 13, maxWidth: 360, lineHeight: 1.6, color: '#8A949E' }}>
              Institutional platform for archaeological excavations, material culture registries, and stratigraphic field journals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Modules</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <a href="#features" style={{ color: '#8A949E' }}>Excavation Sites</a>
                <a href="#features" style={{ color: '#8A949E' }}>Artifacts Catalog</a>
                <a href="#features" style={{ color: '#8A949E' }}>Field Journals</a>
                <a href="#features" style={{ color: '#8A949E' }}>GIS Mapping</a>
              </div>
            </div>

            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Access</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <button onClick={() => navigate('/login')} style={{ color: '#8A949E', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>Sign In</button>
                <button onClick={() => navigate('/register')} style={{ color: '#8A949E', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 13 }}>Register Researcher</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1360, margin: '24px auto 0', fontSize: 12, color: '#68727B', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Archeological System. Archaeological Research &amp; Field Records.
        </div>
      </footer>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .feature-cards-grid { grid-template-columns: 1fr 1fr !important; }
          .scope-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .feature-cards-grid { grid-template-columns: 1fr !important; }
          .landing-nav-links { display: none !important; }
        }
      `}</style>
    </div>
  );
}
