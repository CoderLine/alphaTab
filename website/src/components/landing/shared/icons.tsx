import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function iconBase(size: number, fill: 'currentColor' | 'none', stroke: boolean, props: IconProps) {
  const { size: _ignored, ...rest } = props;
  return {
    viewBox: '0 0 24 24',
    width: props.size ?? size,
    height: props.size ?? size,
    fill,
    ...(stroke
      ? {
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        }
      : {}),
    ...rest,
  };
}

export const IconGithub: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'currentColor', false, p)}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.74-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'none', true, p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconSun: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'none', true, p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const IconMoon: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'none', true, p)}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const IconCaret: React.FC<IconProps> = (p) => (
  <svg {...iconBase(12, 'none', true, { strokeWidth: 2.4, ...p })}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconArrow: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, p)}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export const IconExternalLink: React.FC<IconProps> = (p) => (
  <svg {...iconBase(12, 'none', true, p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const IconPlay: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'currentColor', false, p)}>
    <path d="M7 4v16l13-8z" />
  </svg>
);

export const IconPause: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'currentColor', false, p)}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 2.4, ...p })}>
    <path d="m5 12 5 5 9-11" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

export const IconMenu: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'none', true, p)}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IconVolume: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8L4.2 7a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const IconCode: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, p)}>
    <path d="m9 17-5-5 5-5M15 7l5 5-5 5" />
  </svg>
);

export const IconFileMusic: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <circle cx="10" cy="17" r="1.5" />
    <path d="M11.5 17v-4l4-1v3" />
    <circle cx="14" cy="15" r="1.5" />
  </svg>
);

export const IconClose: React.FC<IconProps> = (p) => (
  <svg {...iconBase(12, 'none', true, { strokeWidth: 2.4, ...p })}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconInfo: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'none', true, p)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-5M12 8h.01" />
  </svg>
);

export const IconHeadphones: React.FC<IconProps> = (p) => (
  <svg {...iconBase(16, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

export const IconWaveform: React.FC<IconProps> = (p) => (
  <svg {...iconBase(12, 'none', true, { strokeWidth: 2, ...p })}>
    <path d="M3 10v4M7 6v12M11 3v18M15 7v10M19 10v4" />
  </svg>
);
