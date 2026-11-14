import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { Shell } from "./components/Shell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PageList from "./pages/PageList";
import PageEditor from "./pages/PageEditor";
import Profiles from "./pages/Profiles";
import Team from "./pages/Team";
import Account from "./pages/Account";

function Guard({ children, admin = false }) {
  const { ready, session, profile, configured } = useAuth();
  if (!configured) return <Login />;
  if (!ready) return <p className="top">Loading…</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile) return <p className="top">This account has no profile yet.</p>;
  if (admin && profile.role !== "admin") return <Navigate to="/" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  const { session, ready, configured } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={ready && session && configured ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/pages" element={<Guard><PageList /></Guard>} />
      <Route path="/pages/:slug" element={<Guard><PageEditor /></Guard>} />
      <Route path="/team" element={<Guard><Team /></Guard>} />
      <Route path="/profiles" element={<Guard admin><Profiles /></Guard>} />
      <Route path="/profiles/:id" element={<Guard admin><Account /></Guard>} />
      <Route path="/account" element={<Guard><Account /></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
