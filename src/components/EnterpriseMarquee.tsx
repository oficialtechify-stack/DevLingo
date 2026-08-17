import React from 'react';
import { Globe2 } from 'lucide-react';

interface CompanyLogoProps {
  id: string;
  className?: string;
}

const BrandLogo: React.FC<CompanyLogoProps> = ({ id, className = "w-5 h-5" }) => {
  switch (id) {
    case 'airbnb':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="currentColor">
          <path
            fill="#FF5A5F"
            d="M16 1c-2.3 0-4.3 1.3-6.1 3.8C7.6 7.8 5 13.6 5 19.3c0 6.6 4.6 11.7 11 11.7s11-5.1 11-11.7c0-5.7-2.6-11.5-4.9-14.5C20.3 2.3 18.3 1 16 1zm0 3.3c1.4 0 2.9 1 4.5 3.1 2 2.6 4.3 7.8 4.3 11.9 0 4.6-3.1 8.3-8.8 8.3s-8.8-3.7-8.8-8.3c0-4.1 2.3-9.3 4.3-11.9 1.6-2.1 3.1-3.1 4.5-3.1zm0 7.8c-2.5 0-4.5 2-4.5 4.5 0 2.6 2.3 5.4 4.5 8.1 2.2-2.7 4.5-5.5 4.5-8.1 0-2.5-2-4.5-4.5-4.5zm0 2.5c1.1 0 2 .9 2 2 0 1.2-1.3 3.1-2 4.3-.7-1.2-2-3.1-2-4.3 0-1.1.9-2 2-2z"
          />
        </svg>
      );
    case 'netflix':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <path fill="#E50914" d="M8 2h4.5v28H8z" />
          <path fill="#E50914" d="M19.5 2H24v28h-4.5z" />
          <path
            fill="#B81D24"
            d="M8 2l11.5 28H24L12.5 2z"
          />
        </svg>
      );
    case 'figma':
      return (
        <svg viewBox="0 0 38 57" className={className}>
          <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
          <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
          <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
          <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
          <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
        </svg>
      );
    case 'mckinsey':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <rect width="32" height="32" rx="8" fill="#002244" />
          <text
            x="50%"
            y="54%"
            dominantBaseline="central"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="serif"
            fontWeight="bold"
            fontSize="15"
            letterSpacing="-0.5"
          >
            M
          </text>
          <circle cx="23" cy="9" r="2" fill="#00A3E0" />
        </svg>
      );
    case 'stripe':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <rect width="32" height="32" rx="8" fill="#635BFF" />
          <path
            fill="#FFFFFF"
            d="M14.8 12.3c0-.9.8-1.3 2-1.3 1.8 0 4.1.6 5.8 1.6V7.7C20.8 6.9 18.7 6.5 16.6 6.5c-4.6 0-7.7 2.4-7.7 6.4 0 6.2 8.6 5.2 8.6 7.9 0 1.1-.9 1.5-2.2 1.5-2 0-4.6-.9-6.6-2v5.1c2.2 1 4.6 1.4 6.8 1.4 4.7 0 8-2.3 8-6.4-.1-6.7-8.7-5.5-8.7-8.1z"
          />
        </svg>
      );
    case 'canva':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <defs>
            <linearGradient id="canva-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C4CC" />
              <stop offset="50%" stopColor="#7D2AE8" />
              <stop offset="100%" stopColor="#1C1D85" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill="url(#canva-grad)" />
          <path
            fill="#FFFFFF"
            d="M17.8 19.8c-1.4 0-2.2-.9-2.2-2.3 0-2.3 1.9-4.8 4.2-4.8.8 0 1.4.4 1.4 1.1 0 2-2 6-3.4 6zm4.8-7.9c-.8-.7-2-1.1-3.3-1.1-3.6 0-6.8 3.5-6.8 7.3 0 2.9 1.8 4.6 4.3 4.6 3.1 0 5.4-2.8 5.4-6.3 0-.6-.1-1.1-.2-1.5 1.1-1.5 2.1-3.1 2.8-4.7-.7.6-1.5 1.2-2.2 1.7z"
          />
        </svg>
      );
    case 'spotify':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <circle cx="16" cy="16" r="16" fill="#1DB954" />
          <path
            fill="#000000"
            d="M22.5 23.2c-.3 0-.6-.1-.8-.3-4.3-2.6-9.8-3.2-16.2-1.7-.5.1-1.1-.2-1.2-.8-.1-.5.2-1.1.8-1.2 7.1-1.6 13.2-1 18 2 .5.3.6.9.3 1.4-.2.4-.5.6-.9.6zm1.9-4.3c-.4 0-.7-.2-.9-.4-4.9-3-12.4-3.9-18.3-2.1-.7.2-1.4-.2-1.6-.8-.2-.7.2-1.4.8-1.6 6.7-2 15-1.1 20.7 2.4.6.4.8 1.2.4 1.8-.3.5-.7.7-1.1.7zm.2-4.5c-.4 0-.8-.2-1.1-.5-5.9-3.5-15.6-3.8-21.3-2.1-.8.2-1.7-.2-1.9-1.1-.2-.8.2-1.7 1.1-1.9 6.6-2 17.3-1.6 24.1 2.4.7.4 1 1.4.5 2.1-.3.7-.8 1.1-1.4 1.1z"
          />
        </svg>
      );
    case 'deel':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <rect width="32" height="32" rx="8" fill="#15357A" />
          <path
            fill="#2CD5C4"
            d="M9 8h6.2c4.3 0 7.8 3.5 7.8 7.8s-3.5 7.8-7.8 7.8H9V8zm6 11.6c2 0 3.7-1.7 3.7-3.8s-1.7-3.8-3.7-3.8H13v7.6h2z"
          />
        </svg>
      );
    case 'adobe':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <rect width="32" height="32" rx="6" fill="#FA0F00" />
          <path
            fill="#FFFFFF"
            d="M19.8 6h6.2v20zm-7.6 0H6v20zm1.9 8.2l3.4 8.7h-3.2l-1.3-3.6h-3.4l2.8-7.1h1.7z"
          />
        </svg>
      );
    case 'google_cloud':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <rect width="32" height="32" rx="8" fill="#FFFFFF" />
          <path
            fill="#EA4335"
            d="M16 9.5c1.8 0 3.4.6 4.7 1.8l3.5-3.5C22.1 5.9 19.2 5 16 5 10.5 5 5.8 8.1 3.6 12.7l4.1 3.2C8.7 12.1 12 9.5 16 9.5z"
          />
          <path
            fill="#4285F4"
            d="M26.8 16.4c0-.8-.1-1.6-.2-2.4H16v4.6h6.1c-.3 1.4-1.1 2.6-2.3 3.4l3.7 2.9c2.2-2 3.3-5 3.3-8.5z"
          />
          <path
            fill="#FBBC05"
            d="M7.7 15.9c-.3-.8-.4-1.6-.4-2.4 0-.8.1-1.6.4-2.4L3.6 7.9C2.6 9.9 2 12.1 2 14.5s.6 4.6 1.6 6.6l4.1-3.2z"
          />
          <path
            fill="#34A853"
            d="M16 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-4 0-7.3-2.6-8.3-6.4L3.6 16.1C5.8 20.7 10.5 24 16 24z"
          />
        </svg>
      );
    default:
      return (
        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold">
          {id[0]?.toUpperCase()}
        </div>
      );
  }
};

const COMPANIES = [
  { id: 'airbnb', name: 'Airbnb', role: 'Product Design & Engineering', stack: 'Figma / React / Mobile' },
  { id: 'netflix', name: 'Netflix', role: 'Video Production & Streaming', stack: 'DaVinci / ACES / Microservices' },
  { id: 'figma', name: 'Figma', role: 'Design Systems & WebGL', stack: 'Design Tokens / WebAssembly / C++' },
  { id: 'mckinsey', name: 'McKinsey', role: 'Business Strategy & Operations', stack: 'FP&A / Process / Data' },
  { id: 'stripe', name: 'Stripe', role: 'Global Financial Infrastructure', stack: 'Go / Ruby / Distributed' },
  { id: 'canva', name: 'Canva', role: 'Creative Tools & Visual Design', stack: 'UI/UX / Motion / Video' },
  { id: 'spotify', name: 'Spotify', role: 'Media, Audio & Tech', stack: 'Audio DSP / Python / Cloud' },
  { id: 'deel', name: 'Deel', role: 'Global Remote Work & HR Tech', stack: 'Operations / Growth / Node' },
  { id: 'adobe', name: 'Adobe', role: 'Creative Cloud & Motion', stack: 'Premiere / After Effects / C++' },
  { id: 'google_cloud', name: 'Google Cloud', role: 'Cloud & AI Infrastructure', stack: 'Go / Kubernetes / BigQuery' }
];

export const EnterpriseMarquee: React.FC = () => {
  return (
    <div className="w-full py-10 bg-[#06060a] border-y border-white/5 relative overflow-hidden">
      <div className="container-wide mb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
          <Globe2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Calibrado para os padrões de contratação das maiores empresas do mundo</span>
        </div>
      </div>

      {/* Infinite scrolling track */}
      <div className="relative w-full flex overflow-hidden mask-fade-edges">
        <div className="flex gap-4 sm:gap-6 shrink-0 animate-marquee py-2">
          {COMPANIES.concat(COMPANIES).map((company, index) => (
            <div
              key={index}
              className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.07] transition-all cursor-default group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-110 transition-transform">
                <BrandLogo id={company.id} className="w-full h-full object-contain" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors flex items-center gap-1.5">
                  <span>{company.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {company.stack}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
