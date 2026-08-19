type Props = { className?: string; size?: number };

const s = (p: Props) => ({
  width: p.size ?? 24,
  height: p.size ?? 24,
  className: p.className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconBars = (p: Props) => (
  <svg {...s(p)}><path d="M3 7h18M3 12h18M3 17h18" /></svg>
);
export const IconSearch = (p: Props) => (
  <svg {...s(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconUser = (p: Props) => (
  <svg {...s(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
);
export const IconBag = (p: Props) => (
  <svg {...s(p)}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
export const IconTimes = (p: Props) => (
  <svg {...s(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconMinus = (p: Props) => (
  <svg {...s(p)}><path d="M5 12h14" /></svg>
);
export const IconPlus = (p: Props) => (
  <svg {...s(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconArrowLeft = (p: Props) => (
  <svg {...s(p)}><path d="M20 12H4M9 7l-5 5 5 5" /></svg>
);
export const IconArrowRight = (p: Props) => (
  <svg {...s(p)}><path d="M4 12h16M15 7l5 5-5 5" /></svg>
);
export const IconChevronDown = (p: Props) => (
  <svg {...s(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconChevronUp = (p: Props) => (
  <svg {...s(p)}><path d="m6 15 6-6 6 6" /></svg>
);
export const IconChevronLeft = (p: Props) => (
  <svg {...s(p)}><path d="m15 6-6 6 6 6" /></svg>
);
export const IconCheck = (p: Props) => (
  <svg {...s(p)}><path d="m5 13 4 4 10-11" /></svg>
);
export const IconTruck = (p: Props) => (
  <svg {...s(p)}>
    <path d="M2 7h11v10H2zM13 10h4l3 3v4h-7z" />
    <circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
  </svg>
);
export const IconPin = (p: Props) => (
  <svg {...s(p)}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
);
export const IconMail = (p: Props) => (
  <svg {...s(p)}><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 7 9 6 9-6" /></svg>
);
export const IconChat = (p: Props) => (
  <svg {...s(p)}><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z" /></svg>
);
export const IconCard = (p: Props) => (
  <svg {...s(p)}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
);
export const IconInstagram = (p: Props) => (
  <svg {...s(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const IconWhatsApp = (p: Props) => (
  <svg width={p.size ?? 28} height={p.size ?? 28} viewBox="0 0 24 24" fill="currentColor" className={p.className} aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.75-.71 2-1.4.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.43-4.4-1.18l-.32-.19-3 .78.8-2.92-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
  </svg>
);
