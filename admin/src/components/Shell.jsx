import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth";

export function Shell({ children }) {
  const { profile, signOut } = useAuth();
  return (
    <div className="shell">
      <aside>
        <Link className="brand" to="/">
          <img src="/images/logo-white.png" alt="Solvimere" />
          <span>Admin</span>
        </Link>
        <nav>
          <p className="nav-label">Site</p>
          <NavLink to="/" end>
            Overview
          </NavLink>
          <NavLink to="/pages">Pages</NavLink>
          <NavLink to="/team">Team</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/appointments">Appointments</NavLink>
          <p className="nav-label">Portfolio</p>
          <NavLink to="/portfolio" end>
            Profiles
          </NavLink>
          <NavLink to="/portfolio/media">Media</NavLink>
          <NavLink to="/portfolio/guestbook">Guest book</NavLink>
          <NavLink to="/portfolio/settings">Settings</NavLink>
          <p className="nav-label">Account</p>
          {profile?.role === "admin" ? <NavLink to="/profiles">Staff</NavLink> : null}
          <NavLink to="/account">My profile</NavLink>
        </nav>
        <div className="aside-foot">
          <div className="who">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" />
            ) : (
              <span className="ph">{(profile?.full_name || profile?.email || "?").slice(0, 1)}</span>
            )}
            <div>
              <strong>{profile?.full_name || profile?.email}</strong>
              <span>{profile?.role}</span>
            </div>
          </div>
          <button className="ghost" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="canvas">{children}</div>
    </div>
  );
}
