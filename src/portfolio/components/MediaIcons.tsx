import type { SocialLinkData } from "@/lib/siteTypes";
import MyIcon from "./MyIcon";

interface Props {
  socialLinks: SocialLinkData[];
}

/** The profile's accounts as a row of icon buttons. */
export default function MediaIcons({ socialLinks }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
      {socialLinks.map(({ id, icon, label, url }) => (
        <a
          rel="noreferrer"
          href={url}
          target="_blank"
          key={id}
          aria-label={label}
          data-tip={label}
          className="pf-icon-btn tooltip"
        >
          <MyIcon Icon={icon} wrapperClassName="" iconClassName="text-[1.8rem]" />
        </a>
      ))}
    </div>
  );
}
