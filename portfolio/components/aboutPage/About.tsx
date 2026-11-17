"use client";

import AboutMe from "./aboutMe/AboutMe";
import BrandLogos from "./brandLogo/BrandLogos";
import Facts from "./fact/Facts";
import MyServices from "./service/MyServices";
import Prices from "./price/Prices";
import Testimonials from "./testimonial/Testimonials";
import Title from "../Title";
import { useSite } from "../SiteProvider";
import { EditableProfileArea, SectionTools } from "../edit/Editable";

export default function About() {
  const { services, pricingPlans, clients, testimonials, facts } = useSite();

  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title name="about me" />
      <EditableProfileArea tab="About me" label="Edit bio">
        <AboutMe />
      </EditableProfileArea>

      <Title
        name="my services"
        actions={
          <SectionTools slug="services" title="service" items={services.map((s) => ({ id: s.id, label: s.title }))} />
        }
      />
      <MyServices />

      <Title
        name="pricing"
        actions={
          <SectionTools
            slug="pricing-plans"
            title="pricing plan"
            items={pricingPlans.map((p) => ({ id: p.id, label: p.name }))}
          />
        }
      />
      <Prices />

      <Title
        name="clients"
        actions={
          <SectionTools slug="clients" title="client" items={clients.map((c) => ({ id: c.id, label: c.name }))} />
        }
      />
      <BrandLogos />

      <Title
        name="testimonials"
        actions={
          <SectionTools
            slug="testimonials"
            title="testimonial"
            items={testimonials
              .filter((t) => typeof t.id === "number")
              .map((t) => ({ id: t.id as number, label: t.name }))}
          />
        }
      />
      <Testimonials />

      <Title
        name="fun facts"
        actions={
          <SectionTools slug="facts" title="fun fact" items={facts.map((f) => ({ id: f.id, label: f.description }))} />
        }
      />
      <Facts />
    </section>
  );
}
