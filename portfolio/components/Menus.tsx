"use client";

import MenuBtn from "./MenuBtn";
import { BsBookHalf } from "react-icons/bs";
import { useMenus } from "@/lib/useMenus";
import type { ReactiveVar } from "@/lib/state";
import { currentMenu } from "@/lib/state";

interface Props {
  showSideMenu: ReactiveVar<boolean>;
}

export default function Menus({ showSideMenu }: Props) {
  const { menus, activeKey } = useMenus();
  const menuId = activeKey;
  // The guest book has its own tile above, so it is left out here.
  const hasGuestbook = menus.some((m) => m.id === "guestbook");
  const mainMenus = menus.filter((m) => m.id !== "guestbook");

  return (
    <header className="xl:w-[7.2rem] lg:w-[7rem] py-6 h-full mr-4 hidden lg:flex flex-col justify-between">
      {/* humburbar menu */}
      <div
        onClick={() => showSideMenu(true)}
        className="h-[7.2rem] group rounded-lg bg-gray-900 flex items-center justify-center cursor-pointer"
      >
        <div className="w-11">
          <div className="w-9/12 h-[0.24rem] bg-gray-300 transition-width duration-300 group-hover:w-full group-hover:bg-main-orange"></div>
          <div className="w-full h-1 my-2 bg-gray-300 group-hover:bg-main-orange"></div>
          <div className="w-9/12 h-[0.24rem] bg-gray-300 transition-width duration-300 group-hover:w-full group-hover:bg-main-orange"></div>
        </div>
      </div>

      {/* cart btn */}
      {/* guest book btn */}
      {hasGuestbook ? (
      <div
        onClick={() => currentMenu("guestbook")}
        className="h-[7.2rem] rounded-lg bg-gray-900 flex items-center justify-center cursor-pointer group"
      >
        <div className="relative">
          <BsBookHalf className="text-4xl text-gray-300 transition-all duration-300 group-hover:text-main-orange" />
          {/* <span className="absolute flex items-center justify-center w-6 h-6 text-lg text-gray-800 rounded-full -top-2 -right-3 bg-main-orange">
            0
          </span> */}
        </div>
      </div>
      ) : (
        <div className="h-[7.2rem]" />
      )}

      <div className="overflow-hidden rounded-lg">
        {mainMenus.map((m, i) => (
          <MenuBtn
            key={m.id}
            menu={m}
            noBorder={i === mainMenus.length - 1}
            active={menuId === m.id}
            reactiveVar={currentMenu}
          />
        ))}
      </div>
    </header>
  );
}
