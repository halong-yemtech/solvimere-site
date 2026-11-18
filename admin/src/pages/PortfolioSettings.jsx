import { Settings2 } from "lucide-react";
import { DocEditor } from "../components/DocEditor";
import { PageHead } from "../components/ui";

/** Settings shared by every portfolio: sections shown, colours and font, maintenance mode. */
export default function PortfolioSettings() {
  return (
    <div className="ui-page">
      <PageHead
        icon={Settings2}
        title="Portfolio settings"
        description="Applies to every portfolio: which sections appear, colours and font, and maintenance mode."
      />
      <DocEditor target={{ kind: "settings" }} />
    </div>
  );
}
