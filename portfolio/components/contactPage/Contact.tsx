"use client";

import Title from "../Title";
import ContactForm from "./ContactForm";
import Location from "./Location";
import { EditableProfileArea } from "../edit/Editable";

export default function Contact() {
  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title name="get in touch" />
      <EditableProfileArea tab="Contact" label="Edit contact details">
        <Location />
      </EditableProfileArea>

      <Title name="contact form" />
      <ContactForm />
    </section>
  );
}
