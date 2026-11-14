import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteAuth } from "../auth/SiteAuth";
import { nav } from "../data";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Icon } from "./Icons";

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function Button({ href = "#contact", children, variant = "primary", className = "", type }) {
  const classNames = `btn btn-${variant} ${className}`.trim();
  const inner = (
    <>
      <span>{children}</span>
      <span className="btn-ico">
        <Arrow />
      </span>
    </>
  );
  if (type === "submit") {
    return (
      <button type="submit" className={classNames}>
        {inner}
      </button>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={classNames}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={classNames}>
      {inner}
    </a>
  );
}

export function Eyebrow({ children }) {
  return (
    <p className="eyebrow">
      <span>+</span>
      {children}
    </p>
  );
}

export function Orbit({ text, href = "#services" }) {
  const id = useId().replace(/:/g, "");
  return (
    <a className="orbit" href={href} aria-label={text}>
      <svg viewBox="0 0 100 100" className="orbit-ring">
        <defs>
          <path id={id} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="orbit-core">
        <Arrow />
      </span>
    </a>
  );
}

export function Header({ active }) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const { user } = useSiteAuth();
  const settings = usePageContent("settings", pageDefaults.settings);
  const accountLabel = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <div className="nav-progress" style={{ transform: `scaleX(${progress})` }} />
        <Link to="/#home" className="brand" aria-label="Solvimere home">
          <img src={settings.logo || "/images/logo-white.png"} alt="Solvimere" />
        </Link>
        <nav className="desk-nav" aria-label="Primary">
          {nav.map((item) => (
            <NavAnchor key={item.id} item={item} active={active} />
          ))}
        </nav>
        <div className="nav-actions">
          <Link to={user ? "/account" : "/login"} className="nav-signin">
            {user ? accountLabel : "Sign in"}
          </Link>
          <Button href="/#contact" className="nav-cta">
            Start a project
          </Button>
        </div>
        <button
          className="menu-btn"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open && (
        <div className="mobile-panel">
          {nav.map((item) => (
            <NavAnchor key={item.id} item={item} active={active} onClick={() => setOpen(false)} />
          ))}
          <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)}>
            {user ? accountLabel : "Sign in"}
          </Link>
          <Link to="/register" onClick={() => setOpen(false)}>Create account</Link>
          <Button href="/#contact">Start a project</Button>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const settings = usePageContent("settings", pageDefaults.settings);
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <img className="footer-logo" src={settings.logo || "/images/logo-white.png"} alt="Solvimere" />
          <p>{settings.tagline}</p>
          <ul className="footer-contact">
            <li>
              <Icon name="mail" />
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </li>
            {settings.phone ? (
              <li>
                <Icon name="phone" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{settings.phone}</a>
              </li>
            ) : null}
            {settings.address ? (
              <li>
                <Icon name="pin" />
                <span>{settings.address}</span>
              </li>
            ) : null}
          </ul>
        </div>
        <div>
          <h3>Quick links</h3>
          <ul>
            {nav.map((item) => (
              <li key={item.id}>
                <NavAnchor item={item} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Solutions</h3>
          <ul>
            <li><Link to="/solutions">AI business automation</Link></li>
            <li><Link to="/solutions">Customer intelligence</Link></li>
            <li><Link to="/solutions">Data & analytics</Link></li>
            <li><Link to="/products">Digital platforms</Link></li>
            <li><Link to="/industries">Industries</Link></li>
          </ul>
        </div>
        <div>
          <h3>Contact info</h3>
          <ul className="contact-list">
            <li>
              <Icon name="pin" />
              <a href="https://solvimere.com">solvimere.com</a>
            </li>
            <li>
              <Icon name="mail" />
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bar">
        <p>© {new Date().getFullYear()} Solvimere. All rights reserved.</p>
        <div>
          <Link to="/terms">Terms & Conditions</Link>
          <span>Modern software solutions</span>
        </div>
      </div>
      <p className="wordmark" aria-hidden="true">
        SOLVIMERE
      </p>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      className="to-top"
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Icon name="up" />
    </button>
  );
}

function NavAnchor({ item, active = "", onClick }) {
  const location = useLocation();
  const href = item.href || `/#${item.id}`;
  const on = item.href ? location.pathname === item.href : location.pathname === "/" && active === item.id;
  if (href.startsWith("/")) {
    return (
      <Link to={href} className={on ? "is-active" : ""} onClick={onClick}>
        {item.label}
      </Link>
    );
  }
  return (
    <a href={href} className={on ? "is-active" : ""} onClick={onClick}>
      {item.label}
    </a>
  );
}

export function useActiveSection() {
  const [active, setActive] = useState("home");
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/") return undefined;
    const ids = ["home", "about", "services", "process", "work", "testimonials", "insights", "contact"];
    const map = {
      home: "home",
      about: "about",
      services: "services",
      process: "services",
      work: "work",
      testimonials: "work",
      insights: "insights",
      contact: "contact",
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(map[visible.target.id] || visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.4] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [location.pathname]);
  return active;
}
