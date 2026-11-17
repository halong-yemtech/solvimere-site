import Typewriter from "typewriter-effect";

const span = (text: string) =>
  `<span style="color: rgb(var(--accent)); font-size: 14px; font-weight: 400;">${text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</span>`;

export default function Typing({ titles }: { titles: string[] }) {
  if (titles.length === 0) return <div className="h-8" />;

  return (
    <div className="text-center h-8">
      <Typewriter
        // Restart the animation if the titles change.
        key={titles.join("|")}
        onInit={(typewriter) => {
          for (const title of titles) {
            typewriter.typeString(span(title)).pauseFor(3500).deleteAll(17);
          }
          typewriter.start();
        }}
        options={{
          autoStart: true,
          loop: true,
          cursor: "",
          delay: 17,
        }}
      />
    </div>
  );
}
