"use client";

import type { ReactiveVar } from "@/lib/state";
import Image from "next/image";
import Link from "next/link";
import { MouseEvent } from "react";
import { IoMdClose } from "react-icons/io";
import { useMenus } from "@/lib/useMenus";
import SideMenuBtn from "./SideMenuBtn";
import { useSite } from "./SiteProvider";
import { currentMenu } from "@/lib/state";
import MyIcon from "./MyIcon";

interface Props {
  sideMenu: boolean;
  showMenu: ReactiveVar<boolean>;
}

export default function SideMenuLb({ sideMenu, showMenu }: Props) {
  const { menus, activeKey: menuId } = useMenus();
  const { profile, socialLinks } = useSite();

  function closeLb(e: MouseEvent): void {
    if ((e.target as Element).classList.contains("lb")) {
      showMenu(false);
    }
  }

  return (
    <section
      onClick={closeLb}
      className={`lb fixed top-0 left-0 w-screen h-screen bg-gray-900/70 z-50 transition-all duration-200 ${
        sideMenu ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <main className="max-h-screen h-screen noScroll overflow-y-scroll w-[32rem] max-w-full bg-[rgb(27,36,48)] flex flex-col relative">
        <button
          onClick={() => showMenu(false)}
          className="transition-all duration-200 hover:text-main-orange absolute left-0 top-0 w-full h-24 bg-[rgb(43,57,74)] text-gray-300 text-5xl flex justify-center items-center"
        >
          <IoMdClose />
        </button>

        <div className="top pb-12 pt-36 flex flex-col items-center">
          <div>
            {profile.avatar && (
              <Image
                src={profile.avatar.url}
                alt={profile.avatar.alt || profile.name}
                style={{ objectFit: "cover" }}
                width="125"
                height="125"
                className="rounded-full w-[125px] h-[125px]"
              />
            )}
            <h3 className="text-[1.65rem] text-gray-300 tracking-wide font-medium capitalize text-center mt-6 mb-4">
              {profile.name}
            </h3>
          </div>

          <div className="flex gap-x-5 items-center justify-center">
            {socialLinks.map(({ id, icon, label, url }) => (
              <Link
                rel="noreferrer"
                target="_blank"
                href={url}
                className="tooltip tooltip-bottom"
                data-tip={label}
                key={id}
              >
                <MyIcon
                  Icon={icon}
                  wrapperClassName=""
                  iconClassName="text-gray-400 text-2xl transition-all duration-300 hover:text-main-orange"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="bottom bg-gray-800 flex-grow">
          <div className="rounded-lg overflow-hidden">
            {menus.map((m, i) => (
              <SideMenuBtn
                key={m.id}
                menu={m}
                active={menuId === m.id}
                reactiveVar={currentMenu}
                showMenu={showMenu}
                last={i === menus.length - 1}
              />
            ))}
          </div>

          {profile.cvUrl && (
            <a
              rel="noreferrer"
              href={profile.cvUrl}
              target="_blank"
              className="text-gray-300 uppercase text-xl border-2 border-solid border-gray-300 w-56 h-14 rounded-full font-semibold flex items-center justify-center mx-auto mt-12 hover:text-main-orange hover:border-main-orange transition-all duration-200"
            >
              download cv
            </a>
          )}

          <p className="text-center text-gray-500 text-xl mt-16 mb-10">{profile.copyright}</p>
        </div>
      </main>
    </section>
  );
}
