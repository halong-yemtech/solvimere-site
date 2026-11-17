import Price from "./Price";
import { useSite } from "../../SiteProvider";

export default function Prices() {
  const { pricingPlans } = useSite();

  return (
    <ul className="prices grid sm:grid-cols-2 grid-cols-1">
      {pricingPlans.map((plan, idx) => (
        <li
          key={plan.id}
          className={
            idx % 2 === 0 && idx !== pricingPlans.length - 1
              ? "relative vCustomLine sm:before:block before:hidden before:right-0"
              : ""
          }
        >
          <>
            <Price plan={plan} />
          </>
        </li>
      ))}
    </ul>
  );
}
