import Testimonial from "../Testimonial";
import Title from "../Title";
import MyResume from "./myResume/MyResume";
import Skills from "./skills/Skills";
import { useSite } from "../SiteProvider";

export default function Resume() {
  const { profile, resume } = useSite();

  return (
    <section className="h-full overflow-y-scroll myScroll">
      <Title name="resume" />
      <MyResume />

      <Title name="skills" />
      <>
        <Skills />
      </>

      {profile.quote && (
        <>
          <Title name="quote" />
          <>
            <Testimonial testimonial={profile.quote} />
          </>
        </>
      )}
    </section>
  );
}
