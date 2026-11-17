"use client";

import Testimonial from "../Testimonial";
import Title from "../Title";
import MyResume from "./myResume/MyResume";
import Skills from "./skills/Skills";
import { useSite } from "../SiteProvider";
import { EditableProfileArea, SectionTools } from "../edit/Editable";

export default function Resume() {
  const { profile, resume } = useSite();

  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title name="resume" actions={
        <SectionTools slug="resume-entries" title="resume entry" items={resume.map((r) => ({ id: r.id, label: `${r.title} (${r.type})` }))} />
      } />
      <MyResume />

      <Title name="skills" />
      <EditableProfileArea tab="Skills" label="Edit skills">
        <Skills />
      </EditableProfileArea>

      {profile.quote && (
        <>
          <Title name="quote" />
          <EditableProfileArea tab="Quote" label="Edit quote">
            <Testimonial testimonial={profile.quote} />
          </EditableProfileArea>
        </>
      )}
    </section>
  );
}
