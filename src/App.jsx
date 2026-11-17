import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Assistant } from "./components/Assistant";
import { CookieConsent } from "./components/CookieConsent";
import { BackToTop, Footer, Header, useActiveSection } from "./components/Chrome";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Terms from "./pages/Terms";
import Products from "./pages/Products";
import Solutions from "./pages/Solutions";
import Industries from "./pages/Industries";
import Cases from "./pages/Cases";
import Resources from "./pages/Resources";
import About from "./pages/About";

export default function App() {
  const location = useLocation();
  const active = useActiveSection();

  useEffect(() => {
    if (!location.hash || /^(access_token|error|error_description|provider_token)=/.test(location.hash.slice(1))) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }
    const id = location.hash.slice(1);
    let frames = 0;
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
        // (e.g. the team grid swapping its placeholder roster for the real one), which
        // would leave us past the target. Re-align while the page settles, until the
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
      if (frames++ < 30) raf = requestAnimationFrame(tryScroll);
    };
    raf = requestAnimationFrame(tryScroll);
    return () => {
      cancelAnimationFrame(raf);
      stop();
    };
  }, [location.pathname, location.hash]);

  return (
    <>
      <Header active={location.pathname === "/team" ? "team" : location.pathname === "/" ? active : ""} />
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
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <Footer />
      <CookieConsent />
      <Assistant />
      <BackToTop />
    </>
  );
}
