import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleCheck, CircleDashed, ExternalLink, Loader2, Save, SlidersHorizontal, Undo2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { pageDefaults } from "../../../src/cms/defaults.js";
import { mergeContent } from "../../../src/cms/merge.js";
import { supabase, uploadImage } from "../lib/supabase";
import { pageInfo, siteUrlFor } from "../lib/pages";
import { useAuth } from "../auth";
import { Fields } from "../components/Fields";
import { Spinner } from "../components/Spinner";
import { toast } from "../components/Toast";
import { PageHead, timeAgo } from "../components/ui";

// Content keys a page no longer uses. They're hidden in the editor and dropped from the
// stored content on the next save.
const OBSOLETE_KEYS = {
  home: ["logos", "works"], // "Trusted by" logo strip (now Reviews) and "Recent Work" carousel
};

const labelFor = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const isSimple = (v) => v == null || typeof v !== "object";

export default function PageEditor() {
  const { slug } = useParams();
  const { profile } = useAuth();
  const [page, setPage] = useState(null);
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState("published");
  const [saved, setSaved] = useState(null); // { content, status } as last loaded/saved
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const sectionsRef = useRef(null);

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
        const merged = mergeContent(defaults, data.content || {});
        (OBSOLETE_KEYS[slug] || []).forEach((key) => delete merged[key]);
        setPage(data);
        setContent(merged);
        setStatus(data.status);
        setSaved({ content: JSON.stringify(merged), status: data.status });
      });
  }, [slug]);

  const dirty = Boolean(saved && content && (JSON.stringify(content) !== saved.content || status !== saved.status));

  // Simple text fields at the top level go in "General"; every group gets its own section.
  const sections = useMemo(() => {
    if (!content) return [];
    const general = Object.keys(content).filter((k) => isSimple(content[k]));
    const groups = Object.keys(content).filter((k) => !isSimple(content[k]));
    return [
      ...(general.length ? [{ id: "general", label: "General", keys: general }] : []),
      ...groups.map((k) => ({ id: k, label: labelFor(k), keys: [k] })),
    ];
  }, [content]);

  const save = useCallback(
    async (event) => {
      event?.preventDefault();
      if (!content || saving) return;
      setSaving(true);
      const { error: saveError } = await supabase
        .from("pages")
        .update({ content, status, updated_by: profile.id })
        .eq("slug", slug);
      setSaving(false);
      if (saveError) {
        toast.error(saveError);
        return;
      }
      setSaved({ content: JSON.stringify(content), status });
      setPage((p) => ({ ...p, status, updated_at: new Date().toISOString() }));
      toast.success(
        status === "published" ? `${page.title} published to the public site.` : `${page.title} saved as a draft.`,
      );
    },
    [content, status, saving, slug, profile, page],
  );

  // Ctrl/⌘+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, save]);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Highlight the section in view.
  useEffect(() => {
    const root = sectionsRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id.replace(/^sec-/, ""));
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    root.querySelectorAll("section[id^='sec-']").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections.length]);

  async function onUpload(file) {
    const safeName = file.name.replace(/[^\w.-]+/g, "-").toLowerCase();
    return uploadImage("media", `${slug}/${Date.now()}-${safeName}`, file);
  }

  if (!page || !content) return error ? <p className="top error">{error}</p> : <Spinner label="Loading page…" />;

  const info = pageInfo(slug);
  const live = siteUrlFor(slug);

  return (
    <form className="ui-page pe" onSubmit={save}>
      <PageHead
        icon={info.icon}
        title={page.title}
        description={
          <>
            {info.about ? `${info.about}. ` : ""}Last saved {timeAgo(page.updated_at)}.
          </>
        }
        actions={
          <>
            <div className="ui-tabs" role="radiogroup" aria-label="Visibility">
              {[
                { value: "published", label: "Published", icon: CircleCheck },
                { value: "draft", label: "Draft", icon: CircleDashed },
              ].map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={status === o.value}
                  className={status === o.value ? "is-on" : ""}
                  onClick={() => setStatus(o.value)}
                >
                  <o.icon />
                  {o.label}
                </button>
              ))}
            </div>
            {live ? (
              <a className="ghost" href={live} target="_blank" rel="noreferrer">
                <ExternalLink />
                View
              </a>
            ) : null}
          </>
        }
      />

      <div className="pe-layout">
        <nav className="pe-nav" aria-label="Sections">
          <p>
            <SlidersHorizontal />
            Sections
          </p>
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#sec-${s.id}`}
              className={activeSection === s.id ? "is-on" : ""}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`sec-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveSection(s.id);
              }}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="pe-sections" ref={sectionsRef}>
          {sections.map((s) => (
            <section key={s.id} id={`sec-${s.id}`} className="ui-card pe-section">
              <h2>{s.label}</h2>
              {s.id === "general" ? (
                <Fields
                  value={Object.fromEntries(s.keys.map((k) => [k, content[k]]))}
                  onUpload={onUpload}
                  onChange={(next) => setContent((c) => ({ ...c, ...next }))}
                />
              ) : (
                <Fields
                  value={content[s.id]}
                  path={s.id}
                  onUpload={onUpload}
                  onChange={(next) => setContent((c) => ({ ...c, [s.id]: next }))}
                />
              )}
            </section>
          ))}
        </div>
      </div>

      <div className={`pe-bar${dirty ? " is-dirty" : ""}`}>
        <span>
          {dirty ? (
            <>
              <i className="pe-dot" /> Unsaved changes
            </>
          ) : (
            "All changes saved"
          )}
          <kbd>Ctrl</kbd>
          <kbd>S</kbd>
        </span>
        {dirty ? (
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setContent(JSON.parse(saved.content));
              setStatus(saved.status);
              toast.info("Changes discarded.");
            }}
          >
            <Undo2 />
            Discard
          </button>
        ) : null}
        <button className="primary" type="submit" disabled={saving || !dirty}>
          {saving ? <Loader2 className="spin" /> : <Save />}
          {saving ? "Saving…" : status === "published" ? "Save & publish" : "Save draft"}
        </button>
      </div>
    </form>
  );
}
