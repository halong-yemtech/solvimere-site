import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight, FiGrid, FiImage } from "react-icons/fi";
import Img from "@/components/Img";
import { currentWork, currentWorkTab, useReactiveVar } from "@/lib/state";
import { track } from "@/lib/tracker";
import { useSite } from "../SiteProvider";

/** Works: filter by category, open a project for details. */
export default function Works() {
  const currentTab = useReactiveVar(currentWorkTab);
  const { works, workCategories } = useSite();
  // Only offer categories that have at least one project.
  const tabs = ["All", ...workCategories.filter((c) => works.some((w) => w.categories.includes(c)))];
  const tab = tabs.includes(currentTab) ? currentTab : "All";

  const filtered = useMemo(
    () => (tab === "All" ? works : works.filter((w) => w.categories.includes(tab))),
    [tab, works],
  );

  return (
    <section>
      {tabs.length > 2 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              className="pf-filter"
              aria-pressed={tab === t}
              data-track-ignore
              onClick={() => {
                currentWorkTab(t);
                track("work_filter", { label: t });
              }}
            >
              {t}
              <span className="ml-1.5 text-gray-500">
                {t === "All" ? works.length : works.filter((w) => w.categories.includes(t)).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {works.length === 0 ? (
        <div className="pf-card p-12 text-center text-[1.6rem] text-gray-400">
          <FiGrid className="mx-auto mb-4 text-[3rem] text-gray-500" aria-hidden />
          Projects will be shown here soon.
        </div>
      ) : (
        <motion.ul layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((w, idx) => {
              const image = w.images[0];
              return (
                <motion.li
                  layout
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    data-track-ignore
                    onClick={() => currentWork(w.id)}
                    className="group pf-card pf-card-hover block w-full overflow-hidden text-left"
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden bg-gray-800">
                      {image ? (
                        <Img
                          src={image.url}
                          alt={image.alt || w.title}
                          fill
                          priority={idx < 2}
                          style={{ objectFit: "cover", objectPosition: "top" }}
                          className="transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <FiImage className="absolute inset-0 m-auto text-[4rem] text-gray-600" aria-hidden />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="absolute right-4 top-4 grid h-[4rem] w-[4rem] translate-y-1 place-items-center rounded-full bg-white text-[1.8rem] text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <FiArrowUpRight aria-hidden />
                      </span>
                    </span>
                    <span className="block p-6">
                      {w.categories.length > 0 && (
                        <span className="mb-2 block text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-main-orange">
                          {w.categories.join(" · ")}
                        </span>
                      )}
                      <span className="block text-[1.7rem] font-semibold leading-snug text-white">{w.title}</span>
                      {w.techStack.length > 0 && (
                        <span className="mt-3 flex flex-wrap gap-1.5">
                          {w.techStack.slice(0, 4).map((t) => (
                            <span key={t} className="pf-chip !px-2.5 !py-0.5 !text-[1.15rem]">
                              {t}
                            </span>
                          ))}
                          {w.techStack.length > 4 && (
                            <span className="pf-chip !px-2.5 !py-0.5 !text-[1.15rem] text-gray-500">
                              +{w.techStack.length - 4}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
