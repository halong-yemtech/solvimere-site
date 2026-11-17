import type { PercentSkill } from "@/lib/siteTypes";
import DevelopmentSkeleton from "./DevelopmentSkeleton";

interface Props {
  development: PercentSkill[] | undefined;
}

export default function Development({ development }: Props) {
  return (
    <div className="pt-11">
      {development ? (
        development.map((f: PercentSkill) => (
          <div key={f.id} className="mb-7">
            <h3 className="capitalize text-2xl text-gray-300">{f.name}</h3>
            <progress
              className="progress progress-warning w-full bg-gray-800 mt-2.5"
              value={f.percent}
              max="100"
            ></progress>
          </div>
        ))
      ) : (
        <>
          <DevelopmentSkeleton />
          <DevelopmentSkeleton />
          <DevelopmentSkeleton />
          <DevelopmentSkeleton />
        </>
      )}
    </div>
  );
}
