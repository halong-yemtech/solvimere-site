import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  File,
  FileText,
  Globe,
  IdCard,
  Images,
  LayoutDashboard,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../auth";
import { supabase } from "../lib/supabase";
import { toast } from "./Toast";
import { Breadcrumbs, CrumbContext, Topbar, crumbsFor } from "./Topbar";

/** The menu tree: groups → items → (optional) child items loaded at run time. */
const NAV = [
  {
    id: "site",
    label: "Site",
    icon: Globe,
    items: [
      { to: "/", end: true, label: "Overview", icon: LayoutDashboard },
      { to: "/pages", label: "Pages", icon: FileText, children: "pages" },
      { to: "/team", label: "Team", icon: Users },
      { to: "/messages", label: "Messages", icon: Mail },
      { to: "/appointments", label: "Appointments", icon: CalendarDays },
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: BriefcaseBusiness,
    items: [
      { to: "/portfolio", end: true, label: "Profiles", icon: IdCard, match: /^\/portfolio(\/\d+)?$/ },
      { to: "/portfolio/media", label: "Media", icon: Images },
      { to: "/portfolio/guestbook", label: "Guest book", icon: BookOpen },
      { to: "/portfolio/settings", label: "Settings", icon: Settings2 },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: UserCog,
    items: [
      { to: "/profiles", label: "Staff", icon: ShieldCheck, admin: true },
      { to: "/account", label: "My profile", icon: CircleUserRound },
    ],
  },
];

// Per-browser UI preferences. Storage can be unavailable (private mode): fall back to defaults.
const prefs = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(`admin.${key}`);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`admin.${key}`, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};

function usePref(key, fallback) {
  const [value, setValue] = useState(() => prefs.get(key, fallback));
  useEffect(() => prefs.set(key, value), [key, value]);
  return [value, setValue];
}

/** Child items for the tree, e.g. the list of editable pages under "Pages". */
function useChildren() {
  const [pages, setPages] = useState([]);
  useEffect(() => {
    let alive = true;
    supabase
      .from("pages")
      .select("slug, title")
      .order("title")
      .then(({ data }) => alive && setPages((data || []).map((p) => ({ to: `/pages/${p.slug}`, label: p.title }))));
    return () => {
      alive = false;
    };
  }, []);
  return { pages };
}

const DESKTOP = "(min-width: 981px)";
function useDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const onChange = () => setDesktop(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return desktop;
}

export function Shell({ children }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = usePref("sidebar.collapsed", false);
  const [openGroups, setOpenGroups] = usePref("sidebar.groups", {});
  const [openNodes, setOpenNodes] = usePref("sidebar.nodes", {});
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tip, setTip] = useState(null);
  const [crumb, setCrumb] = useState(null); // last breadcrumb, set by the page (e.g. a profile's name)
  const [flyout, setFlyout] = useState(null); // { id, top, left } of the group shown next to the rail
  const closeTimer = useRef(0);
  const navigate = useNavigate();
  const childLists = useChildren();
  const desktop = useDesktop();

  // A tooltip or flyout must not outlive the rail it belongs to.
  useEffect(() => {
    setTip(null);
    setFlyout(null);
  }, [collapsed, desktop]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Flyout: opens on hover/focus of a group icon, stays open while the pointer moves into it.
  function openFlyout(id, target) {
    clearTimeout(closeTimer.current);
    const r = target.getBoundingClientRect();
    setTip(null);
    setFlyout({ id, top: r.top, left: r.right + 8 });
  }
  function closeFlyoutSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFlyout(null), 160);
  }
  useEffect(() => {
    if (!flyout) return undefined;
    const onKey = (event) => event.key === "Escape" && setFlyout(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flyout]);

  // Ctrl/⌘ + B toggles the sidebar.
  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCollapsed]);

  // Close the mobile menu and any tooltip after navigating.
  useEffect(() => {
    setMobileOpen(false);
    setTip(null);
    setFlyout(null);
  }, [location.pathname]);

  const isAdmin = profile?.role === "admin";
  const visibleGroups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.admin || isAdmin),
  })).filter((group) => group.items.length);
  const inSection = (item) =>
    item.match
      ? item.match.test(location.pathname)
      : item.end
        ? location.pathname === item.to
        : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

  // In the icon rail (desktop only), labels appear as a floating tooltip next to the hovered item.
  const rail = collapsed && desktop;
  const tipProps = (label) =>
    rail
      ? {
          onMouseEnter: (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setTip({ label, top: r.top + r.height / 2, left: r.right + 8 });
          },
          onMouseLeave: () => setTip(null),
          onFocus: (e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setTip({ label, top: r.top + r.height / 2, left: r.right + 8 });
          },
          onBlur: () => setTip(null),
          "aria-label": label,
        }
      : {};

  async function onSignOut() {
    try {
      await signOut();
      toast.info("Signed out.");
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <div className={`shell${collapsed ? " is-collapsed" : ""}`}>
      <aside className={mobileOpen ? "is-open" : ""}>
        <div className="aside-head">
          <Link className="brand" to="/" {...tipProps("Overview")}>
            <img className="brand-full" src="/images/logo-white.png" alt="Solvimere" />
            <img className="brand-mark" src="/favicon.png" alt="Solvimere" />
            <span>Admin</span>
          </Link>
          <button
            type="button"
            className="aside-toggle is-desktop"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={`${collapsed ? "Expand" : "Collapse"} sidebar (Ctrl+B)`}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </button>
          <button
            type="button"
            className="aside-toggle is-mobile"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {rail ? (
          <nav className="rail" aria-label="Admin">
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;
              const active = group.items.some(inSection);
              return (
                <button
                  key={group.id}
                  type="button"
                  className={`rail-group${active ? " is-active" : ""}${flyout?.id === group.id ? " is-hover" : ""}`}
                  aria-label={group.label}
                  aria-haspopup="menu"
                  aria-expanded={flyout?.id === group.id}
                  onClick={() => navigate(group.items[0].to)}
                  onMouseEnter={(e) => openFlyout(group.id, e.currentTarget)}
                  onMouseLeave={closeFlyoutSoon}
                  onFocus={(e) => openFlyout(group.id, e.currentTarget)}
                  onBlur={closeFlyoutSoon}
                >
                  <GroupIcon />
                </button>
              );
            })}
          </nav>
        ) : null}
        <nav className="tree" aria-label="Admin" hidden={rail}>
          {NAV.map((group) => {
            const items = group.items.filter((item) => !item.admin || isAdmin);
            if (!items.length) return null;
            const open = rail || openGroups[group.id] !== false;
            const GroupIcon = group.icon;
            const hasActive = items.some(inSection);
            return (
              <section key={group.id} className={`tree-group${open ? " is-open" : ""}`}>
                <button
                  type="button"
                  className={`tree-group-head${hasActive ? " has-active" : ""}`}
                  aria-expanded={open}
                  onClick={() => setOpenGroups((g) => ({ ...g, [group.id]: !open }))}
                >
                  <GroupIcon className="tree-icon" />
                  <span>{group.label}</span>
                  <ChevronRight className="tree-chevron" />
                </button>
                {open ? (
                  <ul role="list">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const kids = item.children ? childLists[item.children] || [] : [];
                      const nodeOpen = !rail && kids.length > 0 && (openNodes[item.to] ?? inSection(item));
                      return (
                        <li key={item.to} className={nodeOpen ? "is-open" : ""}>
                          <div className="tree-row">
                            <NavLink
                              to={item.to}
                              end={item.end}
                              className={({ isActive }) =>
                                `tree-link${isActive || item.match?.test(location.pathname) ? " active" : ""}`
                              }
                              {...tipProps(item.label)}
                            >
                              <Icon className="tree-icon" />
                              <span>{item.label}</span>
                            </NavLink>
                            {kids.length > 0 && !rail ? (
                              <button
                                type="button"
                                className="tree-twist"
                                aria-expanded={nodeOpen}
                                aria-label={`${nodeOpen ? "Collapse" : "Expand"} ${item.label}`}
                                onClick={() => setOpenNodes((n) => ({ ...n, [item.to]: !nodeOpen }))}
                              >
                                <ChevronRight className="tree-chevron" />
                              </button>
                            ) : null}
                          </div>
                          {nodeOpen ? (
                            <ul role="list" className="tree-children">
                              {kids.map((kid) => (
                                <li key={kid.to}>
                                  <NavLink to={kid.to} className="tree-link">
                                    <File className="tree-icon" />
                                    <span>{kid.label}</span>
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </nav>
      </aside>
      {rail && flyout
        ? (() => {
            const group = visibleGroups.find((g) => g.id === flyout.id);
            if (!group) return null;
            const GroupIcon = group.icon;
            return (
              <div
                className="rail-flyout"
                role="menu"
                aria-label={group.label}
                style={{ top: flyout.top, left: flyout.left }}
                onMouseEnter={() => clearTimeout(closeTimer.current)}
                onMouseLeave={closeFlyoutSoon}
              >
                <p className="rail-flyout-head">
                  <GroupIcon />
                  {group.label}
                </p>
                <ul role="list">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          role="menuitem"
                          className="tree-link"
                          onBlur={closeFlyoutSoon}
                          onFocus={() => clearTimeout(closeTimer.current)}
                        >
                          <Icon className="tree-icon" />
                          <span>{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })()
        : null}
      {tip ? (
        <div className="nav-tip" role="tooltip" style={{ top: tip.top, left: tip.left }}>
          {tip.label}
        </div>
      ) : null}
      <div className="canvas">
        <Topbar profile={profile} onSignOut={onSignOut}>
          <Breadcrumbs crumbs={crumbsFor(location.pathname, visibleGroups, childLists, crumb)} />
        </Topbar>
        <CrumbContext.Provider value={setCrumb}>
          <main className="page">{children}</main>
        </CrumbContext.Provider>
      </div>
    </div>
  );
}
