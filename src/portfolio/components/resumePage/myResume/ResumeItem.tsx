import { toBullets } from "@/lib/cv/data";
import type { ResumeEntryData } from "@/lib/siteTypes";

interface Props {
  resume: ResumeEntryData;
  border?: boolean;
}

export default function ResumeItem({ resume, border }: Props) {
  const target = { kind: "collection" as const, slug: "resume-entries" as const, id: resume.id };
  // One line per achievement (the CV shows them as bullets too).
  const bullets = toBullets(resume.description);
  return (
    <>
      <div className={`pt-11 ${border ? "customLine before:bottom-0 relative borderLeft pb-11" : "pb-3"}`}>
        <h2
          className={`${
            /present$/i.test(resume.period.trim())
              ? "text-main-orange border-main-orange"
              : "text-gray-500 border-gray-500"
          } border border-solid text-xl py-0.5 px-3 tracking-wide inline-block`}
        >
          <span>{resume.period}</span>
        </h2>
        <h3 className="block text-2xl capitalize font-medium text-gray-300 tracking-wide mt-5 mb-4">{resume.title}</h3>

        {(resume.subtitle || resume.location) && (
          <p className="text-gray-500 text-xl capitalize tracking-wider">
            {[resume.subtitle, resume.location].filter(Boolean).join(" · ")}
          </p>
        )}
        {bullets.length === 1 && (
          <p className="text-gray-500 text-2xl tracking-wide mt-5 leading-relaxed">{bullets[0]}</p>
        )}
        {bullets.length > 1 && (
          <ul className="mt-5 space-y-2 text-gray-500 text-2xl tracking-wide leading-relaxed">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-main-orange">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
