import { FiDownload, FiMail, FiMapPin } from "react-icons/fi";
import { FiArrowUpRight } from "react-icons/fi";
import Img from "@/components/Img";
import { useSite } from "./SiteProvider";
import { iconRegistry } from "./icons";
import MediaIcons from "./MediaIcons";
import Slide from "./Slide";
import Typing from "./Typing";

/** Name, photo, links and the main actions. Sticky beside the content on desktop, on top on phones. */
export default function ProfileCard() {
  const { profile, socialLinks } = useSite();
  const HireIcon = profile.hireLink
    ? (iconRegistry[profile.hireLink.icon as keyof typeof iconRegistry] ?? FiArrowUpRight)
    : null;
  const where = profile.address || profile.residence;
  const titles = profile.typingTitles.filter((t) => t && t !== profile.jobTitle);

  return (
    <div className="pf-card overflow-hidden">
      <Slide images={profile.backgroundImages} className="h-[16rem]" />

      <div className="relative z-20 px-7 pb-7 -mt-[7rem] text-center">
        <div className="relative w-[12.8rem] h-[12.8rem] mx-auto">
          <div className="absolute -inset-[0.5rem] rounded-full bg-[conic-gradient(from_200deg,rgb(var(--accent)),transparent_45%,rgb(var(--accent)/0.6))] opacity-80" />
          {profile.avatar ? (
            <Img
              src={profile.avatar.url}
              alt={profile.avatar.alt || profile.name}
              priority
              className="relative w-full h-full rounded-full object-cover border-[0.4rem] border-solid border-[#16161a]"
            />
          ) : (
            <span className="relative grid w-full h-full place-items-center rounded-full border-[0.4rem] border-solid border-[#16161a] bg-gray-800 text-[4rem] font-bold text-white">
              {profile.name.charAt(0)}
            </span>
          )}
        </div>

        <h1 className="mt-5 text-[3rem] leading-tight font-extrabold tracking-[-0.03em] text-white">{profile.name}</h1>
        {profile.jobTitle && <p className="mt-1 text-[1.5rem] text-gray-400">{profile.jobTitle}</p>}
        <Typing
          key={titles.join("|")}
          titles={titles}
          className="mt-2 min-h-[2.2rem] text-[1.4rem] font-medium text-main-orange"
        />

        {profile.status && (
          <span className="pf-chip mt-5 !text-[1.25rem]">
            <span className="relative flex w-2 h-2" aria-hidden>
              <span className="absolute inline-flex w-full h-full rounded-full bg-green-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-green-400" />
            </span>
            {profile.status}
          </span>
        )}

        {socialLinks.length > 0 && <MediaIcons socialLinks={socialLinks} />}

        {(where || profile.email) && (
          <ul className="mt-7 grid gap-2 text-left">
            {where && (
              <li className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-[1.35rem] text-gray-300">
                <FiMapPin className="shrink-0 text-main-orange" aria-hidden />
                <span className="min-w-0 truncate">{where}</span>
              </li>
            )}
            {profile.email && (
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-[1.35rem] text-gray-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <FiMail className="shrink-0 text-main-orange" aria-hidden />
                  <span className="min-w-0 truncate">{profile.email}</span>
                </a>
              </li>
            )}
          </ul>
        )}

        {(profile.cvUrl || profile.hireLink) && (
          <div className="mt-6 grid gap-3">
            {profile.hireLink && HireIcon && (
              <a
                href={profile.hireLink.url}
                target="_blank"
                rel="noreferrer"
                className="pf-btn w-full !justify-between"
              >
                <span className="capitalize">{profile.hireLink.label}</span>
                <span className="pf-btn-ico">
                  <HireIcon aria-hidden />
                </span>
              </a>
            )}
            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
                className={`pf-btn w-full !justify-between ${profile.hireLink ? "pf-btn-ghost" : ""}`}
              >
                <span>Download CV</span>
                <span className="pf-btn-ico">
                  <FiDownload aria-hidden />
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
