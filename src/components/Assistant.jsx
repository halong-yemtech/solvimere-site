import { useState } from "react";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Booking } from "./Booking";
import { MessageForm } from "./MessageForm";
import { Icon } from "./Icons";

/** An icon-only button with a label for screen readers and a hover tooltip. */
function IconButton({ icon, label, onClick, primary = false, tipSide = "left" }) {
  return (
    <button
      type="button"
      className={`icon-btn ${primary ? "is-primary" : ""}`}
      aria-label={label}
      data-tip={label}
      data-tip-side={tipSide}
      onClick={onClick}
    >
      <Icon name={icon} />
    </button>
  );
}

const PANELS = {
  message: { title: "Send us a message", icon: "chat" },
  book: { title: "Book a meeting", icon: "calendar" },
};

/** Bottom-right contact widget: send a message, or book a meeting. */
export function Assistant() {
  const settings = usePageContent("settings", pageDefaults.settings);
  const [panel, setPanel] = useState(null); // null | "message" | "book"
  const email = settings.email || "hello@solvimere.com";
  const other = panel === "book" ? "message" : "book";

  if (!panel) {
    return (
      <div className="assistant-launch" role="toolbar" aria-label="Contact Solvimere">
        <IconButton icon="chat" label="Send us a message" primary onClick={() => setPanel("message")} />
        <IconButton icon="calendar" label="Book a meeting" onClick={() => setPanel("book")} />
      </div>
    );
  }

  return (
    <section className="assistant-chat" aria-label={PANELS[panel].title}>
      <header>
        <div>
          <p>Solvimere</p>
          <strong>{PANELS[panel].title}</strong>
        </div>
        <div className="assistant-tools">
          <IconButton
            icon={PANELS[other].icon}
            label={PANELS[other].title}
            tipSide="below"
            onClick={() => setPanel(other)}
          />
          <IconButton icon="close" label="Close" tipSide="below" onClick={() => setPanel(null)} />
        </div>
      </header>
      <div className="assistant-body">
        {panel === "book" ? (
          <Booking contactEmail={email} />
        ) : (
          <MessageForm contactEmail={email} onBook={() => setPanel("book")} />
        )}
      </div>
    </section>
  );
}
