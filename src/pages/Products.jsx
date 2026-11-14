import { useMemo, useState } from "react";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Button } from "../components/Chrome";
import { Filters, PageCta, PageHero, RichTitle, SectionHead, StatRow } from "../components/Story";

export default function Products() {
  const page = usePageContent("products", pageDefaults.products);
  const products = page.items;
  const productStats = page.stats;
  const productFilters = ["All", ...new Set(products.map((item) => item.category))];
  const [filter, setFilter] = useState("All");
  const visible = useMemo(
    () => (filter === "All" ? products : products.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <main className="page-main">
      <div className="wrap">
        <PageHero
          documentTitle="Products | Solvimere"
          eyebrow={page.hero.eyebrow}
          title={<RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />}
          lede={page.hero.lede}
          actions={
            <>
              <a className="btn btn-primary" href="#catalog">
                <span>Explore products</span>
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
        >
          <StatRow items={productStats} />
        </PageHero>

        <section className="page-section" id="catalog">
          <SectionHead
            kicker="Explore our platforms"
            title={
              <>
                Connected products that work <em>together.</em>
              </>
            }
            lede="Filter the suite by the kind of work it does. Each product links out to its live project."
            aside={<p className="result-count">{visible.length} products</p>}
          />
          <Filters label="Filter products by category" options={productFilters} value={filter} onChange={setFilter} />
          <div className="catalog">
            {visible.map((item, index) => (
              <article key={item.name} className="catalog-card rise-card" style={{ "--i": index }}>
                <div className="shot">
                  <img src={item.image} alt="" />
                </div>
                <div className="catalog-copy">
                  <p className="kicker">{item.category}</p>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <ul className="skill-row">
                    {item.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                  <a href={item.href} target="_blank" rel="noreferrer">
                    View project
                  </a>
                </div>
              </article>
            ))}
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
