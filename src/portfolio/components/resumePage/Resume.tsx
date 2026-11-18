import { FiAward, FiBookOpen, FiBriefcase, FiCloud, FiCode, FiCpu, FiGlobe } from "react-icons/fi";
import { toBullets } from "@/lib/cv/data";
import type { PercentSkill, ResumeEntryData } from "@/lib/siteTypes";
import Testimonial from "../Testimonial";
import Title, { SubTitle } from "../Title";
import { useSite } from "../SiteProvider";

const isCurrent = (period: string) => /present|now|current/i.test(period.trim());

/** Resume: experience and education timelines, skills, and the profile's quote. */
export default function Resume() {
  const { profile, resume, skills } = useSite();
  const experience = resume.filter((r) => r.type === "experience");
  const education = resume.filter((r) => r.type === "education");
  const hasSkills =
    skills.coding.length + skills.knowledge.length + skills.development.length + skills.languages.length > 0;

  return (
    <div className="space-y-14">
      {(experience.length > 0 || education.length > 0) && (
        <section>
          <div className="grid gap-4">
            {experience.length > 0 && (
              <div className="pf-card p-7 sm:p-9">
                <SubTitle title="experience" Icon={FiBriefcase} />
                <Timeline items={experience} />
              </div>
            )}
            {education.length > 0 && (
              <div className="pf-card p-7 sm:p-9">
                <SubTitle title="education" Icon={FiAward} />
                <Timeline items={education} />
              </div>
            )}
          </div>
        </section>
      )}

      {hasSkills && (
        <section>
          <Title name="Skills" />
          <div className="grid gap-4">
            {skills.coding.length > 0 && (
              <div className="pf-card p-8">
                <SubTitle title="coding" Icon={FiCode} />
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-x-4 gap-y-7">
                  {skills.coding.map((s) => (
                    <li key={s.id} className="flex flex-col items-center text-center">
                      <span
                        className="radial-progress text-main-orange"
                        style={{ "--value": s.percent, "--size": "7.6rem" } as React.CSSProperties}
                        role="img"
                        aria-label={`${s.name}: ${s.percent}%`}
                      >
                        <span className="text-[1.6rem] font-semibold text-white">{s.percent}%</span>
                      </span>
                      <span className="mt-3 text-[1.4rem] text-gray-300">{s.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="gap-4 md:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid -mb-4">
              {skills.development.length > 0 && (
                <div className="pf-card p-8">
                  <SubTitle title="AI & cloud" Icon={FiCloud} />
                  <Bars items={skills.development} />
                </div>
              )}

              {skills.knowledge.length > 0 && (
                <div className="pf-card p-8">
                  <SubTitle title="knowledge" Icon={FiCpu} />
                  <ul className="flex flex-wrap gap-2">
                    {skills.knowledge.map((k) => (
                      <li key={k} className="pf-chip">
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {skills.languages.length > 0 && (
                <div className="pf-card p-8">
                  <SubTitle title="languages" Icon={FiGlobe} />
                  <ul className="space-y-6">
                    {skills.languages.map((l) => (
                      <li key={l.id}>
                        <div className="flex items-center justify-between text-[1.45rem]">
                          <span className="capitalize text-gray-200">{l.name}</span>
                          <span className="text-gray-500">{l.level}/10</span>
                        </div>
                        <div
                          className="mt-2.5 grid grid-cols-10 gap-1.5"
                          role="img"
                          aria-label={`${l.name}: ${l.level} of 10`}
                        >
                          {Array.from({ length: 10 }, (_, i) => (
                            <span
                              key={i}
                              className={`h-[0.6rem] rounded-full ${i < l.level ? "bg-main-orange" : "bg-white/[0.07]"}`}
                            />
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {profile.quote && (
        <section>
          <Title name="Favourite quote" />
          <Testimonial testimonial={profile.quote} />
        </section>
      )}

      {experience.length === 0 && education.length === 0 && !hasSkills && !profile.quote && (
        <div className="pf-card p-12 text-center text-[1.6rem] text-gray-400">
          <FiBookOpen className="mx-auto mb-4 text-[3rem] text-gray-500" aria-hidden />
          The resume is on its way.
        </div>
      )}
    </div>
  );
}

function Timeline({ items }: { items: ResumeEntryData[] }) {
  return (
    <ol className="relative ml-[0.7rem] border-l border-solid border-white/10">
      {items.map((r) => {
        const bullets = toBullets(r.description);
        const current = isCurrent(r.period);
        return (
          <li key={r.id} className="relative pl-8 pb-10 last:pb-0">
            <span
              className={`absolute -left-[0.75rem] top-[0.6rem] h-[1.4rem] w-[1.4rem] rounded-full border-[0.3rem] border-solid border-[#141418] ${
                current ? "bg-main-orange shadow-[0_0_0_4px_rgb(var(--accent)/0.25)]" : "bg-gray-600"
              }`}
              aria-hidden
            />
            <span className={`pf-chip !text-[1.2rem] !py-1 ${current ? "pf-chip-accent" : ""}`}>{r.period}</span>
            <h4 className="mt-3 text-[1.8rem] font-semibold leading-snug text-white">{r.title}</h4>
            {(r.subtitle || r.location) && (
              <p className="mt-1 text-[1.4rem] text-main-orange/90">
                {[r.subtitle, r.location].filter(Boolean).join(" · ")}
              </p>
            )}
            {bullets.length === 1 && <p className="mt-3 text-[1.5rem] leading-[1.7] text-gray-400">{bullets[0]}</p>}
            {bullets.length > 1 && (
              <ul className="mt-3 space-y-2 text-[1.5rem] leading-[1.65] text-gray-400">
                {bullets.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="mt-[0.95rem] h-[0.5rem] w-[0.5rem] shrink-0 rounded-full bg-main-orange"
                      aria-hidden
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Bars({ items }: { items: PercentSkill[] }) {
  return (
    <ul className="space-y-6">
      {items.map((s) => (
        <li key={s.id}>
          <div className="flex items-center justify-between text-[1.45rem]">
            <span className="text-gray-200">{s.name}</span>
            <span className="text-gray-500">{s.percent}%</span>
          </div>
          <div
            className="pf-bar mt-2.5"
            role="progressbar"
            aria-label={s.name}
            aria-valuenow={s.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${Math.max(0, Math.min(100, s.percent))}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
