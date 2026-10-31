import type React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

// Drawn like the icons of @coderline/alphatab-ui, which has no notation or pointer icon.
function strokeIcon({ size = 14, ...props }: IconProps) {
  return {
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export const IconNotation: React.FC<IconProps> = (p) => (
  <svg {...strokeIcon(p)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const IconPointer: React.FC<IconProps> = (p) => (
  <svg {...strokeIcon(p)}>
    <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51z" />
    <path d="m13 13 6 6" />
  </svg>
);
