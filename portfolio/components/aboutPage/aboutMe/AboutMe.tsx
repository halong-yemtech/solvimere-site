"use client";

import MyInfo from "../../MyInfo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSite } from "../../SiteProvider";

export default function AboutMe() {
  const { profile } = useSite();
  const info = [
    ["age", profile.age],
    ["residence", profile.residence],
    ["status", profile.status],
    ["address", profile.address],
  ].filter(([, value]) => value);

  return (
    <div className="px-12 py-10">
      <article className="prose max-w-none prose-h2:mb-2.5 prose-h2:text-[1.6rem] prose-p:text-2xl prose-p:leading-[1.65] prose-strong:text-main-orange prose-strong:font-semibold">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{profile.bio}</ReactMarkdown>
      </article>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
        {info.map(([field, value]) => (
          <MyInfo key={field} field={field} value={value} />
        ))}
      </ul>
    </div>
  );
}
