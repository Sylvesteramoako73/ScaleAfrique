interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  textColor?: string;
}

export function Logo({ size = 36, showText = true, className = '', textColor = 'text-gray-900' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon — Africa silhouette + bar chart growth */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Africa continent shape */}
        <path
          d="M18 4 C14 4 11 7 10 10 C9 13 10 15 9 17 C8 19 6 20 6 23 C6 27 8 30 10 32 C12 34 12 36 13 38 C14 40 16 43 19 44 C22 45 24 43 26 41 C28 39 29 37 31 36 C33 35 35 34 36 32 C38 29 38 26 37 23 C36 20 34 18 34 16 C34 14 35 12 34 10 C33 8 31 6 29 5 C27 4 24 4 22 4 Z"
          fill="url(#africaGrad)"
          opacity="0.9"
        />
        {/* Bar chart overlay */}
        <rect x="14" y="28" width="4" height="10" rx="1" fill="#F59E0B" opacity="0.95"/>
        <rect x="20" y="22" width="4" height="16" rx="1" fill="#F59E0B" opacity="0.95"/>
        <rect x="26" y="18" width="4" height="20" rx="1" fill="#F59E0B" opacity="0.95"/>
        {/* Growth swoosh */}
        <path
          d="M11 30 Q20 18 36 14"
          stroke="#4ADE80"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="36,14 34,19 39,17" fill="#4ADE80"/>
        <defs>
          <linearGradient id="africaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f"/>
            <stop offset="100%" stopColor="#1B5E20"/>
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span className={`font-bold leading-none ${textColor}`} style={{ fontSize: size * 0.47 }}>
          <span className="text-gray-900">Scale</span>
          <span className="text-primary-600">Afrique</span>
        </span>
      )}
    </div>
  );
}
