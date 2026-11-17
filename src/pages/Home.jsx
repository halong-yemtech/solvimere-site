import { useEffect, useMemo, useState } from "react";
import {
  industries,
  interests,
  services,
  stack,
  stats,
  steps,
} from "../data";
import { Icon } from "../components/Icons";
import { Button, Eyebrow, Orbit } from "../components/Chrome";
import { TeamGrid } from "../components/TeamGrid";
import { Reviews } from "../components/Reviews";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { RichTitle } from "../components/Story";

function useCount(target, active, decimals = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    const start = performance.now();
    const duration = 1400;
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return decimals ? value.toFixed(decimals) : Math.round(value);
}

function Stat({ item, active }) {
  const shown = useCount(item.value, active, item.decimals || 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = c * (active ? item.ring : 0);
  return (
    <div className="stat">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} className="ring-track" />
        <circle
          cx="50"
          cy="50"
          r={r}
          className="ring-value"
          style={{ strokeDasharray: `${dash} ${c}` }}
        />
      </svg>
      <strong>
        {shown}
        {item.suffix}
      </strong>
      <span>{item.label}</span>
    </div>
  );
}

function Marquee({ items, reverse = false, render }) {
  const row = [...items, ...items];
  return (
    <div className={`marquee ${reverse ? "is-reverse" : ""}`}>
      <div className="marquee-track">
        {row.map((item, index) => (
          <div key={index}>{render(item, index)}</div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const home = usePageContent("home", pageDefaults.home);
  const { photos, avatars, works, testimonials, reviews, insights } = home;
  const [workIndex, setWorkIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [statsOn, setStatsOn] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!works.length) return undefined;
    const timer = setInterval(() => setWorkIndex((i) => (i + 1) % works.length), 4200);
    return () => clearInterval(timer);
  }, [works.length]);

  useEffect(() => {
    const el = document.getElementById("expertise");
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsOn(true);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const quote = testimonials[quoteIndex];

  // The large photo must show the client being quoted. A photo shared by several
  // testimonials is a generic placeholder, not that client, so use their own portrait.
  const storyPhotos = useMemo(() => {
    const uses = new Map();
    testimonials.forEach((t) => t.photo && uses.set(t.photo, (uses.get(t.photo) || 0) + 1));
    return testimonials.map((t) =>
      t.photo && (uses.get(t.photo) === 1 || testimonials.length === 1) ? t.photo : t.avatar || t.photo || photos.session
    );
  }, [testimonials, photos.session]);

  // Preload every client's photo so switching slides doesn't flash an empty frame.
  useEffect(() => {
    storyPhotos.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [storyPhotos]);

  function onSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("website")) return;
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) {
      setError("Add your name, email, and a short note about the system.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email so we can reply.");
      return;
    }
    setError("");
    setSent(true);
    event.currentTarget.reset();
  }

  return (
    <main>
      <section id="home" className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap hero-copy">
          <div className="trust-pill">
            <span className="avatar-stack">
              {avatars.map((person) => (
                <img key={person.image} src={person.image} alt="" />
              ))}
            </span>
            <span>
              Trusted by <strong>40+ enterprise partners</strong>
            </span>
          </div>
          <h1>
            <RichTitle title={home.hero.title} emphasis={home.hero.emphasis} />
          </h1>
          <p>{home.hero.lede}</p>
          <div className="hero-actions">
            <Button href="#contact">Start a project</Button>
            <Button href="#work" variant="ghost">
              See our work
            </Button>
          </div>
        </div>
        <div className="wrap hero-frame">
          <img src={photos.hero} alt="The Solvimere team gathered around a laptop" />
          <div className="float-card left">
            <span className="mini-ico">
              <Icon name="pulse" />
            </span>
            <span>
              <strong>38% fewer escaped defects</strong>
              Precision Inspection · Computer vision
            </span>
          </div>
          <a className="float-card center" href="#work">
            <span className="mini-ico hot">
              <Icon name="pulse" />
            </span>
            See it in production
          </a>
          <div className="float-card right">
            <span className="mini-ico">
              <Icon name="shield" />
            </span>
            <span>
              <strong>99.9% uptime</strong>
              Across operated platforms
            </span>
          </div>
        </div>
      </section>

      <Reviews content={reviews} />

      <section id="about" className="section about">
        <div className="wrap about-copy">
          <Eyebrow>Who we are</Eyebrow>
          <h2>
            Solvimere is a modern software studio.{" "}
            <span>
              We help operators move faster by pairing people who know the domain with technology that
              belongs in production, and processes that keep both honest.
            </span>
          </h2>
          <Button href="#process">How we work</Button>
        </div>
        <div className="wrap about-photos">
          <figure>
            <img
              src={photos.aboutLeft}
              alt="Solvimere consultant walking through metrics on a whiteboard"
            />
            <div className="years-badge">
              <strong>15+</strong>
              <span>Years of delivery</span>
            </div>
          </figure>
          <Orbit text="BUILD • INNOVATE • SCALE • SHIP • " href="#services" />
          <figure>
            <img
              src={photos.aboutRight}
              alt="Solvimere team working together in the studio"
            />
          </figure>
        </div>
      </section>

      <section className="section team-band">
        <div className="wrap">
          <Eyebrow>The team</Eyebrow>
          <h2 className="center-title">
            Meet the people behind <em>Solvimere</em>
          </h2>
          <p className="team-lead">
            Curious minds. Different disciplines. One shared purpose.
          </p>
          <TeamGrid />
          <div className="team-band-action">
            <Button href="/team">Meet the team</Button>
          </div>
        </div>
      </section>

      <section id="services" className="section services">
        <div className="wrap">
          <Eyebrow>Solutions that ship</Eyebrow>
          <h2 className="center-title">
            Smart Services For
            <br />
            <em>Real Operations</em>
          </h2>
          <div className="service-grid">
            <div className="service-col">
              {services
                .filter((item) => item.side === "left")
                .map((item) => (
                  <ServiceCard key={item.title} item={item} />
                ))}
            </div>
            <figure className="service-portrait">
              <img src={photos.engineer} alt="Solvimere engineer" />
              <figcaption>
                <small>From discovery to operations</small>
                <strong>8–16 weeks to first release</strong>
              </figcaption>
            </figure>
            <div className="service-col">
              {services
                .filter((item) => item.side === "right")
                .map((item) => (
                  <ServiceCard key={item.title} item={item} />
                ))}
            </div>
          </div>
          <div className="partner-banner">
            <div className="banner-people">
              <span className="avatar-stack">
                {avatars.map((person) => (
                  <img key={person.image} src={person.image} alt="" />
                ))}
              </span>
              <span className="plus-badge">40+</span>
              <span>
                <strong>120+ systems</strong>
                Shipped to production
              </span>
            </div>
            <p>
              Join <em>40+</em> Enterprise Partners Shipping With Solvimere
            </p>
            <Button href="#contact">Explore Our Solutions</Button>
          </div>
        </div>
      </section>

      <section id="process" className="section process">
        <div className="wrap">
          <Eyebrow>Built to work for you</Eyebrow>
          <h2 className="center-title">
            Our Process, <em>Your Solution</em>
          </h2>
          <div className="process-layout">
            <div className="steps">
              {steps.map((step) => (
                <article key={step.title}>
                  <span className="ico-bubble">
                    <Icon name={step.icon} />
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="process-visual" aria-label="An Solvimere engineer writing code">
              <svg viewBox="0 0 600 600" className="process-svg" role="img">
                <defs>
                  <clipPath id="process-shape">
                    <path d="M92,165 H318 A22,22 0 0 1 340,187 V478 A22,22 0 0 1 318,500 H240 A170,170 0 0 1 70,330 V187 A22,22 0 0 1 92,165 Z" />
                    <path d="M272,50 H370 A170,170 0 0 1 540,220 V428 A22,22 0 0 1 518,450 H272 A22,22 0 0 1 250,428 V72 A22,22 0 0 1 272,50 Z" />
                  </clipPath>
                  <linearGradient id="process-shade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#000" stopOpacity="0.05" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
                <circle cx="330" cy="280" r="210" className="process-orbit" />
                <circle cx="150" cy="180" r="7" className="process-dot" />
                <circle cx="520" cy="230" r="7" className="process-dot" />
                <circle cx="470" cy="470" r="6" className="process-dot" />
                <g clipPath="url(#process-shape)">
                  <image href={photos.process} x="40" y="20" width="540" height="520" preserveAspectRatio="xMidYMid slice" />
                  <rect x="40" y="20" width="540" height="520" fill="url(#process-shade)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div className="chip-lanes">
          <Marquee
            items={industries}
            render={(item) => (
              <span className="chip">
                <span>
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </span>
            )}
          />
          <Marquee
            items={industries}
            reverse
            render={(item) => (
              <span className="chip">
                <span>
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </span>
            )}
          />
          <Marquee
            items={stack}
            render={([id, label]) => (
              <span className="chip">
                <span className="skill">
                  {id === "lc" ? (
                    "LC"
                  ) : (
                    <img src={`https://skillicons.dev/icons?i=${id}`} alt="" />
                  )}
                </span>
                {label}
              </span>
            )}
          />
          <Marquee
            items={stack}
            reverse
            render={([id, label]) => (
              <span className="chip">
                <span className="skill">
                  {id === "lc" ? (
                    "LC"
                  ) : (
                    <img src={`https://skillicons.dev/icons?i=${id}`} alt="" />
                  )}
                </span>
                {label}
              </span>
            )}
          />
        </div>
      </section>

      <section id="work" className="section work">
        <div className="wrap work-head">
          <div>
            <Eyebrow>Our work in action</Eyebrow>
            <h2>
              Discover Our <em>Recent Work</em>
            </h2>
          </div>
          <Button href="#contact">Explore Our Work</Button>
        </div>
        <div className="carousel" aria-label="Recent case studies">
          {works.map((item, index) => {
            let offset = index - workIndex;
            if (offset > works.length / 2) offset -= works.length;
            if (offset < -works.length / 2) offset += works.length;
            const active = offset === 0;
            return (
              <article
                key={item.title}
                className={active ? "is-active" : ""}
                style={{
                  transform: `translateX(${offset * 104}%) scale(${active ? 1 : 0.9})`,
                  opacity: Math.abs(offset) > 1 ? 0 : 1,
                  zIndex: active ? 3 : 1,
                }}
              >
                <img src={item.image} alt={item.title} />
                {active && (
                  <>
                    <a className="work-go" href="#contact" aria-label={`Request the full ${item.title} case study`}>
                      <ArrowIcon />
                    </a>
                    <div className="work-label">
                      <small>{item.category}</small>
                      <strong>{item.title}</strong>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section id="expertise" className="section expertise">
        <div className="wrap expertise-grid">
          <figure>
            <img src={photos.expertise} alt="Developer working on a machine learning platform" />
            <figcaption className="code-pill">
              <Icon name="code" /> Production-grade code
            </figcaption>
            <div className="launch-pill">
              <small>Typical engagement</small>
              <strong>8–16 weeks to launch</strong>
            </div>
          </figure>
          <div>
            <Eyebrow>Backed by real delivery</Eyebrow>
            <h2>
              Deep Expertise In
              <br />
              <em>Production Software</em>
            </h2>
            <p>
              Flagship AI and vision work sits on the same engineering discipline we use for products,
              platforms, and the teams that run them.
            </p>
            <div className="stats">
              {stats.map((item) => (
                <Stat key={item.label} item={item} active={statsOn} />
              ))}
            </div>
            <Button href="#contact">Start a project</Button>
          </div>
        </div>
      </section>

      <section id="testimonials" className="section testimonials">
        <div className="wrap">
          <div className="stories">
            <article className="story-intro">
              <div className="story-text">
                <Eyebrow>Customer stories</Eyebrow>
                <h2>
                  Real teams, <em>measurable outcomes</em>
                </h2>
                <p>
                  From factory floors to clinical teams, see how clients put production AI to work with
                  Solvimere, with evaluation and monitoring built in at every step.
                </p>
                <a className="story-link" href="#contact" aria-label="Start a project">
                  <Icon name="arrow" />
                </a>
              </div>
              <figure className="story-photo" key={quote.name}>
                <img src={storyPhotos[quoteIndex]} alt={quote.name} />
                <span className="quote-badge">
                  <Icon name="quote" />
                </span>
              </figure>
            </article>
            <article className="story-quote">
              <div className="person">
                <img src={quote.avatar} alt={quote.name} />
                <span>
                  <strong>{quote.name}</strong>
                  {quote.role}
                </span>
              </div>
              <div className="stars" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m10 1.8 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4L5.7 15.4l.9-5L2.9 7l5-.6L10 1.8Z" />
                  </svg>
                ))}
              </div>
              <blockquote key={quote.name}>“{quote.quote}”</blockquote>
              <div className="quote-foot">
                <span className="story-count">
                  {String(quoteIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
                </span>
                <div className="quote-nav">
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() => setQuoteIndex((i) => (i + testimonials.length - 1) % testimonials.length)}
                  >
                    <Icon name="chevL" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    className="is-ghost"
                    onClick={() => setQuoteIndex((i) => (i + 1) % testimonials.length)}
                  >
                    <Icon name="chev" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="insights" className="section insights">
        <div className="wrap">
          <Eyebrow>Insights that drive delivery</Eyebrow>
          <h2 className="center-title">
            News, Notes And <em>Expert Advice</em>
          </h2>
          <div className="insight-grid">
            {insights.map((item) => (
              <article key={item.title}>
                <div className="insight-photo">
                  <img src={item.image} alt={item.title} />
                  <div className="date-badge">
                    <strong>{item.day}</strong>
                    <span>{item.month}</span>
                    <small>{item.year}</small>
                  </div>
                </div>
                <div className="insight-body">
                  <p className="meta">
                    <span>
                      <Icon name="tag" /> {item.tag}
                    </span>
                    <span>
                      <Icon name="clock" /> {item.date}
                    </span>
                  </p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <Button href="#contact" className="slim">
                    Read more
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap cta-card">
          <div>
            <a className="cta-arrow" href="#contact" aria-label="Start a project">
              <ArrowIcon />
            </a>
            <h2>
              LET’S BUILD
              <br />
              <em>TOGETHER</em>
            </h2>
            <p>
              Tell us what the system should see, decide, or automate. We reply with a clear next step,
              usually within one business day. <a href="mailto:hello@solvimere.com">hello@solvimere.com</a>
            </p>
          </div>
          <img src={photos.cta} alt="" />
          <Orbit text="START A PROJECT • SHIP WITH US • " href="#contact" />
        </div>
      </section>

      <section id="contact" className="section contact">
        <div className="wrap contact-grid">
          <div>
            <Eyebrow>Start a project</Eyebrow>
            <h2>
              Tell Us What
              <br />
              You Need <em>Built</em>
            </h2>
            <p>
              Share the cameras, data, product surface, or internal system you want to make smarter. We
              typically reply within one business day.
            </p>
            <div className="info-cards">
              <article>
                <span className="ico-bubble">
                  <Icon name="pin" />
                </span>
                <span>
                  <small>Web</small>
                  <a href="https://solvimere.com">solvimere.com</a>
                </span>
              </article>
              <article>
                <span className="ico-bubble">
                  <Icon name="mail" />
                </span>
                <span>
                  <small>Email</small>
                  <a href="mailto:hello@solvimere.com">hello@solvimere.com</a>
                </span>
              </article>
            </div>
          </div>
          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <div className="form-row">
              <label>
                Name
                <input name="name" placeholder="Alex Rivera" autoComplete="name" />
              </label>
              <label>
                Email
                <input name="email" type="email" placeholder="alex@company.com" autoComplete="email" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Company
                <input name="company" placeholder="Studio, lab, or enterprise team" autoComplete="organization" />
              </label>
              <label>
                Interest
                <select name="topic" defaultValue="">
                  <option value="" disabled>
                    What can we help with?
                  </option>
                  {interests.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Project
              <textarea name="message" rows="5" placeholder="What should the system see, decide, or automate?" />
            </label>
            <label className="hp">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            {error && <p className="form-error">{error}</p>}
            {sent && <p className="form-ok">Message ready. We’ll reply within one business day.</p>}
            <Button type="submit" className="form-submit">Send message</Button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ item }) {
  return (
    <article className="service-card">
      <span className="ico-bubble">
        <Icon name={item.icon} />
      </span>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <Button href="#contact" className="slim dark-ico">
        Read More
      </Button>
    </article>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}
