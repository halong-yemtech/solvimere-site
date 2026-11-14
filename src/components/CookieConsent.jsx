import { useEffect, useState } from "react";
import { readConsent, writeConsent } from "../lib/cookies";

export function CookieConsent() {
  const [choice, setChoice] = useState(undefined);

  useEffect(() => {
    setChoice(readConsent());
  }, []);

  useEffect(() => {
    const open = choice === null;
    document.body.classList.toggle("has-cookie-bar", open);
    return () => document.body.classList.remove("has-cookie-bar");
  }, [choice]);

  if (choice !== null) return null;

  function choose(value) {
    writeConsent(value);
    setChoice(value);
  }

  return (
    <div className="cookie-bar" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-copy">
      <div className="cookie-copy">
        <p id="cookie-title">Cookie consent</p>
        <p id="cookie-copy">
          We use a cookie to remember this choice and keep the site working on your device.
        </p>
      </div>
      <div className="cookie-actions">
        <button type="button" className="cookie-decline" onClick={() => choose("declined")}>
          Decline
        </button>
        <button type="button" className="cookie-accept" onClick={() => choose("accepted")}>
          Accept
        </button>
      </div>
    </div>
  );
}
