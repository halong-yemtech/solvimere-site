import Link from "next/link";
import type { SocialLinkData } from "@/lib/siteTypes";
import MyIcon from "./MyIcon";

interface Props {
  socialLinks: SocialLinkData[];
}

export default function MediaIcons({ socialLinks }: Props) {
  return (
    <div className="flex gap-5 items-center justify-center mt-7">
      {socialLinks.map(({ id, icon, label, url }) => (
        <Link rel="noreferrer" href={url} target="_blank" key={id} aria-label={label}>
          <MyIcon
            Icon={icon}
            wrapperClassName=""
            iconClassName="text-gray-300 text-3xl transition-all duration-300 hover:text-main-orange cursor-pointer"
          />
        </Link>
      ))}
    </div>
  );
}
