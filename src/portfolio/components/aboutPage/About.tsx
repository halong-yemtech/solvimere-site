import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiArrowUpRight, FiCalendar, FiCheck, FiGlobe, FiX } from "react-icons/fi";
import Img from "@/components/Img";
import MyIcon from "../MyIcon";
import Testimonial from "../Testimonial";
import Title from "../Title";
import { useSite } from "../SiteProvider";

/** About: bio and details, services, pricing, clients, testimonials and facts. Empty blocks are skipped. */
export default function About() {
  const { profile, services, pricingPlans, clients, testimonials, facts } = useSite();
  // Address and availability are already on the profile card, so only the rest is listed here.
  const info = [
    { label: "Age", value: profile.age, Icon: FiCalendar },
    { label: "Based in", value: profile.residence, Icon: FiGlobe },
  ].filter((i) => i.value);

  return (
    <div className="space-y-14">
      {(profile.bio || info.length > 0) && (
        <section className="pf-card p-7 sm:p-9">
          {profile.bio && (
            <article className="prose max-w-none text-gray-300 prose-p:text-[1.6rem] prose-p:leading-[1.75] prose-p:text-gray-300 prose-p:my-0 [&>p+p]:!mt-5 prose-strong:text-white prose-strong:font-semibold prose-h2:text-[1.9rem] prose-h2:text-white prose-h2:mt-8 prose-h2:mb-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{profile.bio}</ReactMarkdown>
            </article>
          )}
          {info.length > 0 && (
            <ul className={`flex flex-wrap gap-2 ${profile.bio ? "mt-7 border-t border-white/[0.07] pt-6" : ""}`}>
              {info.map(({ label, value, Icon }) => (
                <li key={label} className="pf-chip !py-1.5">
                  <Icon className="text-main-orange" aria-hidden />
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {facts.length > 0 && (
        <ul className={`grid gap-3 grid-cols-2 ${facts.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
          {facts.map((fact) => (
            <li key={fact.id} className="pf-card px-6 py-8 flex flex-col items-center text-center gap-4">
              <MyIcon Icon={fact.icon} />
              <p className="text-[1.45rem] leading-snug text-gray-300">{fact.description}</p>
            </li>
          ))}
        </ul>
      )}

      {services.length > 0 && (
        <section>
          <Title name="Services" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <li key={s.id} className="pf-card pf-card-hover p-7">
                <div className="flex items-center gap-4">
                  <MyIcon Icon={s.icon} />
                  <h3 className="text-[1.75rem] font-semibold leading-snug text-white">{s.title}</h3>
                </div>
                <p className="mt-4 text-[1.5rem] leading-[1.7] text-gray-400">{s.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pricingPlans.length > 0 && (
        <section>
          <Title name="Pricing" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pricingPlans.map((plan, i) => {
              const featured = pricingPlans.length > 1 && i === 1;
              return (
                <li
                  key={plan.id}
                  className={`pf-card p-8 flex flex-col ${featured ? "!border-main-orange/50 shadow-[0_2rem_6rem_-2rem_rgb(var(--accent)/0.35)]" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <MyIcon Icon={plan.icon} />
                    <h3 className="text-[1.8rem] font-semibold capitalize text-white">{plan.name}</h3>
                  </div>
                  <p className="mt-6 flex items-baseline gap-1 text-white">
                    <span className="text-[2rem] text-gray-400">$</span>
                    <span className="text-[4.8rem] font-extrabold tracking-[-0.04em] leading-none">{plan.price}</span>
                    {plan.period && <span className="ml-1 text-[1.5rem] text-gray-400">/ {plan.period}</span>}
                  </p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f.id}
                        className={`flex items-start gap-3 text-[1.5rem] ${f.included ? "text-gray-300" : "text-gray-600 line-through"}`}
                      >
                        {f.included ? (
                          <FiCheck className="mt-[0.3rem] shrink-0 text-main-orange" aria-label="Included" />
                        ) : (
                          <FiX className="mt-[0.3rem] shrink-0" aria-label="Not included" />
                        )}
                        {f.feature}
                      </li>
                    ))}
                  </ul>
                  {plan.orderUrl && (
                    <a
                      href={plan.orderUrl}
                      rel="noreferrer"
                      target="_blank"
                      className={`pf-btn mt-8 w-full !justify-between ${featured ? "" : "pf-btn-ghost"}`}
                    >
                      Order now
                      <span className="pf-btn-ico">
                        <FiArrowUpRight aria-hidden />
                      </span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {testimonials.length > 0 && (
        <section>
          <Title name="Testimonials" />
          <div className={testimonials.length > 1 ? "md:columns-2 gap-4" : ""}>
            {testimonials.map((t) => (
              <Testimonial key={t.id} testimonial={t} className="mb-4 break-inside-avoid" />
            ))}
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section>
          <Title name="Clients" />
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {clients.map((client) => (
              <li key={client.id}>
                <a
                  href={client.url}
                  rel="noreferrer"
                  target="_blank"
                  aria-label={client.name}
                  title={client.name}
                  className="pf-card pf-card-hover flex h-[10rem] items-center justify-center px-6 opacity-70 hover:opacity-100"
                >
                  {client.logo ? (
                    <span className="relative block w-full h-[4.4rem]">
                      <Img
                        src={client.logo.url}
                        alt={client.logo.alt || client.name}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </span>
                  ) : (
                    <MyIcon
                      Icon={client.icon ?? "FaLink"}
                      wrapperClassName=""
                      iconClassName="text-[3.6rem] text-gray-300"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
