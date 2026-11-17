import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiActivity, FiBriefcase, FiCalendar, FiGlobe, FiInfo, FiMail, FiMapPin, FiPhone, FiTag, FiUser,
} from "react-icons/fi";

const ICONS: Record<string, IconType> = {
  address: FiMapPin,
  location: FiMapPin,
  residence: FiGlobe,
  email: FiMail,
  phone: FiPhone,
  whatsapp: FaWhatsapp,
  status: FiActivity,
  age: FiCalendar,
  date: FiCalendar,
  client: FiBriefcase,
  owner: FiUser,
  categories: FiTag,
};

interface Props {
  field: string;
  value: React.ReactNode;
  /** Override the icon picked from the field name. */
  icon?: IconType;
  /** Shown under the value in a smaller line, e.g. "Chat on WhatsApp". */
  hint?: string;
}

/** One labelled detail (address, email, …) as an icon card. */
export default function MyInfo({ field, value, icon, hint }: Props) {
  const Icon = icon ?? ICONS[field.toLowerCase()] ?? FiInfo;
  const isStatus = field.toLowerCase() === "status";
  return (
    <li className="group flex min-w-0 items-center gap-4 rounded-xl border border-gray-800 bg-gray-800/40 px-4 py-3.5 transition-colors duration-200 hover:border-main-orange/40 hover:bg-gray-800/70">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-main-orange/10 text-[1.8rem] text-main-orange ring-1 ring-inset ring-main-orange/20 transition-colors group-hover:bg-main-orange/20">
        <Icon aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[1.1rem] font-medium uppercase tracking-[0.12em] text-gray-500">{field}</span>
        <span className="flex items-center gap-2 text-[1.5rem] leading-snug text-gray-200 break-words">
          {isStatus && (
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
          )}
          <span className="min-w-0 break-words">{value}</span>
        </span>
        {hint && <span className="block text-[1.15rem] text-gray-500">{hint}</span>}
      </span>
    </li>
  );
}
