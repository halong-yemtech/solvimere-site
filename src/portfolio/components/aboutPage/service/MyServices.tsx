import MyService from "./MyService";
import { useSite } from "../../SiteProvider";

export default function MyServices() {
  const { services } = useSite();

  return (
    <ul className="services grid grid-cols-1 sm:grid-cols-2 relative vCustomLine before:left-1/2 before:hidden sm:before:block before:-translate-x-1/2">
      {services.map((s, idx) => (
        <MyService
          key={s.id}
          id={s.id}
          name={s.title}
          desc={s.description}
          Icon={s.icon}
          border={idx < services.length - 2}
          last={idx === services.length - 1}
        />
      ))}
    </ul>
  );
}
