import { Link } from "react-router-dom";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Icon } from "../components/Icons";
import { Button } from "../components/Chrome";
import { PageCta, PageHero, RichTitle, SectionHead } from "../components/Story";

export default function Industries() {
  const page = usePageContent("industries", pageDefaults.industries);
  const industries = page.items;
  const industryStrengths = page.strengths;
  const industryResults = page.results;
  return (
    <main className="page-main">
      <div className="wrap">
        <PageHero
          documentTitle="Industries | Solvimere"
          eyebrow={page.hero.eyebrow}
          title={<RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />}
          lede={page.hero.lede}
          actions={
            <>
              <a className="btn btn-primary" href="#industries">
                <span>Explore industries</span>
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

        <section className="page-section" id="industries">
          <SectionHead
            kicker="Our industries"
            title={
              <>
                Solving real challenges across <em>key industries.</em>
              </>
            }
            lede="We partner with businesses to deliver intelligent solutions that drive efficiency, innovation, and sustainable growth."
          />
          <div className="catalog cols-4">
            {industries.map((item, index) => (
              <article key={item.title} className="catalog-card rise-card" style={{ "--i": index }}>
                <div className="shot short">
                  <img src={item.image} alt="" />
                  <span className="shot-ico">
                    <Icon name={item.icon} />
                  </span>
                </div>
                <div className="catalog-copy">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <Link to="/case-studies">See the work</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-section">
          <SectionHead
            kicker="Why Solvimere"
            title={
              <>
                Industry expertise. <em>Technology-driven results.</em>
              </>
            }
            lede="We combine industry knowledge with current technology to build solutions that fit the work and show up in the numbers."
          />
          <div className="why-grid">
            {industryStrengths.map((item, index) => (
              <article key={item.title}>
                <p className="index-no">0{index + 1}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-section">
          <SectionHead
            kicker="Industry insights"
            title={
              <>
                Real results <em>across industries.</em>
              </>
            }
            lede="A sample of the outcomes published with the work."
            aside={
              <Button href="/case-studies" variant="ghost" className="slim">
                View all case studies
              </Button>
            }
          />
          <div className="need-grid">
            {industryResults.map((item) => (
              <article key={item.title} className="result-card">
                <p className="kicker">{item.category}</p>
                <h3>{item.title}</h3>
                <ul className="metric-row">
                  {item.metrics.map(([value, label]) => (
                    <li key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <PageCta
          title={
            <>
              Let’s create intelligent solutions for <em>your industry.</em>
            </>
          }
          body="Talk to our team and discover how Solvimere can help you achieve your goals."
          extra={
            <Button href="/products" variant="ghost">
              Explore our products
            </Button>
          }
        />
      </div>
    </main>
  );
}
