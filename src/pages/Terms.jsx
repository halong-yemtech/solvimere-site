import { terms } from "../data";

export default function Terms() {
  return (
    <main className="terms-page">
      <div className="wrap terms-hero">
        <p className="eyebrow">
          <span>+</span> Legal
        </p>
        <h1>
          Terms and <em>Conditions</em>
        </h1>
        <p className="updated">Last updated: October 8, 2026</p>
        <p className="lede">
          These Terms and Conditions (“Terms”) govern your access to and use of solvimere.com (the
          “Website”) and any services that Solvimere (“we,” “us,” or “our”) provides to you. By using
          the Website or engaging us for services, you agree to these Terms. If you do not agree, please
          do not use the Website or our services.
        </p>
      </div>
      <div className="wrap terms-layout">
        <aside>
          <p>On this page</p>
          <ol>
            {terms.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </aside>
        <article>
          {terms.map((section, index) => (
            <section key={section.id} id={section.id}>
              <h2>
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.after?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
