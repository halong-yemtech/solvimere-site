import Img from "@/components/Img";
import { MouseEvent } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import MyInfo from "../MyInfo";
import { motion } from "framer-motion";
import type { ReactiveVar } from "@/lib/state";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BsGithub } from "react-icons/bs";
import { useSite } from "../SiteProvider";

interface Props {
  workId: number;
  reactiveVar: ReactiveVar<number | null>;
}

export default function WorkLb({ workId, reactiveVar }: Props) {
  const { works } = useSite();
  const workData = works.find((w) => w.id === workId);
  const cover = workData?.images[0];

  function closeLb(e: MouseEvent): void {
    if ((e.target as Element).classList.contains("lb")) {
      reactiveVar(null);
    }
  }

  if (!workData) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, type: "spring" }}
      onClick={closeLb}
      className="lb fixed top-0 left-0 w-screen h-screen bg-gray-900/70 z-50 flex justify-center items-center"
    >
      <main className="max-h-[95%] h-fit overflow-y-scroll noScroll w-[80rem] max-w-[95%] bg-[rgb(27,36,48)] rounded-lg relative">
        <button
          onClick={() => reactiveVar(null)}
          className="transition-all duration-200 hover:text-main-orange absolute right-6 top-6 text-gray-300 text-5xl z-50"
        >
          <AiFillCloseCircle />
        </button>

        {cover && (
          <div className="relative w-full h-[30rem]">
            <Img
              src={cover.url}
              alt={cover.alt || workData.title}
              fill
              sizes="(min-width: 840px) 800px, 95vw"
              priority
              style={{ objectFit: "cover" }}
              className="rounded-t-lg"
            />
          </div>
        )}

        <div className="p-12">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-4 text-4xl font-semibold tracking-wide text-gray-300 capitalize">
            <h1>{workData.title}</h1>
            <div className="flex flex-wrap gap-4">
              {workData.projectUrl && (
                <a
                  href={workData.projectUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="text-[1.4rem] flex items-center gap-2 rounded-full py-1.5 px-6 tracking-wide font-semibold capitalize hover:bg-sky-600 transition-all duration-300 text-white bg-sky-500"
                >
                  <HiOutlineViewGridAdd />
                  view project
                </a>
              )}
              {workData.githubUrl && (
                <a
                  href={workData.githubUrl}
                  rel="noreferrer"
                  target="_blank"
                  className="text-[1.4rem] flex items-center gap-2 rounded-full py-1.5 px-6 tracking-wide font-semibold capitalize shadow-lg hover:bg-gray-700 transition-all duration-300 text-white bg-gray-900"
                >
                  <BsGithub />
                  github
                </a>
              )}
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 mb-8">
            {workData.client && <MyInfo field="client" value={workData.client} />}
            {workData.owner && <MyInfo field="owner" value={workData.owner} />}
            <MyInfo field="categories" value={workData.categories.join(", ") || "Project"} />
            {workData.date && (
              <MyInfo
                field="date"
                value={new Date(workData.date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              />
            )}
          </ul>

          <article className="my-10 prose max-w-none prose-strong:text-main-orange">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{workData.description}</ReactMarkdown>
          </article>

          <div className="flex flex-wrap gap-3 mb-8">
            {workData.techStack.map((tech) => (
              <span key={tech} className="text-[1.3rem] py-1.5 px-5 rounded-full bg-gray-800 text-gray-300 capitalize">
                {tech}
              </span>
            ))}
          </div>

          <ul className="space-y-3">
            {workData.highlights.map((action) => (
              <li key={action} className="text-2xl text-gray-400 capitalize flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </motion.section>
  );
}
