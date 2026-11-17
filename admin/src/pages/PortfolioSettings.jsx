import { DocEditor } from "../components/DocEditor";

/** Settings shared by every portfolio: sections shown, colours and font, maintenance mode. */
export default function PortfolioSettings() {
  return (
    <>
      <header className="top row">
        <div>
          <p className="eyebrow">Portfolio</p>
          <h1>Portfolio settings</h1>
          <p>Applies to every portfolio: which sections appear, colours and font, and maintenance mode.</p>
        </div>
      </header>
      <DocEditor target={{ kind: "settings" }} />
    </>
  );
}
