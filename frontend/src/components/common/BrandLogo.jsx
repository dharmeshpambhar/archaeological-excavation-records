import React from 'react';
import { Landmark } from 'lucide-react';

/**
 * Standardized, high-fidelity Brand Logo Component for Archeological System
 * @param {'sm' | 'md' | 'lg' | 'xl'} size - Scale of the logo
 * @param {'light' | 'dark'} theme - Background context (light or dark mode)
 * @param {boolean} showSubtitle - Whether to display the secondary institutional label
 * @param {string} subtitleText - Custom text for the secondary label
 * @param {boolean} collapsed - Collapsed icon-only mode for mini sidebars
 * @param {function} onClick - Optional click callback
 * @param {string} className - Additional CSS classes
 * @param {object} style - Inline style overrides
 */
export default function BrandLogo({
  size = 'md',
  theme = 'light',
  showSubtitle = true,
  subtitleText = 'EXCAVATION & RESEARCH ARCHIVE',
  collapsed = false,
  onClick,
  className = '',
  style = {},
}) {
  // Size presets
  const sizeMap = {
    sm: {
      iconBox: 28,
      iconSize: 15,
      titleSize: 14,
      subSize: 8,
      gap: 8,
      badgeRadius: 6,
    },
    md: {
      iconBox: 36,
      iconSize: 20,
      titleSize: 17,
      subSize: 8.5,
      gap: 10,
      badgeRadius: 8,
    },
    lg: {
      iconBox: 44,
      iconSize: 24,
      titleSize: 21,
      subSize: 9.5,
      gap: 12,
      badgeRadius: 10,
    },
    xl: {
      iconBox: 54,
      iconSize: 30,
      titleSize: 26,
      subSize: 10.5,
      gap: 14,
      badgeRadius: 12,
    },
  };

  const s = sizeMap[size] || sizeMap.md;
  const isDark = theme === 'dark';

  return (
    <div
      onClick={onClick}
      className={`brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* ─── Iconic Emblem Badge ───────────────────────────────────── */}
      <div
        style={{
          width: s.iconBox,
          height: s.iconBox,
          minWidth: s.iconBox,
          borderRadius: s.badgeRadius,
          background: isDark
            ? 'linear-gradient(135deg, #3D6A4E 0%, #213C2B 100%)'
            : 'linear-gradient(135deg, #31543D 0%, #1E3727 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
            : '0 2px 8px rgba(49, 84, 61, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.18)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Subtle decorative highlight shine */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Landmark size={s.iconSize} color="#F2EFE9" strokeWidth={2.2} />
      </div>

      {/* ─── Structured Typography ─────────────────────────────────── */}
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div
            style={{
              fontSize: s.titleSize,
              fontWeight: 700,
              color: isDark ? '#FFFFFF' : '#1A1D20',
              letterSpacing: '-0.025em',
              fontFamily: 'var(--font-sans, "Inter", sans-serif)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Archeological System</span>
          </div>

          {showSubtitle && (
            <div
              style={{
                fontSize: s.subSize,
                fontWeight: 600,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                color: isDark ? '#8E9CA8' : '#707C74',
                marginTop: 2,
                fontFamily: 'var(--font-sans, "Inter", sans-serif)',
              }}
            >
              {subtitleText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
