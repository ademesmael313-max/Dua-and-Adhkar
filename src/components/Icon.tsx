import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home"
  | "search"
  | "book"
  | "mosque"
  | "sunrise"
  | "moon"
  | "pulse"
  | "cloud"
  | "sparkle"
  | "compass"
  | "bookmark"
  | "bookmarkFill"
  | "settings"
  | "beads"
  | "plus"
  | "close"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "play"
  | "stop"
  | "share"
  | "copy"
  | "check"
  | "checkCircle"
  | "type"
  | "globe"
  | "bell"
  | "trash"
  | "arrowRight"
  | "arrowUpRight"
  | "monitor"
  | "info"
  | "edit"
  | "download"
  | "refresh"
  | "flame"
  | "heart"
  | "star"
  | "shield"
  | "menu"
  | "dots"
  | "volume"
  | "headphones"
  | "clock";

const icons: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3.5 10.7 12 3.6l8.5 7.1V20a1 1 0 0 1-1 1h-4.9v-5.8H9.4V21H4.5a1 1 0 0 1-1-1z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.6" />
      <path d="m20.2 20.2-4.4-4.4" />
    </>
  ),
  book: (
    <>
      <path d="M20 3.6H6.9A2.9 2.9 0 0 0 4 6.5v13.1a2.6 2.6 0 0 1 2.6-2.3H20z" />
      <path d="M4 19.6V6.5" />
      <path d="M8.3 7.6h7.4M8.3 11.2h5.4" />
    </>
  ),
  mosque: (
    <>
      <path d="M5.5 21v-7.4a6.5 6.5 0 0 1 13 0V21" />
      <path d="M3 21h18" />
      <path d="M10 21v-3.4a2 2 0 0 1 4 0V21" />
      <path d="M12 3.2v3.9" />
      <path d="M3.2 21v-5.4M20.8 21v-5.4" />
    </>
  ),
  sunrise: (
    <>
      <circle cx="12" cy="13.4" r="3.7" />
      <path d="M12 3.6v2.7M4.8 8.6l1.9 1.9M19.2 8.6l-1.9 1.9M2.8 18.6h18.4M6.6 21h10.8" />
    </>
  ),
  moon: (
    <>
      <path d="M20.7 13.4A8.6 8.6 0 1 1 10.8 3.5a6.7 6.7 0 0 0 9.9 9.9z" />
      <path d="M17.6 4.2v2.6M16.3 5.5h2.6" />
    </>
  ),
  pulse: (
    <>
      <path d="M2.8 12.2h3.8L9.2 5l4.2 13.6 2.6-6.4h5.2" />
    </>
  ),
  cloud: (
    <>
      <path d="M17.4 19.2a4.4 4.4 0 0 0 .4-8.8A6 6 0 0 0 6.3 11a4 4 0 0 0 .7 8.2z" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3.2 1.9 5.4 5.4 1.9-5.4 1.9L12 17.8l-1.9-5.4-5.4-1.9 5.4-1.9z" />
      <path d="M18.6 16.4l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5z" />
    </>
  ),
  bookmark: <path d="M6.2 4.2h11.6v16.6L12 16.5l-5.8 4.3z" />,
  bookmarkFill: (
    <path d="M6.2 4.2h11.6v16.6L12 16.5l-5.8 4.3z" fill="currentColor" stroke="none" />
  ),
  settings: (
    <>
      <path d="M4 7.2h6M14 7.2h6M4 16.8h4M12 16.8h8" />
      <circle cx="12" cy="7.2" r="2.2" />
      <circle cx="10" cy="16.8" r="2.2" />
    </>
  ),
  beads: (
    <>
      <circle cx="12" cy="6.6" r="2.6" />
      <path d="M5.6 21c.3-6.3 3-9.4 6.4-9.4s6.1 3.1 6.4 9.4" />
      <circle cx="5.6" cy="16.3" r="1.5" />
      <circle cx="18.4" cy="16.3" r="1.5" />
      <circle cx="12" cy="21" r="1.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  chevronLeft: <path d="m14.5 5-7 7 7 7" />,
  chevronRight: <path d="m9.5 5 7 7-7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  play: <path d="M8 5.4v13.2L19 12z" />,
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2" />,
  share: (
    <>
      <path d="M12 15.4V3.4M8 7.4l4-4 4 4" />
      <path d="M5.2 12.2V19a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2v-6.8" />
    </>
  ),
  copy: (
    <>
      <rect x="8.6" y="8.6" width="11" height="11" rx="2.4" />
      <path d="M15.4 8.6V6.4a2 2 0 0 0-2-2H6.4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2.2" />
    </>
  ),
  check: <path d="m5 12.5 4.4 4.4L19 6.8" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m8.2 12.2 2.6 2.6 5-5.4" />
    </>
  ),
  type: (
    <>
      <path d="M5 6.4V4.6h14v1.8M12 4.6v14.8M8.6 19.4h6.8" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M3.4 12h17.2" />
      <path d="M12 3.2c2.5 2.4 3.8 5.4 3.8 8.8S14.5 18.4 12 20.8c-2.5-2.4-3.8-5.4-3.8-8.8S9.5 5.6 12 3.2z" />
    </>
  ),
  bell: (
    <>
      <path d="M18.2 9.2a6.2 6.2 0 1 0-12.4 0c0 6-2.4 6.9-2.4 8.4h17.2c0-1.5-2.4-2.4-2.4-8.4z" />
      <path d="M10.2 21a2 2 0 0 0 3.6 0" />
    </>
  ),
  trash: (
    <>
      <path d="M4.4 6.8h15.2M9.4 6.8V4.6h5.2v2.2" />
      <path d="M6.4 6.8 7.5 20h9l1.1-13.2" />
      <path d="M10.4 10.6v5.8M13.6 10.6v5.8" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </>
  ),
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  monitor: (
    <>
      <rect x="3.2" y="4.4" width="17.6" height="12" rx="2" />
      <path d="M9 20h6M12 16.4V20" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 11v5.4M12 7.9v.2" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16z" />
      <path d="m14.4 5.6 4 4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.8v10.4M8 10.6l4 4 4-4" />
      <path d="M4.8 19.6h14.4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20.4 4v4.6H16" />
    </>
  ),
  flame: (
    <path d="M12 21.4c3.7 0 6.4-2.5 6.4-6 0-4.6-4.6-6-3.7-11.5-2.8.9-4.6 3.7-4.6 6 0 1.4-.9 1.9-1.8.9-.6-.6-1-1.4-1-2.3-1.4 1.9-1.9 3.7-1.9 6.9 0 3.5 2.9 6 6.6 6z" />
  ),
  heart: (
    <path d="M12 20.4 4.9 13.5a4.6 4.6 0 0 1 0-6.6 4.8 4.8 0 0 1 6.7 0l.4.4.4-.4a4.8 4.8 0 0 1 6.7 0 4.6 4.6 0 0 1 0 6.6z" />
  ),
  star: <path d="m12 3.6 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8z" />,
  shield: (
    <>
      <path d="M12 3.2 20 6v6c0 4.8-3.4 7.8-8 9-4.6-1.2-8-4.2-8-9V6z" />
      <path d="m8.6 11.9 2.4 2.4 4.4-4.6" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  dots: (
    <>
      <circle cx="6" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  volume: (
    <>
      <path d="M4.4 9.6h3l4.2-3.8v12.4L7.4 14.4h-3z" />
      <path d="M15.4 9a4.2 4.2 0 0 1 0 6M18 6.4a8 8 0 0 1 0 11.2" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 14.4v-1.8a8 8 0 0 1 16 0v1.8" />
      <rect x="3.2" y="13.6" width="4.2" height="6.8" rx="2" />
      <rect x="16.6" y="13.6" width="4.2" height="6.8" rx="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.4V12l3.2 2" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export const Icon = ({ name, size = 22, strokeWidth = 1.6, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    {icons[name]}
  </svg>
);
