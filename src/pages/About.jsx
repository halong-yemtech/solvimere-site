import { Link } from "react-router-dom";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Button } from "../components/Chrome";
import { PageCta, PageHero, RichTitle, SectionHead, StatRow } from "../components/Story";

export default function About() {
  const page = usePageContent("about", pageDefaults.about);
  const aboutStats = page.stats;
  const aboutValues = page.values;
  const journey = page.journey;
  const presence = page.presence;
  return (
    <main className="page-main">
      <div className="wrap">
        <PageHero
          documentTitle="About Solvimere"
          eyebrow={page.hero.eyebrow}
          title={<RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />}
          lede={page.hero.lede}
          actions={
            <>
              <Button href="/products">Our products</Button>
              <Button href="/#contact" variant="ghost">
                Get in touch
              </Button>
            </>
          }
        />

        <section className="about-split page-section">
          <div>
            <SectionHead
              kicker="Our mission and vision"
              title={
                <>
                  Building intelligent solutions for a <em>smarter tomorrow.</em>
                </>
              }
              lede="Our mission is to empower businesses with AI-powered software, automation, and digital solutions that solve real-world challenges and create lasting value."
            />
            <div className="mission-grid">
              <article>
                <h3>Our mission</h3>
                <p>{page.mission}</p>
              </article>
              <article>
                <h3>Our vision</h3>
                <p>{page.vision}</p>
              </article>
            </div>
            <ul className="skill-row value-row">
              {aboutValues.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </div>
          <figure className="about-portrait">
            <img src={page.photos.portrait} alt="Solvimere team working together" />
          </figure>
        </section>

        <section className="page-section" id="team-story">
          <SectionHead
            kicker="Our team"
            title={
              <>
                Builders, creators, and <em>problem solvers.</em>
              </>
            }
            lede="Software engineers, designers, AI specialists, and strategists, united by a shared goal: technology that makes a real difference."
            aside={
              <Button href="/team" variant="ghost" className="slim">
                Meet the team
              </Button>
            }
          />
          <StatRow items={aboutStats} />
        </section>

        <section className="page-section" id="journey">
          <SectionHead
            kicker="Our journey"
            title={
              <>
                From an idea to a growing <em>technology company.</em>
              </>
            }
            lede="What started as a small team with a big vision has grown into a technology company helping businesses with AI, automation, and digital solutions."
          />
          <ol className="timeline">
            {journey.map(([year, text]) => (
              <li key={year}>
                <strong>{year}</strong>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="page-section presence">
          <div className="presence-copy">
            <SectionHead
              kicker="Our global presence"
              title={
                <>
                  Rooted in Singapore. <em>Connected to the world.</em>
                </>
              }
              lede="Headquarters are in Singapore, with a growing team and partners across the globe. We work with businesses from different regions and industries."
            />
            <ul className="presence-list">
              <li>
                <strong>Singapore</strong>
                <span>Headquarters</span>
              </li>
              <li>
                <strong>Remote</strong>
                <span>Global team</span>
              </li>
              <li>
                <strong>Partner network</strong>
                <span>APAC, US, and EU</span>
              </li>
            </ul>
            <Link className="text-link" to="/#contact">
              Contact us
            </Link>
          </div>
          <div className="presence-grid">
            {presence.map(([region, note]) => (
              <article key={region}>
                <h3>{region}</h3>
                <p>{note}</p>
              </article>
            ))}
            <figure>
              <img src={page.photos.presence} alt="Solvimere colleagues in the studio" />
            </figure>
          </div>
        </section>

        <PageCta
          title={
            <>
              Technology for a smarter, <em>stronger tomorrow.</em>
            </>
          }
          body="Ready to turn your business challenges into intelligent digital solutions?"
        />
      </div>
    </main>
  );
}
