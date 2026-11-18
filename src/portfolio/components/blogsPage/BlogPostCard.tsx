import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaGithub, FaLinkedinIn, FaPenNib } from "react-icons/fa";
import { FiArrowUpRight, FiMapPin } from "react-icons/fi";
import { SiUpwork } from "react-icons/si";
import type { BlogPlatform, BlogPostData } from "@/lib/siteTypes";
import GithubCalendar from "./GithubCalendar";
import UpworkBadges from "./UpworkBadges";

const PLATFORMS: Record<
  BlogPlatform,
  { name: string; color: string; iconColor: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  upwork: { name: "Upwork", color: "#14a800", iconColor: "#ffffff", Icon: SiUpwork },
  github: { name: "GitHub", color: "#e6edf3", iconColor: "#0d1117", Icon: FaGithub },
  linkedin: { name: "LinkedIn", color: "#0a66c2", iconColor: "#ffffff", Icon: FaLinkedinIn },
  other: { name: "the web", color: "rgb(var(--accent))", iconColor: "#111827", Icon: FaPenNib },
};

const TAG_LIMIT = 14;
/** Fill the row exactly, so there are no empty cells (classes spelled out for Tailwind). */
const STAT_COLS = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"];

export default function BlogPostCard({
  post,
  author,
  avatar,
}: {
  post: BlogPostData;
  author: string;
  avatar: string | null;
}) {
  const p = PLATFORMS[post.platform];
  const [allTags, setAllTags] = useState(false);
  const tags = allTags ? post.tags : post.tags.slice(0, TAG_LIMIT);
  const firstName = author.split(" ")[0] || author;

  return (
    <article className="pf-card relative overflow-hidden">
      {/* Brand stripe + soft glow, so each platform reads at a glance. */}
      <div className="h-1" style={{ background: p.color }} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-[0.07] blur-2xl"
        style={{ background: p.color }}
      />

      <div className="relative p-8 sm:p-10">
        {/* Who / where */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="relative">
              {avatar ? (
                <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-700" />
              ) : (
                <span className="block h-14 w-14 rounded-full bg-gray-700" />
              )}
              <span
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full ring-2 ring-gray-900"
                style={{ background: p.color, color: p.iconColor }}
              >
                <p.Icon className="text-[1.3rem]" />
              </span>
            </span>
            <div>
              <p className="text-xl font-medium text-gray-300">
                {firstName} <span className="text-gray-500">on</span> {p.name}
              </p>
              {post.headline && <p className="text-lg text-main-orange">{post.headline}</p>}
            </div>
          </div>
          {post.location && (
            <span className="flex items-center gap-1.5 text-lg text-gray-400">
              <FiMapPin /> {post.location}
            </span>
          )}
        </header>

        <h3 className="mt-7 text-[2.2rem] leading-snug font-bold tracking-[-0.02em] text-white">{post.title}</h3>

        {post.badges.length > 0 && post.platform === "upwork" && <UpworkBadges badges={post.badges} />}
        {post.badges.length > 0 && post.platform !== "upwork" && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {post.badges.map((b) => (
              <li
                key={b}
                className="rounded-full border px-3.5 py-1 text-lg text-gray-200"
                style={{
                  borderColor: `color-mix(in srgb, ${p.color} 55%, transparent)`,
                  background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                }}
              >
                {b}
              </li>
            ))}
          </ul>
        )}

        {post.stats.length > 0 && (
          <dl
            className={`mt-7 grid ${post.stats.length === 1 ? "grid-cols-1" : "grid-cols-2"} ${STAT_COLS[Math.min(post.stats.length, 4)]} max-sm:[&>*:last-child:nth-child(odd)]:col-span-2 gap-px overflow-hidden rounded-xl border border-gray-700/60 bg-gray-700/60`}
          >
            {post.stats.map((s) => (
              <div key={`${s.value}-${s.label}`} className="bg-[#0f0f13] px-5 py-4">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-[2.4rem] leading-none font-semibold text-gray-100">{s.value}</span>
                  <span className="mt-1.5 block text-lg text-gray-400">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {post.githubUsername && (
          <div className="mt-7">
            <GithubCalendar username={post.githubUsername} />
          </div>
        )}

        {post.image && (
          <figure className="mt-7">
            <img
              src={post.image.url}
              alt={post.image.alt || post.imageCaption || `${p.name} screenshot`}
              loading="lazy"
              className="w-full h-auto rounded-xl border border-gray-700/60 bg-gray-900"
            />
            {post.imageCaption && (
              <figcaption className="mt-2 text-lg text-gray-500 text-center">{post.imageCaption}</figcaption>
            )}
          </figure>
        )}

        <div className="prose max-w-none mt-7 prose-p:text-[1.55rem] prose-p:leading-[1.75] prose-p:text-gray-300 prose-li:text-[1.5rem] prose-strong:text-main-orange prose-strong:font-semibold prose-em:text-gray-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span key={t} className="pf-chip !text-[1.2rem] !py-0.5">
                {t}
              </span>
            ))}
            {post.tags.length > TAG_LIMIT && (
              <button
                type="button"
                onClick={() => setAllTags((v) => !v)}
                className="rounded-md px-3 py-1 text-lg text-main-orange hover:underline"
              >
                {allTags ? "show less" : `+${post.tags.length - TAG_LIMIT} more`}
              </button>
            )}
          </div>
        )}

        {post.url && (
          <a href={post.url} target="_blank" rel="noreferrer" className="pf-btn pf-btn-ghost mt-9">
            {post.buttonLabel}
            <span className="pf-btn-ico">
              <FiArrowUpRight aria-hidden />
            </span>
          </a>
        )}
      </div>
    </article>
  );
}
