import React from 'react';

interface BorMediaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BorMediaLogo: React.FC<BorMediaLogoProps> = ({ size = 'md', className = '' }) => {
  const scales = { sm: 0.6, md: 1, lg: 1.4 };
  const s = scales[size];
  const iconW = Math.round(52 * s);
  const iconH = Math.round(52 * s);
  const titleSize = Math.round(22 * s);
  const subtitleSize = Math.round(10 * s);
  const gap = Math.round(10 * s);

  return (
    <div className={`flex items-center gap-${gap < 8 ? 2 : 3} select-none ${className}`}>
      {/* Circle icon */}
      <svg width={iconW} height={iconH} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bm-circle-grad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="55%" stopColor="#7B2FFF" />
            <stop offset="100%" stopColor="#0a0a1a" />
          </radialGradient>
          <radialGradient id="bm-inner-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bm-bar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>
        <circle cx="26" cy="26" r="25" fill="url(#bm-circle-grad)" />
        <circle cx="26" cy="26" r="25" fill="url(#bm-inner-glow)" />
        <circle cx="26" cy="26" r="24.5" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
        {/* BOR */}
        <text x="26" y="23" textAnchor="middle" fill="white" fontSize="11" fontWeight="800" fontFamily="'Sora', 'Inter', sans-serif" letterSpacing="2.5">BOR</text>
        {/* divider line */}
        <line x1="10" y1="26.5" x2="42" y2="26.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        {/* MEDIA */}
        <text x="26" y="37" textAnchor="middle" fill="rgba(180,210,255,0.95)" fontSize="9" fontWeight="700" fontFamily="'Sora', 'Inter', sans-serif" letterSpacing="2">MEDIA</text>
      </svg>

      {/* Text section */}
      <div className="flex flex-col leading-none">
        <span
          className="font-black tracking-tight text-white"
          style={{ fontSize: titleSize, fontFamily: "'Sora', 'Inter', sans-serif", lineHeight: 1.1 }}
        >
          Bor Media
        </span>
        {/* gradient underline */}
        <div
          className="rounded-full mt-1"
          style={{
            height: Math.round(2 * s),
            width: Math.round(64 * s),
            background: 'linear-gradient(90deg, #00D4FF 0%, #7B2FFF 100%)'
          }}
        />
        <span
          className="font-bold tracking-widest mt-1"
          style={{ fontSize: subtitleSize, color: '#00D4FF', fontFamily: "'Sora', 'Inter', sans-serif", letterSpacing: '0.18em' }}
        >
          SMM PANEL
        </span>
      </div>
    </div>
  );
};

export default BorMediaLogo;
