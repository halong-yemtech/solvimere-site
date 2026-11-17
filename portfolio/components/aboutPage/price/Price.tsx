import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import MyIcon from "../../MyIcon";
import type { PricingPlanData } from "@/lib/siteTypes";

interface Props {
  plan: PricingPlanData;
}

export default function Price({ plan }: Props) {
  return (
    <div className="py-10 px-12 flex flex-col items-center">
      <MyIcon Icon={plan.icon} />
      <h3 className="text-[1.6rem] text-gray-300 font-semibold capitalize mt-4 tracking-wider">{plan.name}</h3>
      <div className="amount inline-flex items-center gap-2.5 my-5">
        <sup className="text-[1.6rem] text-gray-300">$</sup>
        <span className="text-[4.2rem] text-gray-300 font-semibold">{plan.price}</span>
        {plan.period && <sub className="text-[1.6rem] text-gray-300 mt-4">{plan.period}</sub>}
      </div>
      {plan.features.map((f) => (
        <p key={f.id} className={`text-2xl text-gray-400 mb-5 ${f.included ? "" : "line-through decoration-2"}`}>
          {f.feature}
        </p>
      ))}

      <div className="w-full h-[0.1rem] lineLeft mt-4 mb-9"></div>

      {plan.orderUrl && (
        <span className="w-full mb-2 flex justify-center items-center gap-4 text-gray-300 font-semibold uppercase cursor-pointer group">
          <Link
            href={plan.orderUrl}
            rel="noreferrer"
            target="_blank"
            className="group-hover:mx-2 group-hover:text-main-orange transition-all duration-300 tracking-wide text-[1.3rem]"
          >
            order now
          </Link>
          <FaChevronRight className="text-2xl group-hover:text-main-orange transition-all duration-300" />
        </span>
      )}
    </div>
  );
}
