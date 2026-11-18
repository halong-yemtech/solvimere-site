import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "./Avatar";
import { ChevronDown, ChevronRight, CircleUserRound, House, LogOut } from "lucide-react";

/* ---- Breadcrumb ---- */

/** Lets a page name the last breadcrumb, e.g. the profile being edited. */
export const CrumbContext = createContext(() => {});

export function useCrumb(label) {
  const setCrumb = useContext(CrumbContext);
  useEffect(() => {
    setCrumb(label || null);
    return () => setCrumb(null);
  }, [label, setCrumb]);
}

/** Where the current path sits in the menu: group → item → (child or the page's own crumb). */
export function crumbsFor(pathname, groups, childLists, extra) {
  let best = null;
  groups.forEach((group) =>
    group.items.forEach((item) => {
      const hit = item.match
        ? item.match.test(pathname)
        : item.end
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(`${item.to}/`);
      if (hit && (!best || item.to.length > best.item.to.length)) best = { group, item };
    }),
  );
  if (!best) return [];
  const { group, item } = best;
  const crumbs = [
    { label: group.label, to: group.items[0].to, icon: group.icon },
    { label: item.label, to: item.to },
  ];
  const kid = item.children ? (childLists[item.children] || []).find((k) => k.to === pathname) : null;
  if (kid) crumbs.push({ label: kid.label, to: kid.to });
  else if (extra && pathname !== item.to) crumbs.push({ label: extra, to: pathname });
  return crumbs;
}

export function Breadcrumbs({ crumbs }) {
  if (!crumbs.length) return null;
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/" aria-label="Overview" title="Overview">
            <House />
          </Link>
        </li>
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          const Icon = crumb.icon;
          return (
            <li key={`${crumb.to}-${i}`}>
              <ChevronRight className="crumb-sep" aria-hidden="true" />
              {last ? (
                <span aria-current="page">
                  {Icon ? <Icon /> : null}
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to}>
                  {Icon ? <Icon /> : null}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ---- Header: breadcrumb on the left, user menu at the far right ---- */

function UserAvatar({ profile, size = 32 }) {
  return <Avatar src={profile?.avatar_url} name={profile?.full_name || profile?.email} size={size} />;
}

function UserMenu({ profile, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuId = useId();
  const location = useLocation();
  const name = profile?.full_name || profile?.email || "Account";

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector(".user-button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // Move focus into the menu for keyboard users.
    ref.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className={`user-button${open ? " is-open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <UserAvatar profile={profile} size={28} />
        <span className="user-text">
          <strong>{name}</strong>
          <span>{profile?.role}</span>
        </span>
        <ChevronDown className="user-chevron" />
      </button>
      {open ? (
        <div className="user-dropdown" role="menu" id={menuId} aria-label="Account">
          <div className="user-dropdown-head">
            <UserAvatar profile={profile} />
            <span>
              <strong>{name}</strong>
              <span>{profile?.email}</span>
            </span>
          </div>
          <Link role="menuitem" to="/account" onClick={() => setOpen(false)}>
            <CircleUserRound />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            <LogOut />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** One line: the breadcrumb (children) on the left, the user menu at the far right. */
export function Topbar({ profile, onSignOut, children }) {
  return (
    <header className="topbar">
      <div className="topbar-left">{children}</div>
      <UserMenu profile={profile} onSignOut={onSignOut} />
    </header>
  );
}
