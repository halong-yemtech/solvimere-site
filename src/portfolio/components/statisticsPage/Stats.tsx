import { FiArrowUpRight, FiBarChart2 } from "react-icons/fi";
import MyIcon from "../MyIcon";
import Title from "../Title";
import { useSite } from "../SiteProvider";

/** Stats: numbers worth knowing, and every account the profile links to. */
export default function Stats() {
  const { statistics, socialLinks } = useSite();

  return (
    <div className="space-y-14">
      <section>
        {statistics.length === 0 ? (
          <div className="pf-card p-12 text-center text-[1.6rem] text-gray-400">
            <FiBarChart2 className="mx-auto mb-4 text-[3rem] text-gray-500" aria-hidden />
            Stats will be shown here soon.
          </div>
        ) : (
          <ul
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
              statistics.length % 3 === 0 ? "xl:grid-cols-3" : statistics.length % 4 === 0 ? "xl:grid-cols-4" : ""
            }`}
          >
            {statistics.map((s) => {
              const body = (
                <>
                  <span className="block text-[1.3rem] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    {s.title}
                  </span>
                  <span className="mt-2 block text-[2.4rem] font-extrabold leading-tight tracking-[-0.02em] text-white break-words">
                    {s.value}
                  </span>
                  {s.link && (
                    <FiArrowUpRight
                      className="absolute right-5 top-5 text-[1.8rem] text-gray-500 transition-colors group-hover:text-main-orange"
                      aria-hidden
                    />
                  )}
                </>
              );
              return (
                <li key={s.id}>
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      className="group pf-card pf-card-hover relative block h-full p-7"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="pf-card relative h-full p-7">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {socialLinks.length > 0 && (
        <section>
          <Title name="Find me online" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group pf-card pf-card-hover flex items-center gap-5 p-5"
                >
                  <MyIcon
                    Icon={link.icon}
                    wrapperClassName="grid h-[5.2rem] w-[5.2rem] shrink-0 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10"
                    iconClassName="text-[2.6rem]"
                    style={{ color: link.color || undefined }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.65rem] font-semibold text-white">{link.label}</span>
                    {link.info && <span className="block truncate text-[1.35rem] text-gray-400">{link.info}</span>}
                  </span>
                  <FiArrowUpRight
                    className="shrink-0 text-[2rem] text-gray-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-main-orange"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
