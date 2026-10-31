import type React from 'react';

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

export const IconMaximize: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, p)}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const IconMinimize: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, p)}>
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
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

export const IconStop: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'currentColor', false, p)}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
  </svg>
);

export const IconUpload: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

export const IconDownload: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const IconLink: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const IconUndo: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
  </svg>
);

export const IconRedo: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
  </svg>
);

export const IconZoomIn: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
  </svg>
);

export const IconZoomOut: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3M8 11h6" />
  </svg>
);

export const IconFit: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />
  </svg>
);

export const IconTracks: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M4 6h10M4 12h16M4 18h7" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="15" cy="18" r="2" />
  </svg>
);

export const IconSliders: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </svg>
);

export const IconPanelLeft: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

export const IconRepeat: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export const IconMetronome: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M9 3h6l4 18H5z" />
    <path d="M12 15 17 6M8 15h8" />
  </svg>
);

export const IconCountIn: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M10 2h4" />
  </svg>
);

export const IconVolumeMute: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    <path d="m22 9-6 6M16 9l6 6" />
  </svg>
);

export const IconEye: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

export const IconYoutube: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="m10 9 5 3-5 3z" />
  </svg>
);

export const IconWand: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="m15 4-11 11 5 5 11-11zM14 5l5 5" />
    <path d="M19 2v2M21 3h-2M5 3v2M6 4H4" />
  </svg>
);

export const IconReset: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = (p) => (
  <svg {...iconBase(12, 'none', true, p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconPrinter: React.FC<IconProps> = (p) => (
  <svg {...iconBase(14, 'none', true, { strokeWidth: 1.8, ...p })}>
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
