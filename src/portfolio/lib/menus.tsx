import { lazy, Suspense, type ComponentType } from "react";
import { FaRegUser, FaRegListAlt, FaEye, FaRegNewspaper } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { MdComputer, MdDashboard } from "react-icons/md";
import type { IconType } from "react-icons";
import type { SectionKey } from "@/lib/settingsDefaults";
import type { MenuData } from "./types";

/** A section component that loads the first time it is shown. */
function section(load: () => Promise<{ default: ComponentType }>): ComponentType {
  const Lazy = lazy(load);
  return function Section() {
    return (
      <Suspense fallback={null}>
        <Lazy />
      </Suspense>
    );
  };
}

const About = section(() => import("@/components/aboutPage/About"));
const Resume = section(() => import("@/components/resumePage/Resume"));
const Works = section(() => import("@/components/worksPage/Works"));
const DevBlogs = section(() => import("@/components/blogsPage/DevBlogs"));
const Contact = section(() => import("@/components/contactPage/Contact"));
const GuestBook = section(() => import("@/components/guestbookPage/GuestBook"));
const Stats = section(() => import("@/components/statisticsPage/Stats"));

/** Icon and component for each section. Labels, order and visibility come from Site settings. */
export const sectionRegistry: Record<SectionKey, { Icon: IconType; Component: ComponentType }> = {
  about: { Icon: FaRegUser, Component: About },
  resume: { Icon: FaRegListAlt, Component: Resume },
  works: { Icon: FaEye, Component: Works },
  blog: { Icon: FaRegNewspaper, Component: DevBlogs },
  stats: { Icon: MdDashboard, Component: Stats },
  contact: { Icon: FiSend, Component: Contact },
  guestbook: { Icon: MdComputer, Component: GuestBook },
};

export function buildMenus(sections: { key: SectionKey; label: string }[]): MenuData[] {
  return sections.map((s) => ({ id: s.key, label: s.label, ...sectionRegistry[s.key] }));
}
