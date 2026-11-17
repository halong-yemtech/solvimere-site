import dynamic from "next/dynamic";
import { FaRegUser, FaRegListAlt, FaEye, FaRegNewspaper } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { MdComputer, MdDashboard } from "react-icons/md";
import type { IconType } from "react-icons";
import type { SectionKey } from "@/lib/settingsDefaults";
import type { MenuData } from "./types";

const About = dynamic(() => import("@/components/aboutPage/About"));
const Resume = dynamic(() => import("@/components/resumePage/Resume"));
const Works = dynamic(() => import("@/components/worksPage/Works"));
const DevBlogs = dynamic(() => import("@/components/blogsPage/DevBlogs"));
const Contact = dynamic(() => import("@/components/contactPage/Contact"));
const GuestBook = dynamic(() => import("@/components/guestbookPage/GuestBook"));
const Stats = dynamic(() => import("@/components/statisticsPage/Stats"));

/** Icon and component for each section. Labels, order and visibility come from Site settings. */
export const sectionRegistry: Record<SectionKey, { Icon: IconType; Component: React.ComponentType }> = {
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
