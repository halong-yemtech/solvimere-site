import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { currentMenu, currentWork, useReactiveVar } from "@/lib/state";
import { useMenus } from "@/lib/useMenus";
import type { SectionKey } from "@/lib/settingsDefaults";
import ProfileCard from "@/components/ProfileCard";
import WorkLb from "@/components/worksPage/WorkLb";
import { useSite } from "./SiteProvider";

/** A team member's portfolio: top bar, profile card, section tabs and the open section. */
export default function HomePage() {
  const { menus, activeKey } = useMenus();
  const { profile } = useSite();
  const workId = useReactiveVar(currentWork);
  const contentTop = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  // Open the section named in the address (#resume), and follow back/forward.
  useEffect(() => {
    const fromHash = () => {
      const key = decodeURIComponent(window.location.hash.slice(1));
      if (menus.some((m) => m.id === key)) currentMenu(key as SectionKey);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [menus]);

  // Keep the active tab visible in the scrolling tab bar on phones.
  useEffect(() => {
    if (activeKey) tabRefs.current.get(activeKey)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeKey]);

  function open(key: SectionKey) {
    if (key !== activeKey) {
      currentMenu(key);
      window.history.replaceState(null, "", `#${key}`);
    }
    // If the reader has scrolled down, bring the new section's start into view.
    const top = contentTop.current;
    if (top && top.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: window.scrollY + top.getBoundingClientRect().top - 8, behavior: "smooth" });
    }
  }

  const year = new Date().getFullYear();

  return (
    <div className="pb-16">
      <div className="pf-glow" aria-hidden />

      <div className="pf-wrap">
        <header className="pf-topbar">
          <Link to="/" className="pf-topbar-logo shrink-0" aria-label="Solvimere home">
            <img src="/images/logo-white.png" alt="Solvimere" />
          </Link>
          <Link to="/team" className="pf-btn pf-btn-ghost pf-btn-sm !pl-2 !pr-5 !gap-3">
            <span className="pf-btn-ico">
              <FiArrowLeft aria-hidden />
            </span>
            <span>
              All <span className="hidden sm:inline">team members</span>
              <span className="sm:hidden">team</span>
            </span>
          </Link>
        </header>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[36rem_minmax(0,1fr)] lg:gap-12 items-start">
          <aside className="min-w-0 lg:sticky lg:top-8 [@media(max-height:760px)]:lg:static">
            <ProfileCard />
          </aside>

          <div className="min-w-0">
            <div ref={contentTop} aria-hidden />
            {menus.length > 1 && (
              <nav className="pf-nav" aria-label={`${profile.name}'s portfolio`}>
                <div className="pf-nav-list">
                  {menus.map((m) => (
                    <button
                      key={m.id}
                      ref={(el) => {
                        if (el) tabRefs.current.set(m.id, el);
                        else tabRefs.current.delete(m.id);
                      }}
                      type="button"
                      className="pf-tab"
                      aria-current={activeKey === m.id ? "page" : undefined}
                      onClick={() => open(m.id)}
                    >
                      <m.Icon aria-hidden />
                      {m.label}
                    </button>
                  ))}
                </div>
              </nav>
            )}

            <main className="pt-4 lg:pt-2 min-h-[60vh]">
              <AnimatePresence mode="wait" initial={false}>
                {menus.map(
                  (m) =>
                    activeKey === m.id && (
                      <motion.section
                        key={m.id}
                        aria-label={m.label}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        <m.Component />
                      </motion.section>
                    ),
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-8 text-[1.3rem] text-gray-500">
          <p>{profile.copyright || `© ${year} ${profile.name}`}</p>
          <p>
            Part of the{" "}
            <Link to="/team" className="text-gray-300 hover:text-white">
              Solvimere team
            </Link>
          </p>
        </footer>
      </div>

      <AnimatePresence>{workId !== null && <WorkLb workId={workId} reactiveVar={currentWork} />}</AnimatePresence>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#16161b",
            color: "#f4f4f5",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "14px",
            fontSize: "14px",
            padding: "10px 14px",
          },
        }}
      />
    </div>
  );
}
