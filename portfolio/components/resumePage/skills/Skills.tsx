"use client";

import { FaServer } from "react-icons/fa";
import Coding from "./Coding";
import Development from "./Development";
import IconTitle from "../IconTitle";
import Knowledge from "./Knowledge";
import Languages from "./Languages";
import { useSite } from "../../SiteProvider";

export default function Skills() {
  const { skills } = useSite();

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2">
        <li className="py-6 px-12">
          <IconTitle title="coding" Icon={FaServer} />
          <Coding coding={skills.coding} />
        </li>
        <li className="py-6 px-12 relative vCustomLine sm:before:block before:hidden before:left-0">
          <IconTitle title="knowledge" Icon={FaServer} />
          <Knowledge knowledge={skills.knowledge} />
        </li>
      </ul>

      <ul className="grid sm:grid-cols-2 grid-cols-1">
        <li className="pt-6 px-12">
          <IconTitle title="AI & Cloud" Icon={FaServer} />
          <Development development={skills.development} />
        </li>
        <li className="pt-6 px-12 relative vCustomLine before:left-0 sm:before:block before:hidden">
          <IconTitle title="languages" Icon={FaServer} />
          <Languages languages={skills.languages} />
        </li>
      </ul>
    </>
  );
}
