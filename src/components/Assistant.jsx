import { useEffect, useRef, useState } from "react";
import "@tavus/widget";
import { useSiteAuth } from "../auth/SiteAuth";
import { pageDefaults } from "../cms/defaults";
import { usePageContent } from "../cms/Content";
import { Booking } from "./Booking";
import { Icon } from "./Icons";

const DEPLOYMENT_ID = "81ed903a-4a64-46e1-8ad3-701d9654201a";

const overrideConfig = {
  customization: {
    conversation: {
      modality: "video",
      enable_chat: true,
      enable_closed_captions: true,
    },
    style: {
      mode: "dark",
      style: "basic",
      boxes_radius: 3,
      field_radius: 4,
      selectors_radius: 4,
      icon_library: "lucide",
    },
    widget: {
      variant: "compact",
      position: "bottom-right",
      avatar: { type: "image" },
      text: { title: "Chat with Solvimere", btn_title: "Talk" },
    },
    preview: {
      title: "Talk with Solvimere",
      description: "Start a video conversation, or type in the chat.",
      btn_title: "Start",
      background: {
        type: "custom-image",
        url: "/images/team/hannah-reynolds.jpg",
      },
    },
  },
};

const GREETING = "Hello, I'm with Solvimere. You can talk with me, or type in the chat.";

function visitorContext(user) {
  return user
    ? `The visitor is signed in on solvimere.com as ${user.email}. They can talk or use chat.`
    : "The visitor is on solvimere.com and can talk or use chat about Solvimere's software, applied AI, and computer vision work.";
}

/**
 * Tavus answers 403 "origin_forbidden" when the site's address isn't in the deployment's
 * allowed origins, but the widget only logs it to the console. Ask once, so the visitor
 * gets a clear message instead of a call that silently never starts.
 */
let initCheck;
function checkDeployment() {
  initCheck ??= fetch(`https://tavusapi.com/v2/deployments/${DEPLOYMENT_ID}/init`)
    .then(async (res) => {
      if (res.ok) return null;
      const body = await res.json().catch(() => ({}));
      return body.code === "origin_forbidden"
        ? "Video chat isn't enabled for this website address yet."
        : "Video chat is unavailable right now.";
    })
    .catch(() => null); // network hiccup: let the widget try and report its own errors
  return initCheck;
}

/** An icon-only button with a label for screen readers and a hover tooltip. */
function IconButton({ icon, label, onClick, primary = false, active = false, disabled = false, tipSide = "left" }) {
  return (
    <button
      type="button"
      className={`icon-btn ${primary ? "is-primary" : ""} ${active ? "is-active" : ""}`}
      aria-label={label}
      aria-pressed={active || undefined}
      data-tip={label}
      data-tip-side={tipSide}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={icon} />
    </button>
  );
}

export function Assistant() {
  const widgetRef = useRef(null);
  const { user } = useSiteAuth();
  const settings = usePageContent("settings", pageDefaults.settings);
  const [panel, setPanel] = useState(null); // null | "chat" | "book"
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | starting | live
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const queue = useRef([]);
  const ready = useRef(false);
  const startWhenReady = useRef(false);
  const phaseRef = useRef("idle");
  const logRef = useRef(null);

  const setPhaseBoth = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  // Keep the collapsed widget out of the tab order and the accessibility tree.
  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return undefined;
    const sync = () => {
      const expanded = el.dataset.tavusWidgetExpanded === "true";
      el.toggleAttribute("inert", !expanded);
      if (expanded) el.removeAttribute("aria-hidden");
      else el.setAttribute("aria-hidden", "true");
      // Closed before the call connected (the widget sends no event for that).
      if (!expanded && phaseRef.current === "starting") {
        queue.current = [];
        setPhaseBoth("idle");
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["data-tavus-widget-expanded"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = widgetRef.current;
    // Methods may already be installed if the element was ready before this effect ran.
    if (typeof el?.startConversation === "function") ready.current = true;

    function onProtocol(event) {
      const detail = event.detail;
      if (detail?.event_type !== "conversation.utterance") return;
      const speech = detail.properties?.speech;
      if (detail.properties?.role === "user" || typeof speech !== "string" || !speech.trim()) return;
      setMessages((current) => [...current, { from: "solvimere", text: speech }]);
    }
    function onReady() {
      ready.current = true;
      if (startWhenReady.current) {
        startWhenReady.current = false;
        widgetRef.current?.startConversation();
      }
    }
    function onStarted() {
      setPhaseBoth("live");
      setError("");
      const waiting = queue.current.splice(0);
      waiting.forEach((text) =>
        widgetRef.current?.sendMessage({ event_type: "conversation.respond", properties: { text } })
      );
    }
    function onEnded() {
      setPhaseBoth("idle");
    }
    function fail(message) {
      startWhenReady.current = false;
      queue.current = [];
      setPhaseBoth("idle");
      setError(message);
    }
    function onError(event) {
      fail(event.detail?.message || "The assistant could not start.");
    }
    function onMode(event) {
      if (event.detail?.mode === "unavailable") fail("The assistant is busy or unavailable right now.");
    }
    document.addEventListener("tavus:protocol-message", onProtocol);
    document.addEventListener("tavus:ready", onReady);
    document.addEventListener("tavus:conversation-started", onStarted);
    document.addEventListener("tavus:conversation-ended", onEnded);
    document.addEventListener("tavus:error", onError);
    document.addEventListener("tavus:mode-change", onMode);
    return () => {
      document.removeEventListener("tavus:protocol-message", onProtocol);
      document.removeEventListener("tavus:ready", onReady);
      document.removeEventListener("tavus:conversation-started", onStarted);
      document.removeEventListener("tavus:conversation-ended", onEnded);
      document.removeEventListener("tavus:error", onError);
      document.removeEventListener("tavus:mode-change", onMode);
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, panel]);

  /** Opens the video call. Only one start at a time; queued messages are sent once it's live. */
  async function startCall() {
    if (phaseRef.current !== "idle") {
      widgetRef.current?.open?.();
      return true;
    }
    setError("");
    setPhaseBoth("starting");
    const problem = await checkDeployment();
    if (problem) {
      queue.current = [];
      setPhaseBoth("idle");
      setError(problem);
      return false;
    }
    if (ready.current) widgetRef.current.startConversation();
    else startWhenReady.current = true;
    return true;
  }

  async function talk() {
    const ok = await startCall();
    if (!ok) setPanel("chat"); // show the reason and the alternatives
  }

  function send(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((current) => [...current, { from: "you", text }]);
    if (phaseRef.current === "live") {
      widgetRef.current?.sendMessage({ event_type: "conversation.respond", properties: { text } });
      return;
    }
    queue.current.push(text);
    startCall();
  }

  const email = settings.email || "hello@solvimere.com";

  return (
    <>
      <tavus-widget
        ref={widgetRef}
        deployment-id={DEPLOYMENT_ID}
        override-config={JSON.stringify(overrideConfig)}
        conversational-context={visitorContext(user)}
        custom-greeting={GREETING}
        memory-stores={user ? `${DEPLOYMENT_ID}-${user.id}` : undefined}
      />
      {panel ? (
        <section className="assistant-chat" aria-label={panel === "book" ? "Book a meeting" : "Chat with Solvimere"}>
          <header>
            <div>
              <p>Solvimere</p>
              <strong>{panel === "book" ? "Book a meeting" : "Chat"}</strong>
            </div>
            <div className="assistant-tools">
              {panel === "book" ? (
                <IconButton icon="chat" label="Chat" tipSide="below" onClick={() => setPanel("chat")} />
              ) : (
                <IconButton icon="calendar" label="Book a meeting" tipSide="below" onClick={() => setPanel("book")} />
              )}
              <IconButton
                icon="video"
                label={phase === "live" ? "Return to video call" : "Start a video call"}
                tipSide="below"
                active={phase === "live"}
                disabled={phase === "starting"}
                onClick={talk}
              />
              <IconButton icon="close" label="Close" tipSide="below" onClick={() => setPanel(null)} />
            </div>
          </header>

          {panel === "book" ? (
            <div className="assistant-body">
              <Booking contactEmail={email} />
            </div>
          ) : (
            <>
              <div className="assistant-log" ref={logRef} aria-live="polite">
                {messages.length === 0 ? (
                  <p className="assistant-empty">
                    Ask about Solvimere. Your first message starts a short video conversation with our assistant, and
                    replies appear here too.
                  </p>
                ) : null}
                {messages.map((message, index) => (
                  <p key={`${message.from}-${index}`} className={message.from === "you" ? "is-you" : "is-them"}>
                    {message.text}
                  </p>
                ))}
                {phase === "starting" ? <p className="assistant-empty">Connecting…</p> : null}
              </div>
              {error ? (
                <div className="assistant-error">
                  <p>{error}</p>
                  <p>
                    <button type="button" className="link-btn" onClick={() => setPanel("book")}>
                      Book a meeting
                    </button>{" "}
                    or email <a href={`mailto:${email}`}>{email}</a>.
                  </p>
                </div>
              ) : null}
              <form onSubmit={send}>
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message"
                  aria-label="Message"
                  maxLength={1000}
                />
                <button type="submit" className="icon-btn is-primary" aria-label="Send" disabled={!draft.trim()}>
                  <Icon name="send" />
                </button>
              </form>
            </>
          )}
        </section>
      ) : (
        <div
          className="assistant-launch"
          role="toolbar"
          aria-label="Contact Solvimere"
          // Warm up the availability check so a click gets an answer right away.
          onPointerEnter={checkDeployment}
          onFocus={checkDeployment}
        >
          <IconButton icon="chat" label="Chat with us" primary onClick={() => setPanel("chat")} />
          <IconButton
            icon="video"
            label={phase === "live" ? "Return to video call" : "Start a video call"}
            active={phase === "live"}
            disabled={phase === "starting"}
            onClick={talk}
          />
          <IconButton icon="calendar" label="Book a meeting" onClick={() => setPanel("book")} />
        </div>
      )}
    </>
  );
}
