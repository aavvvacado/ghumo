import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export const GoogleIcon: React.FC<IconProps> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </Svg>
);

export const AppleIcon: React.FC<IconProps> = ({ size = 20, color = '#1F2328' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.19.67-2.88 1.48-.56.65-1.06 1.74-.93 2.8 1.11.09 2.24-.58 2.87-1.35z" />
  </Svg>
);

export const BinanceIcon: React.FC<IconProps> = ({ size = 20, color = '#F3BA2F' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2.5L7.2 7.3l2.4 2.4L12 7.3l2.4 2.4 2.4-2.4L12 2.5zm-6.7 6.7L2.9 11.6l2.4 2.4 2.4-2.4-2.4-2.4zm13.4 0l-2.4 2.4 2.4 2.4 2.4-2.4-2.4-2.4zM12 12.1l-2.4 2.4 2.4 2.4 2.4-2.4-2.4-2.4zm-4.8 4.8l-2.4 2.4L12 21.5l7.2-2.2-2.4-2.4L12 19.1l-4.8-2.2z" />
  </Svg>
);

export const WalletIcon: React.FC<IconProps> = ({ size = 20, color = '#1F2328' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    <Circle cx="18" cy="12" r="1" fill={color} />
  </Svg>
);

export const LoginTabIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M14 4h5v16h-5" />
    <Path d="M4 12h11" />
    <Path d="M11 8l4 4-4 4" />
  </Svg>
);

export const SignUpTabIcon: React.FC<IconProps> = ({ size = 18, color = '#686B6E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    <Path d="M3 20a7 7 0 0 1 12.5-4.5" />
    <Path d="M18 8v6" />
    <Path d="M15 11h6" />
  </Svg>
);

export const MailIcon: React.FC<IconProps> = ({ size = 18, color = '#686B6E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="4" width="20" height="16" rx="2" />
    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 18, color = '#686B6E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 20, color = '#686B6E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ size = 20, color = '#686B6E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <Path d="M2 2l20 20" />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Svg>
);

/**
 * Official Ghumo Logo SVG
 * Stylized peacock forming G with heritage inlay + humo and location pin dot
 */
export const GhumoLogo: React.FC<{ width?: number; height?: number }> = ({
  width = 190,
  height = 95,
}) => (
  <Svg width={width} height={height} viewBox="0 0 260 130" fill="none">
    {/* Peacock Crest */}
    <Circle cx="98" cy="14" r="3.2" fill="#FFF8EE" />
    <Circle cx="107" cy="18" r="3.2" fill="#FFF8EE" />
    <Circle cx="89" cy="18" r="3.2" fill="#FFF8EE" />
    <Path d="M98 17v8M105 20l-5 5M91 20l5 5" stroke="#FFF8EE" strokeWidth="1.8" strokeLinecap="round" />

    {/* Peacock G Body */}
    <Path
      d="M100 24c-22 0-38 18-38 41 0 23 16 41 38 41 14 0 26-7 32-18-5 1-11 2-17 2-18 0-32-12-32-28 0-14 10-25 24-27 1-1 3-3 5-5-2-4-7-6-12-6z"
      fill="#FFF8EE"
    />

    {/* Peacock Beak & Head Detail */}
    <Path d="M100 24c8 0 15 5 15 13 0 5-3 9-8 11-2-5-6-8-12-9 2-8 3-15 5-15z" fill="#FFF8EE" />
    <Path d="M115 32l6 3-6 2z" fill="#FFF8EE" />
    <Circle cx="106" cy="31" r="1.8" fill="#C25732" />

    {/* Indian Heritage Architecture Inlay inside Peacock Base */}
    <G transform="translate(68, 64) scale(0.65)">
      {/* Jharokha / Temple Dome */}
      <Path d="M18 20c0-8 6-14 14-14s14 6 14 14v16H18V20z" fill="#2E6F62" />
      <Path d="M32 2v4" stroke="#FFF8EE" strokeWidth="2" strokeLinecap="round" />
      <Path d="M26 28c0-4 3-7 6-7s6 3 6 7v8h-12v-8z" fill="#FFF8EE" />
      {/* Steps / Fort Walls */}
      <Path d="M2 36h14v-8h-8v-8H2v16z" fill="#E7A44B" />
      <Path d="M48 36h14V24h-8v-6h-6v18z" fill="#E7A44B" />
      {/* Sun Accent */}
      <Circle cx="52" cy="10" r="5" fill="#E7A44B" />
    </G>

    {/* humo letters */}
    {/* 'h' */}
    <Path
      d="M128 42v44h8V64c0-7 4-11 11-11s10 4 10 11v22h8V62c0-11-7-18-18-18-7 0-13 4-16 10V42h-3z"
      fill="#FFF8EE"
    />
    {/* 'u' */}
    <Path
      d="M174 52v20c0 8 5 13 13 13s13-5 13-13V52h8v20c0 13-8 20-21 20s-21-7-21-20V52h8z"
      fill="#FFF8EE"
    />
    {/* 'm' */}
    <Path
      d="M216 52v34h-8V64c0-7-4-11-9-11s-9 4-9 11v22h-8V64c0-7-4-11-9-11s-9 4-9 11v22h-8V52h8v6c3-4 8-7 14-7 6 0 11 3 14 8 3-5 9-8 16-8 10 0 17 7 17 18v17z"
      fill="#FFF8EE"
      transform="translate(18, 0)"
    />
    {/* 'o' with Location Pin */}
    <G transform="translate(186, 44)">
      <Path
        d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28s20-13 20-28C40 9 31 0 20 0z"
        fill="#FFF8EE"
      />
      <Circle cx="20" cy="19" r="6" fill="#C25732" />
    </G>
  </Svg>
);
