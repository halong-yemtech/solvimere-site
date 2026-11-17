import Title from "../Title";
import StatisticsList from "./statistic/StatisticsList";
import LinksList from "./linkItem/LinksList";
import { useSite } from "../SiteProvider";

export default function Statistics() {
  const { statistics } = useSite();
  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title name="statistics" />
      <StatisticsList />

      <Title name="links" />
      <LinksList />
    </section>
  );
}
