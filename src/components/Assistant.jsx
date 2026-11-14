import { useEffect, useRef, useState } from "react";
import "@tavus/widget";
import { useSiteAuth } from "../auth/SiteAuth";

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

export function Assistant() {
  const widgetRef = useRef(null);
  const { user } = useSiteAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const queue = useRef([]);
  const live = useRef(false);
  const talkWhenReady = useRef(false);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return undefined;
    const sync = () => {
      const expanded = el.dataset.tavusWidgetExpanded === "true";
      el.toggleAttribute("inert", !expanded);
      if (expanded) el.removeAttribute("aria-hidden");
      else el.setAttribute("aria-hidden", "true");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["data-tavus-widget-expanded"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onProtocol(event) {
      const detail = event.detail;
      if (detail?.event_type !== "conversation.utterance") return;
      const speech = detail.properties?.speech;
      const role = detail.properties?.role;
      if (typeof speech !== "string" || !speech.trim()) return;
      if (role === "user") return;
      setMessages((current) => [...current, { from: "solvimere", text: speech }]);
    }
    function onReady() {
      if (!talkWhenReady.current) return;
      talkWhenReady.current = false;
      const el = widgetRef.current;
      el?.open?.();
      el?.startConversation?.();
    }
    function onStarted() {
      live.current = true;
      const el = widgetRef.current;
      const waiting = queue.current.splice(0);
      waiting.forEach((text) => {
        if (el?.tavus?.sendChat) el.tavus.sendChat(text);
        else el?.sendMessage?.(text);
      });
      setPending(false);
    }
    function onEnded() {
      live.current = false;
      setPending(false);
    }
    function onError(event) {
      talkWhenReady.current = false;
      setPending(false);
      setError(event.detail?.message || "The assistant could not start.");
    }
    document.addEventListener("tavus:protocol-message", onProtocol);
    document.addEventListener("tavus:ready", onReady);
    document.addEventListener("tavus:conversation-started", onStarted);
    document.addEventListener("tavus:conversation-ended", onEnded);
    document.addEventListener("tavus:error", onError);
    return () => {
      document.removeEventListener("tavus:protocol-message", onProtocol);
      document.removeEventListener("tavus:ready", onReady);
      document.removeEventListener("tavus:conversation-started", onStarted);
      document.removeEventListener("tavus:conversation-ended", onEnded);
      document.removeEventListener("tavus:error", onError);
    };
  }, []);

  function talk() {
    setError("");
    const el = widgetRef.current;
    if (typeof el?.startConversation !== "function") {
      talkWhenReady.current = true;
      return;
    }
    el.open?.();
    el.startConversation();
  }

  function send(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const el = widgetRef.current;
    setMessages((current) => [...current, { from: "you", text }]);
    setDraft("");
    setError("");
    setOpen(true);
    if (live.current && el?.tavus?.sendChat) {
      el.tavus.sendChat(text);
      return;
    }
    setPending(true);
    queue.current.push(text);
    el?.open?.();
    el?.startConversation?.();
  }

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
      {open ? (
        <section className="assistant-chat" aria-label="Chat with Solvimere">
          <header>
            <div>
              <p>Solvimere</p>
              <strong>Chat</strong>
            </div>
            <div className="assistant-tools">
              <button type="button" onClick={talk}>Talk</button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">Close</button>
            </div>
          </header>
          <div className="assistant-log">
            {messages.length === 0 ? <p className="assistant-empty">Ask about Solvimere. You can type here or start a video conversation.</p> : null}
            {messages.map((message, index) => (
              <p key={`${message.from}-${index}`} className={message.from === "you" ? "is-you" : "is-them"}>
                {message.text}
              </p>
            ))}
          </div>
          {error ? <p className="assistant-error">{error}</p> : null}
          <form onSubmit={send}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message"
              aria-label="Message"
            />
            <button type="submit" disabled={pending}>{pending ? "…" : "Send"}</button>
          </form>
        </section>
      ) : (
        <div className="assistant-launch">
          <button type="button" onClick={() => setOpen(true)}>Chat</button>
          <button type="button" onClick={talk}>Talk</button>
        </div>
      )}
    </>
  );
}
