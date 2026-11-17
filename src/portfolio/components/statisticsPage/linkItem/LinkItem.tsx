import { BiLinkExternal } from "react-icons/bi";
import type { SocialLinkData } from "@/lib/siteTypes";
import MyIcon from "@/components/MyIcon";

interface Props {
  link: SocialLinkData;
}

export default function LinkItem({ link }: Props) {
  return (
    <li className="relative px-6 py-5 bg-gray-800 shadow-lg rounded-xl group">
      <div className="flex items-center gap-x-6">
        <MyIcon
          Icon={link.icon}
          wrapperClassName="flex items-center justify-center w-20 min-w-[5rem] h-20 border-2 border-gray-700 border-solid rounded-lg group"
          iconClassName="text-5xl"
          style={{
            color: link.color,
          }}
        />

        <div>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="text-2xl font-semibold text-white transition-all duration-300 hover:text-main-orange"
          >
            {link.label}
          </a>
          <p className="text-[1.3rem] font-medium text-gray-400">{link.info}</p>
        </div>

        <a
          target="_blank"
          rel="noreferrer"
          href={link.url}
          className={`absolute flex items-center justify-center w-12 h-12 transition-all duration-200 bg-gray-900 rounded-full opacity-0 cursor-pointer -top-2 -right-3 group-hover:opacity-100`}
        >
          <BiLinkExternal className="text-3xl text-white" />
        </a>
      </div>
    </li>
  );
}
