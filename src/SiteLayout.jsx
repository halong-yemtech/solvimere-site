import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Assistant } from "./components/Assistant";
import { CookieConsent } from "./components/CookieConsent";
import { BackToTop, Footer, Header, useActiveSection } from "./components/Chrome";
import Home from "./pages/Home";
import { useContentReady } from "./cms/Content";

// The home page ships with the app; other pages load when first visited.
const Team = lazy(() => import("./pages/Team"));
const Terms = lazy(() => import("./pages/Terms"));
const Products = lazy(() => import("./pages/Products"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Industries = lazy(() => import("./pages/Industries"));
const Cases = lazy(() => import("./pages/Cases"));
const Resources = lazy(() => import("./pages/Resources"));
const About = lazy(() => import("./pages/About"));

/** The marketing site: header, footer, contact widget and its pages. */
export default function SiteLayout() {
  const location = useLocation();
  const active = useActiveSection();
  const ready = useContentReady();

  useEffect(() => {
    if (!ready) return undefined; // the page isn't rendered yet
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }
    const id = location.hash.slice(1);
    // Wait for the target (pages load on demand), at most a few seconds.
    const giveUpAt = performance.now() + 4000;
    let raf = 0;
    let observer;
    let settle;
    const stop = () => {
      observer?.disconnect();
      window.clearTimeout(settle);
      ["wheel", "touchstart", "keydown"].forEach((type) => window.removeEventListener(type, stop));
    };
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Content above the target can still change height after we start scrolling
        // (e.g. images loading and taking their height), which would leave us past the target. Re-align while the page settles, until the
        // visitor scrolls themselves.
        let first = true; // ResizeObserver reports once immediately; that isn't a change.
        observer = new ResizeObserver(() => {
          if (first) {
            first = false;
            return;
          }
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        observer.observe(document.body);
        ["wheel", "touchstart", "keydown"].forEach((type) => window.addEventListener(type, stop, { passive: true }));
        settle = window.setTimeout(stop, 2500);
        return;
      }
      if (performance.now() < giveUpAt) raf = requestAnimationFrame(tryScroll);
    };
    raf = requestAnimationFrame(tryScroll);
    return () => {
      cancelAnimationFrame(raf);
      stop();
    };
  }, [location.pathname, location.hash, ready]);

  // Nothing renders until the content is loaded, so no built-in copy flashes first.
  if (!ready) return <SiteLoader />;

  return (
    <>
      <Header active={location.pathname === "/team" ? "team" : location.pathname === "/" ? active : ""} />
      <Suspense fallback={<main className="page-loading" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/case-studies" element={<Cases />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/terms" element={<Terms />} />
          {/* Visitor accounts were removed; old links go home. */}
          {["/login", "/register", "/account"].map((path) => (
            <Route key={path} path={path} element={<Navigate to="/" replace />} />
          ))}
        </Routes>
      </Suspense>
      <Footer />
      <CookieConsent />
      <Assistant />
      <BackToTop />
    </>
  );
}

function SiteLoader() {
  return (
    <main className="site-loader" role="status" aria-live="polite">
      <img src="/favicon.png" alt="" width="56" height="56" />
      <span className="sr-only">Loading Solvimere…</span>
    </main>
  );
}
