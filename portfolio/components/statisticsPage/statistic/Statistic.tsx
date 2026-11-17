import { EditableItem } from "@/components/edit/Editable";
import { BiLinkExternal } from "react-icons/bi";
import Link from "next/link";

interface Props {
  id?: number;
  title: string;
  info: string | number;
  externalLink?: string;
}

export default function Statistic({ id, title, info, externalLink }: Props) {
  return (
    <li className="relative px-8 py-4 bg-gray-800 rounded-xl group">
      <EditableItem slug="statistics" id={id}>
        <h3 className="text-3xl mb-2.5 tracking-wider font-medium capitalize text-white">{title}</h3>
        <p className="text-[1.6rem] text-gray-400">{info}</p>
        {externalLink && (
          <Link
            target="_blank"
            rel="noreferrer"
            href={externalLink}
            className={`absolute flex items-center justify-center w-12 h-12 transition-all duration-200 bg-gray-900 rounded-full opacity-0 cursor-pointer -top-2 -right-3 group-hover:opacity-100`}
          >
            <BiLinkExternal className="text-3xl text-white" />
          </Link>
        )}
      </EditableItem>
    </li>
  );
}
