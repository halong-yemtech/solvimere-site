import { useEffect, useState } from "react";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Button, Eyebrow } from "../components/Chrome";
import { RichTitle } from "../components/Story";
import { TeamActions, portfolioLinkProps } from "../components/TeamPortfolio";
import { useTeamMembers } from "../lib/team";

const CYCLE = 7200;

function pad(value) {
  return String(value).padStart(2, "0");
}

function StepButton({ direction, label, onClick }) {
  return (
    <button type="button" className="team-step" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={direction < 0 ? "M15 6 9 12l6 6" : "m9 6 6 6-6 6"} />
      </svg>
    </button>
  );
}

export default function Team() {
  const page = usePageContent("team", pageDefaults.team);
  const team = useTeamMembers(page.members);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (active >= team.length && team.length > 0) setActive(0);
  }, [active, team.length]);

  useEffect(() => {
    if (paused || !team.length) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = window.setTimeout(() => {
      setActive((index) => (index + 1) % team.length);
    }, CYCLE);
    return () => window.clearTimeout(id);
  }, [active, paused, team.length]);

  const person = team[active];

  const step = (direction) => {
    setActive((index) => (index + direction + team.length) % team.length);
  };

  const hold = () => setPaused(true);
  const release = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
  };

  return (
    <main className="team-page">
      <div className="wrap team-hero">
        <div className="team-glow" aria-hidden="true" />
        <Eyebrow>{page.hero.eyebrow}</Eyebrow>
        <h1>
          <RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />
        </h1>
        <p className="lede">{page.hero.lede}</p>
        <ul className="team-facts">
          <li>
            <strong>{pad(team.length)}</strong>
            <span>Specialists</span>
          </li>
          <li>
            <strong>AI</strong>
            <span>Applied systems</span>
          </li>
          <li>
            <strong>Cloud</strong>
            <span>Delivery and MLOps</span>
          </li>
          <li>
            <strong>Security</strong>
            <span>Built into the work</span>
          </li>
        </ul>
      </div>

      <div className="wrap">
        {person && (
          <article
            className="team-stage"
            key={person.id || person.name}
            aria-live="polite"
            onMouseEnter={hold}
            onMouseLeave={() => setPaused(false)}
            onFocus={hold}
            onBlur={release}
          >
            <div className="team-stage-photo">
              <img src={person.image} alt="" style={{ "--avatar-scale": person.avatarScale || 1 }} />
              <span className="team-sheen" aria-hidden="true" />
              <div className="team-on-photo">
                <h2>{person.name}</h2>
              </div>
              <TeamActions person={person} />
            </div>
            <div className="team-stage-copy">
              <p className="team-index">
                {pad(active + 1)} <span>/ {pad(team.length)}</span>
              </p>
              <p className="team-role">{person.roles.join(" · ")}</p>
              <div className="team-profile">
                {person.highlight ? (
                  <section>
                    <h3>{person.highlight.label}</h3>
                    <p>{person.highlight.text}</p>
                  </section>
                ) : null}
                {person.expertise ? (
                  <section>
                    <h3>{person.expertise.label}</h3>
                    <p>{person.expertise.text}</p>
                  </section>
                ) : null}
                {person.quote ? (
                  <blockquote>
                    <h3>Personal Quote</h3>
                    <p>{person.quote}</p>
                  </blockquote>
                ) : null}
              </div>
              {person.bio ? <p className="bio">{person.bio}</p> : null}
              <div className="team-stage-nav">
                <StepButton direction={-1} label="Previous teammate" onClick={() => step(-1)} />
                <StepButton direction={1} label="Next teammate" onClick={() => step(1)} />
                <div className="team-dots" role="tablist" aria-label="Team members">
                  {team.map((member, index) => (
                    <button
                      key={member.id || member.name}
                      type="button"
                      role="tab"
                      className={index === active ? "is-on" : ""}
                      aria-selected={index === active}
                      aria-label={member.name}
                      onClick={() => setActive(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </article>
        )}

        <p className="team-kicker">The people behind our work</p>
        <h2 className="team-roster-title">
          Curious minds. Different disciplines.
          <br />
          <em>One shared purpose.</em>
        </h2>

        <div
          className="team-grid team-roster team-reveal is-in"
          onMouseEnter={hold}
          onMouseLeave={() => setPaused(false)}
          onFocus={hold}
          onBlur={release}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              step(1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              step(-1);
            }
          }}
        >
          {team.map((member, index) => (
            <article
              key={member.id || member.name}
              className={`team-card ${index === active ? "is-active" : ""}`}
              style={{ "--i": index }}
            >
              {/* Hover/focus features the member above; a click opens their portfolio in a new tab. */}
              <a
                {...portfolioLinkProps(member)}
                className="team-card-hit"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                aria-label={`${member.name}: view portfolio (opens in a new tab)`}
              >
                <div className="team-photo">
                  <img src={member.image} alt="" style={{ "--avatar-scale": member.avatarScale || 1 }} />
                  <div className="team-on-photo">
                    <h3>{member.name}</h3>
                  </div>
                </div>
                <div className="team-copy">
                  <p className="team-role">{member.roles.join(" · ")}</p>
                  {member.bio ? <p className="bio">{member.bio}</p> : null}
                </div>
              </a>
              <TeamActions person={member} />
            </article>
          ))}
        </div>

        <div className="team-cta">
          <h2>
            Build with <em>this team</em>
          </h2>
          <p>Tell us what the system should see, decide, or automate.</p>
          <Button href="/#contact">Start a project</Button>
        </div>
      </div>
    </main>
  );
}
