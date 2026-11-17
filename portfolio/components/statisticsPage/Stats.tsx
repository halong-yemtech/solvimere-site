"use client";

import Title from "../Title";
import StatisticsList from "./statistic/StatisticsList";
import LinksList from "./linkItem/LinksList";
import { useSite } from "../SiteProvider";
import { EditLinksButton, SectionTools } from "../edit/Editable";

export default function Statistics() {
  const { statistics } = useSite();
  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title
        name="statistics"
        actions={
          <SectionTools
            slug="statistics"
            title="statistic"
            items={statistics.map((s) => ({ id: s.id, label: s.title }))}
          />
        }
      />
      <StatisticsList />

      <Title name="links" actions={<EditLinksButton />} />
      <LinksList />
    </section>
  );
}
