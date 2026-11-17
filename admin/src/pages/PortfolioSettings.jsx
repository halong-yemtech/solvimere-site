import { useCallback, useEffect, useState } from "react";
import { call } from "../lib/portfolio";
import { DocEditor } from "../components/DocEditor";

const TARGET = { kind: "global", slug: "site-settings" };

/** Portfolio-wide settings: sections shown, theme, maintenance mode, active profile. */
export default function PortfolioSettings() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    call("getPendingChanges")
      .then((all) => setPending(all.some((p) => p.target.kind === "global")))
      .catch(() => setPending(false));
  }, []);
  useEffect(refresh, [refresh]);

  async function run(op, done) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await call(op, [TARGET]);
      setMessage(done);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Portfolio settings</h1>
          <p>Applies to every portfolio: which sections appear, colours and font, and maintenance mode.</p>
        </div>
      </header>
      {pending ? (
        <div className="pf-pending panel">
          <span>
            <strong>Unpublished settings changes</strong>
            <span>Visitors still see the last published settings.</span>
          </span>
          <div className="actions">
            <button
              type="button"
              className="ghost"
              disabled={busy}
              onClick={() =>
                window.confirm("Throw away the unpublished settings changes?") && run("discard", "Changes discarded.")
              }
            >
              Discard
            </button>
            <button
              type="button"
              className="primary"
              disabled={busy}
              onClick={() => run("publish", "Settings published.")}
            >
              Publish
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <DocEditor target={TARGET} onSaved={refresh} />
    </>
  );
}
