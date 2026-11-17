import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Button } from "../components/Chrome";
import { PageCta, PageHero, RichTitle, SectionHead, StatRow } from "../components/Story";

export default function Cases() {
  const page = usePageContent("case-studies", pageDefaults["case-studies"]);
  const caseStats = page.stats;
  const caseStudies = page.studies;
  const [featured, ...rest] = caseStudies;

  return (
    <main className="page-main">
      <div className="wrap">
        <PageHero
          documentTitle="Case Studies | Solvimere"
          eyebrow={page.hero.eyebrow}
          title={<RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />}
          lede={page.hero.lede}
          actions={
            <>
              <a className="btn btn-primary" href="#stories">
                <span>Explore results</span>
                <span className="btn-ico">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <Button href="/#contact" variant="ghost">
                Book a strategy call
              </Button>
            </>
          }
        >
          <StatRow items={caseStats} />
        </PageHero>

        <section className="page-section" id="stories">
          <SectionHead
            kicker="Featured results"
            title={
              <>
                Real transformation, measured in <em>business impact.</em>
              </>
            }
            lede="Every engagement is shaped around the client’s goals, data, and operational realities."
          />

          {featured ? (
            <article className="feature-band case-feature rise-card">
              <div className="shot">
                <img src={featured.image} alt="" />
              </div>
              <div>
                <p className="kicker">{featured.category}</p>
                <h2>{featured.title}</h2>
                <p>{featured.summary}</p>
                <ul className="metric-row">
                  {featured.metrics.map(([value, label]) => (
                    <li key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ) : null}

          <div className="catalog case-grid">
            {rest.map((item, index) => (
              <article key={item.title} className="catalog-card rise-card" style={{ "--i": index }}>
                <div className="shot">
                  <img src={item.image} alt="" />
                </div>
                <div className="catalog-copy">
                  <p className="kicker">{item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <ul className="metric-row">
                    {item.metrics.map(([value, label]) => (
                      <li key={label}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <PageCta
          title={
            <>
              Need a smarter path to <em>growth?</em>
            </>
          }
          body="Tell us the outcome the system should produce."
          label="Start your project"
        />
      </div>
    </main>
  );
}
