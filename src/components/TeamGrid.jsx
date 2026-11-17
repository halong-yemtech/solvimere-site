import { useEffect, useRef, useState } from "react";
import { pageDefaults } from "../cms/defaults";
import { usePageContent, useTeamMembers } from "../cms/Content";
import { TeamActions, portfolioLinkProps } from "./TeamPortfolio";

export function TeamGrid() {
  const page = usePageContent("team", pageDefaults.team);
  const team = useTeamMembers(page.members);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.18 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!team.length) return null;

  return (
    <div ref={ref} className={`team-grid team-reveal is-compact ${visible ? "is-in" : ""}`}>
      {team.map((person, index) => (
        <article key={person.id || person.name} className="team-card" style={{ "--i": index }}>
          <a
            {...portfolioLinkProps(person)}
            className="team-card-hit"
            aria-label={`${person.name}, ${person.roles[0]}: view portfolio (opens in a new tab)`}
          >
            <div className="team-photo">
              <img src={person.image} alt="" style={{ "--avatar-scale": person.avatarScale || 1 }} />
              <div className="team-on-photo">
                <h3>{person.name}</h3>
              </div>
            </div>
            <div className="team-copy">
              <p className="team-role">{person.roles.join(" · ")}</p>
            </div>
          </a>
          <TeamActions person={person} />
        </article>
      ))}
    </div>
  );
}
