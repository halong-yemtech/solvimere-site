"use client";

import IconTitle from "../IconTitle";
import ResumeItem from "./ResumeItem";
import { FaGraduationCap, FaNetworkWired } from "react-icons/fa";
import { useSite } from "../../SiteProvider";

export default function MyResume() {
  const { resume } = useSite();
  const experience = resume.filter((r) => r.type === "experience");
  const education = resume.filter((r) => r.type === "education");

  return (
    <ul className="grid sm:grid-cols-2 grid-cols-1">
      <li className="py-8 px-12">
        <IconTitle title="experience" Icon={FaNetworkWired} />
        {experience.map((r, idx) => (
          <ResumeItem key={r.id} resume={r} border={idx !== experience.length - 1} />
        ))}
      </li>

      <li className="py-8 px-12 relative vCustomLine sm:before:block before:hidden before:left-0">
        <IconTitle title="education" Icon={FaGraduationCap} />
        {education.map((r, idx) => (
          <ResumeItem key={r.id} resume={r} border={idx !== education.length - 1} />
        ))}
      </li>
    </ul>
  );
}
