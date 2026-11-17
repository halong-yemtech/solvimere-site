import { Link } from "react-router-dom";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Icon } from "../components/Icons";
import { Button } from "../components/Chrome";
import { PageCta, PageHero, RichTitle, SectionHead } from "../components/Story";

export default function Solutions() {
  const page = usePageContent("solutions", pageDefaults.solutions);
  const solutions = page.items;
  const solutionNeeds = page.needs;
  const solutionAdvantages = page.advantages;
  const platformPoints = page.platformPoints;
  return (
    <main className="page-main">
      <div className="wrap">
        <PageHero
          documentTitle="Solutions | Solvimere"
          eyebrow={page.hero.eyebrow}
          title={<RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />}
          lede={page.hero.lede}
          actions={
            <>
              <a className="btn btn-primary" href="#solutions">
                <span>Explore our solutions</span>
                <span className="btn-ico">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <Button href="/#contact" variant="ghost">
                Talk to our team
              </Button>
            </>
          }
        />

        <section className="page-section" id="solutions">
          <SectionHead
            kicker="Our solutions"
            title={
              <>
                Comprehensive solutions for every stage of <em>your journey.</em>
              </>
            }
            lede="From intelligent automation to data-driven insights, our solutions help you work smarter, serve better, and grow faster."
          />
          <div className="catalog solution-grid">
            {solutions.map((item, index) => (
              <article key={item.title} className="solution-card rise-card" style={{ "--i": index }}>
                <span className="mini-ico">
                  <Icon name={item.icon} />
                </span>
                <p className="index-no">0{index + 1}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <Link to="/#contact">Learn more</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="page-section">
          <SectionHead
            kicker="Solutions by business need"
            title={
              <>
                Solve bigger problems with <em>intelligent technology.</em>
              </>
            }
            lede="Our solutions are designed to deliver real business outcomes across your entire operation."
          />
          <div className="need-grid">
            {solutionNeeds.map((item) => (
              <article key={item.title}>
                <span className="mini-ico">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="feature-band">
          <div className="shot">
            <img src={page.photos.feature} alt="Solvimere business automation platform" />
          </div>
          <div>
            <p className="kicker">Featured solution</p>
            <h2>
              AI business automation <em>platform</em>
            </h2>
            <p>
              Streamline operations with intelligent workflows, AI agents, and real-time insights. The platform helps
              you automate repetitive tasks, improve efficiency, and make faster decisions.
            </p>
            <ul className="check-list">
              {platformPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <Button href="/products">Explore the platform</Button>
          </div>
        </section>

        <section className="page-section">
          <SectionHead
            kicker="Why Solvimere"
            title={
              <>
                Solvimere’s solutions, <em>your advantage.</em>
              </>
            }
            lede="We combine technical depth with a business-first mindset, so the work stays innovative, scalable, and built for the long term."
          />
          <div className="why-grid">
            {solutionAdvantages.map((item) => (
              <article key={item.title}>
                <span className="mini-ico">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <PageCta
          title={
            <>
              Let’s build a smarter, more efficient <em>future.</em>
            </>
          }
          body="Talk to our team and discover how Solvimere can help you achieve your goals."
          label="Get in touch"
        />
      </div>
    </main>
  );
}
