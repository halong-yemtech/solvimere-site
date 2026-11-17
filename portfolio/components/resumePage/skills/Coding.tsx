import type { PercentSkill } from "@/lib/siteTypes";
import CodingSkeleton from "./CodingSkeleton";

interface Props {
  coding: PercentSkill[] | undefined;
}

export default function Coding({ coding }: Props) {
  return (
    <div className="pt-11 pb-4 grid grid-cols-2 gap-y-16 gap-x-10">
      {coding ? (
        coding.map((b: PercentSkill) => (
          <div key={b.id} className="text-center">
            <div
              className="radial-progress text-main-orange text-2xl"
              style={
                { "--value": b.percent, "--size": "9rem" } as React.CSSProperties
              }
            >
              <span className="text-gray-300">{b.percent}%</span>
            </div>
            <p className="text-2xl text-gray-300 mt-2.5">{b.name}</p>
          </div>
        ))
      ) : (
        <>
          <CodingSkeleton />
          <CodingSkeleton />
          <CodingSkeleton />
          <CodingSkeleton />
        </>
      )}
    </div>
  );
}
