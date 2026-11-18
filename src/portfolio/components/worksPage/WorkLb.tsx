import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { BsGithub } from "react-icons/bs";
import Img from "@/components/Img";
import type { ReactiveVar } from "@/lib/state";
import { track } from "@/lib/tracker";
import MyInfo from "../MyInfo";
import { useSite } from "../SiteProvider";

interface Props {
  workId: number;
  reactiveVar: ReactiveVar<number | null>;
}

/** A project's details in a dialog: images, facts, description, stack and links. */
export default function WorkLb({ workId, reactiveVar }: Props) {
  const { works } = useSite();
  const work = works.find((w) => w.id === workId);
  const [shown, setShown] = useState(0);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = () => reactiveVar(null);

  // Esc closes, the page behind doesn't scroll, focus starts on Close and returns afterwards.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") reactiveVar(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      before?.focus?.();
    };
  }, [reactiveVar]);

  // How long each project stays open.
  const title = work?.title;
  useEffect(() => {
    if (!title) return undefined;
    const opened = Date.now();
    track("work_open", { label: title, section: "works" });
    return () =>
      track("work_close", { label: title, section: "works", value: Math.round((Date.now() - opened) / 1000) });
  }, [title]);

  if (!work) return null;
  const images = work.images;
  const image = images[shown] ?? images[0];
  const show = (index: number) => {
    setShown(index);
    track("work_image", { label: work.title, section: "works", value: index + 1 });
  };
  const step = (d: number) => show((shown + d + images.length) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-8"
    >
      <motion.article
        data-track-area="Project details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-title"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="pf-card relative w-[96rem] max-w-full max-h-none sm:max-h-[92vh] overflow-y-auto noScroll !bg-[#0f0f13]"
      >
        <button
          ref={closeBtn}
          data-track-ignore
          type="button"
          onClick={close}
          aria-label="Close"
          className="pf-icon-btn absolute right-4 top-4 z-20 !rounded-full !bg-black/60 backdrop-blur"
        >
          <FiX aria-hidden />
        </button>

        {image && (
          <div className="relative aspect-[16/9] bg-gray-900">
            <Img
              src={image.url}
              alt={image.alt || work.title}
              fill
              priority
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="pf-icon-btn absolute left-4 top-1/2 -translate-y-1/2 !rounded-full !bg-black/60"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  data-track-ignore
                >
                  <FiChevronLeft aria-hidden />
                </button>
                <button
                  type="button"
                  className="pf-icon-btn absolute right-4 top-1/2 -translate-y-1/2 !rounded-full !bg-black/60"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  data-track-ignore
                >
                  <FiChevronRight aria-hidden />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[1.2rem] text-white">
                  {shown + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        )}

        <div className="p-7 sm:p-12">
          {work.categories.length > 0 && (
            <p className="text-[1.2rem] font-semibold uppercase tracking-[0.14em] text-main-orange">
              {work.categories.join(" · ")}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-start justify-between gap-6">
            <h2 id="work-title" className="text-[2.8rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
              {work.title}
            </h2>
            <div className="flex flex-wrap gap-3">
              {work.projectUrl && (
                <a
                  data-track-label={`View project: ${work.title}`}
                  href={work.projectUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="pf-btn pf-btn-sm"
                >
                  View project
                  <span className="pf-btn-ico">
                    <FiArrowUpRight aria-hidden />
                  </span>
                </a>
              )}
              {work.githubUrl && (
                <a
                  data-track-label={`GitHub: ${work.title}`}
                  href={work.githubUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="pf-btn pf-btn-ghost pf-btn-sm"
                >
                  GitHub
                  <span className="pf-btn-ico">
                    <BsGithub aria-hidden />
                  </span>
                </a>
              )}
            </div>
          </div>

          {(work.client || work.owner || work.date) && (
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {work.client && <MyInfo field="client" value={work.client} />}
              {work.owner && <MyInfo field="owner" value={work.owner} />}
              {work.date && (
                <MyInfo
                  field="date"
                  value={new Date(work.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                />
              )}
            </ul>
          )}

          {work.description && (
            <article className="mt-8 prose max-w-none prose-p:text-[1.55rem] prose-p:leading-[1.75] prose-p:text-gray-300 prose-strong:text-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{work.description}</ReactMarkdown>
            </article>
          )}

          {work.highlights.length > 0 && (
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {work.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[1.45rem] text-gray-300">
                  <span
                    className="mt-[0.8rem] h-[0.6rem] w-[0.6rem] shrink-0 rounded-full bg-main-orange"
                    aria-hidden
                  />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {work.techStack.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {work.techStack.map((tech) => (
                <span key={tech} className="pf-chip">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {images.length > 1 && (
            <div className="mt-10 flex gap-3 overflow-x-auto myScroll pb-2">
              {images.map((img, i) => (
                <button
                  key={img.url + i}
                  type="button"
                  onClick={() => show(i)}
                  aria-label={`Show image ${i + 1}`}
                  data-track-ignore
                  aria-pressed={i === shown}
                  className={`relative h-[7rem] w-[11rem] shrink-0 overflow-hidden rounded-xl border-2 border-solid transition-colors ${
                    i === shown ? "border-main-orange" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Img src={img.url} alt="" fill style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
}
