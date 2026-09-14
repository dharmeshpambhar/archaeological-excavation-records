import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shovel, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, flexDirection: 'column', textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{
          width: 72,
          height: 72,
          background: 'var(--color-sand)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Shovel size={32} color="var(--color-terracotta)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(4rem, 12vw, 8rem)', color: 'var(--color-terracotta)', fontWeight: 700, lineHeight: 0.9, marginBottom: 16 }}>404</h1>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 12 }}>This Layer Doesn't Exist</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 32, maxWidth: 400, lineHeight: 1.6 }}>
          Like a misidentified stratigraphic layer, this page can't be found in our records. Let's get you back on solid ground.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ gap: 8 }}>
            <Home size={16} /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-outline" style={{ gap: 8 }}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
