"use client";

import Fact from "./Fact";
import { useSite } from "../../SiteProvider";

export default function Facts() {
  const { facts } = useSite();

  return (
    <ul className="grid grid-cols-2 mb-12 logos sm:grid-cols-4">
      {facts.map((fact, idx) => (
        <Fact key={fact.id} fact={fact} border={idx !== facts.length - 1} pos={idx} />
      ))}
    </ul>
  );
}
