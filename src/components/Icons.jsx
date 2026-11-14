export function Icon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  const paths = {
    code: (
      <>
        <path d="m8 8-4 4 4 4" />
        <path d="m16 8 4 4-4 4" />
        <path d="m13 6-2 12" />
      </>
    ),
    cloud: (
      <>
        <path d="M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5-1.6A3.5 3.5 0 0 0 7 18Z" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M4.9 6.5 7.8 8" />
        <path d="M16.2 16l2.9 1.5" />
        <path d="M4.9 17.5 7.8 16" />
        <path d="M16.2 8l2.9-1.5" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    nodes: (
      <>
        <circle cx="6" cy="7" r="2.2" />
        <circle cx="17" cy="6" r="2.2" />
        <circle cx="12" cy="17" r="2.2" />
        <path d="M8 8.2 15.2 7" />
        <path d="M7.2 8.8 11 15.2" />
        <path d="M15.4 8 13 15" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12S6.2 6.5 12 6.5 21.5 12 21.5 12 17.8 17.5 12 17.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ),
    people: (
      <>
        <path d="M16 21v-2a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v2" />
        <circle cx="10" cy="8" r="3" />
        <path d="M20 21v-2a3 3 0 0 0-2.2-2.9" />
        <path d="M16.5 5.2a3 3 0 0 1 0 5.6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    share: (
      <>
        <circle cx="6" cy="12" r="2.2" />
        <circle cx="17" cy="6.5" r="2.2" />
        <circle cx="17" cy="17.5" r="2.2" />
        <path d="m8 11 7-3.5" />
        <path d="m8 13 7 3.5" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m12 12 8-4.5" />
        <path d="M12 12v9" />
        <path d="m12 12-8-4.5" />
      </>
    ),
    factory: (
      <>
        <path d="M3 21V10l6 4V10l6 4V8l6 3v10" />
        <path d="M3 21h18" />
      </>
    ),
    cart: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M3 4h2l2.2 11h11.3l2-7H7" />
      </>
    ),
    heart: (
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" />
    ),
    building: (
      <>
        <path d="M4 21V5l8-2 8 2v16" />
        <path d="M9 21v-5h6v5" />
        <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01" />
      </>
    ),
    bot: (
      <>
        <rect x="5" y="8" width="14" height="10" rx="3" />
        <path d="M12 8V5" />
        <circle cx="9" cy="13" r="1" />
        <circle cx="15" cy="13" r="1" />
        <path d="M9 18v2M15 18v2" />
      </>
    ),
    bank: (
      <>
        <path d="m3 10 9-6 9 6" />
        <path d="M5 10v8M10 10v8M14 10v8M19 10v8" />
        <path d="M3 18h18" />
      </>
    ),
    pulse: (
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    ),
    shield: (
      <path d="M12 3 5 6v6c0 4.2 2.8 7.2 7 9 4.2-1.8 7-4.8 7-9V6l-7-3Z" />
    ),
    pin: (
      <>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    phone: (
      <path d="M7 3h3l1.5 4-2 1.2a12 12 0 0 0 6.3 6.3L17 12.5 21 14v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.9 5.2 2 2 0 0 1 6 3Z" />
    ),
    arrow: (
      <>
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </>
    ),
    chev: <path d="m9 6 6 6-6 6" />,
    chevL: <path d="m15 6-6 6 6 6" />,
    up: (
      <>
        <path d="M12 19V6" />
        <path d="m6 12 6-6 6 6" />
      </>
    ),
    quote: (
      <path
        fill="currentColor"
        stroke="none"
        d="M10 7H6.5A2.5 2.5 0 0 0 4 9.5V13h4v4H4.5A2.5 2.5 0 0 1 2 14.5V9.5A4.5 4.5 0 0 1 6.5 5H10v2Zm12 0h-3.5A2.5 2.5 0 0 0 16 9.5V13h4v4h-3.5a2.5 2.5 0 0 1-2.5-2.5V9.5A4.5 4.5 0 0 1 18.5 5H22v2Z"
      />
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13.5 12.5 21a2 2 0 0 1-2.8 0L3 14.3V4h10.3L20 10.7a2 2 0 0 1 0 2.8Z" />
        <circle cx="8" cy="8" r="1" fill="currentColor" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}
