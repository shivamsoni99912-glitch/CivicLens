import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props
});

export const IconArrow = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const IconPencil = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconSparkle = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8Z" />
    <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
  </svg>
);

export const IconGauge = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 18a9 9 0 1 1 17 0" />
    <path d="M12 18l4.2-5" />
    <circle cx="12" cy="18" r="1.4" />
  </svg>
);

export const IconRadar = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 12 19 6.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconGrid = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </svg>
);

export const IconMenu = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconClose = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconUpload = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const IconCheck = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export const IconPin = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconClock = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3.2 2" />
  </svg>
);

export const IconSearch = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 4 4" />
  </svg>
);

export const IconShield = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconLayers = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m12 3 9 5-9 5-9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);

export const IconLens = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
    <circle cx="11" cy="11" r="2.2" />
  </svg>
);

export const IconPlay = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 5.5v13l10-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="7" y="5" width="3.8" height="14" rx="1.2" fill="currentColor" stroke="none" />
    <rect x="13.2" y="5" width="3.8" height="14" rx="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconWave = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 10.5v3" />
    <path d="M8 7.5v9" />
    <path d="M12 4.5v15" />
    <path d="M16 8.5v7" />
    <path d="M20 11v2" />
  </svg>
);

export const IconTrash = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16" />
    <path d="M9 7V5h6v2" />
    <path d="M6 7l1 13h10l1-13" />
  </svg>
);
