import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSiteData } from "./lib/site";
import { buildCvData, cvFileName } from "./lib/cv/data";

/**
 * /team/:slug/cv — the PDF résumé generated from the profile, rendered in the browser.
 * The PDF library is loaded only here.
 */
export default function CvPage() {
  const { slug = "" } = useParams();
  const [pdf, setPdf] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let url = "";
    let cancelled = false;
    (async () => {
      const site = await getSiteData(slug);
      if (!site) throw new Error("This portfolio isn't published yet.");
      const [{ pdf: render }, { default: CvDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./lib/cv/CvDocument"),
      ]);
      const blob = await render(<CvDocument data={buildCvData(site)} />).toBlob();
      url = URL.createObjectURL(blob);
      if (!cancelled) {
        setPdf({ url, name: cvFileName(site.profile.name) });
        document.title = `${site.profile.name} — CV`;
      }
    })().catch((err) => !cancelled && setError(err.message || "The CV couldn't be created."));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [slug]);

  return (
    <main className="cv-page">
      {pdf ? (
        <>
          <div className="cv-bar">
            <span>{pdf.name}</span>
            <a href={pdf.url} download={pdf.name}>
              Download PDF
            </a>
          </div>
          <iframe title="CV" src={pdf.url} />
        </>
      ) : (
        <p>{error || "Preparing the CV…"}</p>
      )}
    </main>
  );
}
