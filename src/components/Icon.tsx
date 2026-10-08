import type { CSSProperties } from "react";

const paths = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V4H4v12h4" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15m-5-5 5 5-5 5" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  book: (
    <>
      <path d="M4 4h7v16H4zm9 0h7v16h-7" />
      <path d="M7 8h1m8 0h1" />
    </>
  ),
  terminal: (
    <>
      <path d="m5 7 5 5-5 5m9 0h5" />
    </>
  ),
  shortcut: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M7 9h1m3 0h1m3 0h1M7 13h1m3 0h1m3 0h1M8 16h8" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  warning: (
    <>
      <path d="m12 3 10 18H2zM12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  style,
}: {
  name: keyof typeof paths;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
