"use client";

import { useMemo } from "react";
import { useReactiveVar } from "@/lib/state";
import Title from "../Title";
import Work from "./Work";
import { currentWorkTab } from "@/lib/state";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "../SiteProvider";
import { SectionTools } from "../edit/Editable";

export default function Works() {
  const currentTab = useReactiveVar(currentWorkTab);
  const { works } = useSite();

  const filteredWorks = useMemo(() => {
    if (currentTab === "All") return works;
    return works.filter((w) => w.categories.includes(currentTab));
  }, [currentTab, works]);

  return (
    <div
      id="scrollableDiv"
      className="lg:h-full h-[95rem] overflow-y-scroll myScroll"
    >
      <Title name="works" currentMenu={currentTab} actions={
        <SectionTools slug="works" title="work" items={works.map((w) => ({ id: w.id, label: w.title }))} />
      } />

      <motion.ul className="grid grid-cols-1 sm:grid-cols-2 relative vCustomLine before:hidden sm:before:block before:left-1/2 before:-translate-x-1/2 pt-12">
        <AnimatePresence>
          {filteredWorks.map((w, idx) => (
            <Work
              key={w.id}
              title={w.title}
              image={w.images[0]}
              projectId={w.id}
              priority={idx === 0}
            />
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
