import Statistic from "./Statistic";
import { useSite } from "../../SiteProvider";

export default function StatisticsList() {
  const { statistics } = useSite();
  return (
    <ul className="grid grid-cols-1 gap-5 px-12 py-8 sm:grid-cols-2 md:grid-cols-3">
      {statistics.map((s) => (
        <Statistic key={s.id} id={s.id} title={s.title} info={s.value} externalLink={s.link ?? undefined} />
      ))}
    </ul>
  );
}
