import { useMemo, useState } from "react";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Icon } from "../components/Icons";
import { Filters, PageHero, RichTitle, SectionHead } from "../components/Story";

function matches(item, topic, query) {
  const topicOk = topic === "All" || item.topic === topic;
  const haystack = `${item.title} ${item.description} ${item.topic}`.toLowerCase();
  return topicOk && (!query || haystack.includes(query));
}

export default function Resources() {
  const page = usePageContent("resources", pageDefaults.resources);
  const articles = page.articles;
  const featuredArticle = page.featured;
  const resourceTopics = page.topics;
  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () => articles.filter((item) => matches(item, topic, needle)),
    [topic, needle],
  );
  const showFeatured = matches(featuredArticle, topic, needle);

  const subscribe = (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    const subject = encodeURIComponent("Subscribe to Solvimere resources");
    const body = encodeURIComponent(`Please add ${email} to resource updates.`);
    window.location.href = `mailto:hello@solvimere.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="page-main">
      <div className="wrap">
        <PageHero
          documentTitle="Resources | Solvimere"
          eyebrow={page.hero.eyebrow}
          title={<RichTitle title={page.hero.title} emphasis={page.hero.emphasis} />}
          lede={page.hero.lede}
          actions={
            <label className="search-field">
              <Icon name="search" />
              <input
                type="search"
                value={query}
                placeholder="Search articles"
                aria-label="Search articles"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          }
        />

        <section className="page-section" id="topics">
          <SectionHead
            kicker="Browse by topic"
            title={
              <>
                Find the piece that matches <em>the work.</em>
              </>
            }
            lede="Industry notes, product updates, and practical guides."
          />
          <Filters
            label="Filter articles by topic"
            options={resourceTopics}
            value={topic}
            onChange={setTopic}
            counts
          />
        </section>

        {showFeatured ? (
          <article className="feature-band">
            <div>
              <p className="kicker">Featured article · {featuredArticle.topic}</p>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.description}</p>
              <a className="text-link" href="#articles">
                Read with the latest articles
              </a>
            </div>
            <div className="shot">
              <img src={featuredArticle.image} alt="" />
            </div>
          </article>
        ) : null}

        <section className="page-section" id="articles">
          <SectionHead
            kicker="Latest articles"
            title="From our blog"
            aside={
              <p className="result-count">
                {visible.length} {visible.length === 1 ? "article" : "articles"}
              </p>
            }
          />
          {visible.length ? (
            <div className="catalog">
              {visible.map((item, index) => (
                <article key={item.title} className="catalog-card rise-card" style={{ "--i": index }}>
                  <div className="shot short">
                    <img src={item.image} alt="" />
                  </div>
                  <div className="catalog-copy">
                    <p className="kicker">{item.topic}</p>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <time dateTime={item.date}>{item.date}</time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-note">
              <h3>No articles match that search.</h3>
              <p>Try another topic, or clear the filter.</p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQuery("");
                  setTopic("All");
                }}
              >
                <span>Show all articles</span>
                <span className="btn-ico">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17 17 7" />
                    <path d="M9 7h8v8" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </section>

        <form className="subscribe" onSubmit={subscribe}>
          <div>
            <p className="kicker">Stay updated</p>
            <h2>
              Get the latest insights, <em>straight to your inbox.</em>
            </h2>
            <p>Join the list for new articles, product updates, and industry notes.</p>
          </div>
          <label>
            Email
            <input name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
          </label>
          <button className="btn btn-primary" type="submit">
            <span>Subscribe</span>
            <span className="btn-ico">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17 17 7" />
                <path d="M9 7h8v8" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
