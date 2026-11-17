"use client";

import LinkItem from "./LinkItem";
import { useSite } from "../../SiteProvider";

export default function LinksList() {
  const { socialLinks } = useSite();

  return (
    <ul className="px-12 py-8 mb-8 space-y-6">
      {socialLinks.map((link) => (
        <LinkItem key={link.id} link={link} />
      ))}
    </ul>
  );
}
