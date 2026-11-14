import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { pageDefaults } from "../../../src/cms/defaults.js";
import { supabase, uploadImage } from "../lib/supabase";
import { useAuth } from "../auth";
import { Fields } from "../components/Fields";

function mergeContent(fallback, remote) {
  if (remote == null) return fallback;
  if (Array.isArray(fallback)) return Array.isArray(remote) ? remote : fallback;
  if (!fallback || typeof fallback !== "object" || Array.isArray(fallback)) return remote;
  if (typeof remote !== "object" || Array.isArray(remote)) return remote;
  const next = { ...fallback };
  Object.keys(remote).forEach((key) => {
    next[key] = key in fallback ? mergeContent(fallback[key], remote[key]) : remote[key];
  });
  return next;
}

export default function PageEditor() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const [page, setPage] = useState(null);
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState("published");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPage(null);
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
        setContent(mergeContent(defaults, data.content || {}));
        setStatus(data.status);
      });
  }, [slug]);

  async function save(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    const { error: saveError } = await supabase
      .from("pages")
      .update({
        content,
        status,
        updated_by: profile.id,
      })
      .eq("slug", slug);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setMessage(status === "published" ? "Published to the public site." : "Saved as a draft.");
  }

  async function onUpload(file) {
    const safe = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    return uploadImage("media", `${slug}/${Date.now()}-${safe}`, file);
  }

  if (!page || !content) return <p className="top">{error || "Loading page…"}</p>;

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
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <button className="primary" type="submit">Save page</button>
    </form>
  );
}
