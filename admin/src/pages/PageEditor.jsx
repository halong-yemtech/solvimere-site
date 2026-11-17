import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useParams } from "react-router-dom";
import { pageDefaults } from "../../../src/cms/defaults.js";
import { mergeContent } from "../../../src/cms/merge.js";
import { supabase, uploadImage } from "../lib/supabase";
import { useAuth } from "../auth";
import { Fields } from "../components/Fields";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";

// Content keys a page no longer uses. They're hidden in the editor and dropped from the
// stored content on the next save.
const OBSOLETE_KEYS = {
  home: ["logos", "works"], // "Trusted by" logo strip (now Reviews) and "Recent Work" carousel
};

export default function PageEditor() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const [page, setPage] = useState(null);
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState("published");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(null);
    setError("");
    supabase
      .from("pages")
      .select("slug, title, status, content, updated_at")
      .eq("slug", slug)
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setError(queryError.message);
          return;
        }
        const defaults = { ...(pageDefaults[slug] || {}) };
        if (slug === "team") delete defaults.members;
        setPage(data);
        const merged = mergeContent(defaults, data.content || {});
        (OBSOLETE_KEYS[slug] || []).forEach((key) => delete merged[key]);
        setContent(merged);
        setStatus(data.status);
      });
  }, [slug]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    const { error: saveError } = await supabase
      .from("pages")
      .update({
        content,
        status,
        updated_by: profile.id,
      })
      .eq("slug", slug);
    setSaving(false);
    if (saveError) {
      toast.error(saveError);
      return;
    }
    toast.success(
      status === "published" ? `${page.title} published to the public site.` : `${page.title} saved as a draft.`,
    );
  }

  async function onUpload(file) {
    const safe = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    return uploadImage("media", `${slug}/${Date.now()}-${safe}`, file);
  }

  if (!page || !content) return error ? <p className="top error">{error}</p> : <Spinner label="Loading page…" />;

  return (
    <form onSubmit={save}>
      <header className="top row">
        <div>
          <h1>{page.title}</h1>
          <p>/{page.slug}</p>
        </div>
        <label className="status">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      </header>
      <Fields value={content} onChange={setContent} onUpload={onUpload} />
      <button className="primary" type="submit" disabled={saving}>
        {saving ? <Loader2 className="spin" /> : <Save />}
        {saving ? "Saving…" : "Save page"}
      </button>
    </form>
  );
}
