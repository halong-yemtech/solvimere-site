import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { Shell } from "./components/Shell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PageList from "./pages/PageList";
import PageEditor from "./pages/PageEditor";
import Profiles from "./pages/Profiles";
import Team from "./pages/Team";
import Appointments from "./pages/Appointments";
import Messages from "./pages/Messages";
import Portfolios from "./pages/Portfolios";
import PortfolioWorkspace from "./pages/PortfolioWorkspace";
import PortfolioMedia from "./pages/PortfolioMedia";
import PortfolioGuestbook from "./pages/PortfolioGuestbook";
import PortfolioSettings from "./pages/PortfolioSettings";
import PortfolioViews from "./pages/PortfolioViews";
import Account from "./pages/Account";
import { Spinner } from "./components/Spinner";

function Guard({ children, admin = false }) {
  const { ready, session, profile, configured } = useAuth();
  if (!configured) return <Login />;
  if (!ready) return <Spinner label="Loading Solvimere admin…" />;
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
      <Route
        path="/"
        element={
          <Guard>
            <Dashboard />
          </Guard>
        }
      />
      <Route
        path="/pages"
        element={
          <Guard>
            <PageList />
          </Guard>
        }
      />
      <Route
        path="/pages/:slug"
        element={
          <Guard>
            <PageEditor />
          </Guard>
        }
      />
      <Route
        path="/team"
        element={
          <Guard>
            <Team />
          </Guard>
        }
      />
      <Route
        path="/appointments"
        element={
          <Guard>
            <Appointments />
          </Guard>
        }
      />
      <Route
        path="/messages"
        element={
          <Guard>
            <Messages />
          </Guard>
        }
      />
      <Route
        path="/portfolio"
        element={
          <Guard>
            <Portfolios />
          </Guard>
        }
      />
      <Route
        path="/portfolio/media"
        element={
          <Guard>
            <PortfolioMedia />
          </Guard>
        }
      />
      <Route
        path="/portfolio/views"
        element={
          <Guard>
            <PortfolioViews />
          </Guard>
        }
      />
      <Route
        path="/portfolio/guestbook"
        element={
          <Guard>
            <PortfolioGuestbook />
          </Guard>
        }
      />
      <Route
        path="/portfolio/settings"
        element={
          <Guard>
            <PortfolioSettings />
          </Guard>
        }
      />
      <Route
        path="/portfolio/:id"
        element={
          <Guard>
            <PortfolioWorkspace />
          </Guard>
        }
      />
      <Route
        path="/profiles"
        element={
          <Guard admin>
            <Profiles />
          </Guard>
        }
      />
      <Route
        path="/profiles/:id"
        element={
          <Guard admin>
            <Account />
          </Guard>
        }
      />
      <Route
        path="/account"
        element={
          <Guard>
            <Account />
          </Guard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
