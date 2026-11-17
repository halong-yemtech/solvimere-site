"use client";

import { EditableItem } from "@/components/edit/Editable";

import Image from "next/image";
import Link from "next/link";
import MyIcon from "../../MyIcon";
import { useSite } from "../../SiteProvider";

export default function BrandLogos() {
  const { clients } = useSite();

  return (
    <ul className="logos grid sm:grid-cols-4 grid-cols-2">
      {clients.map((client, idx) => (
        <li key={client.id}>
          <EditableItem slug="clients" id={client.id}>
            <div
              className={`py-16 px-12 relative vCustomLine before:right-0 ${
                idx !== clients.length - 1
                  ? `${idx === 1 ? "before:hidden sm:before:block" : "before:block"}`
                  : "before:hidden"
              }`}
            >
              <Link
                href={client.url}
                rel="noreferrer"
                target="_blank"
                aria-label={client.name}
                className="relative inline-flex w-full h-12 items-center justify-center opacity-50 transition-all duration-300 hover:opacity-100"
              >
                {client.logo ? (
                  <Image
                    src={client.logo.url}
                    alt={client.logo.alt || client.name}
                    fill
                    sizes="160px"
                    style={{ objectFit: "contain" }}
                  />
                ) : (
                  <MyIcon Icon={client.icon ?? "FaLink"} wrapperClassName="" iconClassName="text-5xl text-gray-300" />
                )}
              </Link>
            </div>
          </EditableItem>
        </li>
      ))}
    </ul>
  );
}
