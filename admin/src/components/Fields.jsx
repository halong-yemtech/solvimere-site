import { useState } from "react";
import { ImageUp, Pencil, Plus, Trash2 } from "lucide-react";
import { ImageEditor } from "./ImageEditor";
import { toast } from "./Toast";

const LONG = /bio|lede|description|summary|body|mission|vision|tagline|message/i;
const IMAGE = /(image|photo|avatar|src|logo)$/i;

function labelFor(key) {
  if (key === "href") return "Link";
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function blankLike(sample) {
  if (typeof sample === "string") return "";
  if (Array.isArray(sample)) {
    if (isPairList(sample)) return [["", ""]];
    if (sample.every((item) => typeof item === "string")) return [];
    return sample[0] ? [blankLike(sample[0])] : [];
  }
  if (sample && typeof sample === "object") {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, blankLike(value)]));
  }
  return "";
}

function isPairList(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => Array.isArray(item) && item.length === 2 && item.every((part) => typeof part === "string"))
  );
}

function imageAspect(path) {
  if (/avatar/i.test(path)) return "square";
  return "wide";
}

function imageFormat(path, value) {
  if (/logo/i.test(path) || /\.png($|\?)/i.test(value || "")) return "png";
  return "jpeg";
}

function ImageField({ label, value, path, onChange, onUpload }) {
  const [editor, setEditor] = useState(null);
  const [pending, setPending] = useState(false);
  const format = imageFormat(path, editor?.fileType === "image/png" ? "x.png" : value);

  function closeEditor() {
    setEditor((current) => {
      if (current?.revoke) URL.revokeObjectURL(current.src);
      return null;
    });
  }

  function openFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setEditor((current) => {
      if (current?.revoke) URL.revokeObjectURL(current.src);
      return { src: URL.createObjectURL(file), revoke: true, fileType: file.type };
    });
  }

  async function applyImage(blob) {
    setPending(true);
    try {
      const extension = format === "png" ? "png" : "jpg";
      const file = new File([blob], `image.${extension}`, {
        type: blob.type || `image/${extension === "png" ? "png" : "jpeg"}`,
      });
      const url = await onUpload(file, path);
      onChange(url);
      closeEditor();
      toast.success("Image updated. Save the page to publish it.");
    } catch (err) {
      toast.error(err.message || "The image could not be saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="field image-field">
      <span>{label}</span>
      <div className={`image-preview ${/logo/i.test(path) ? "is-logo" : ""}`}>
        {value ? <img src={value} alt="" /> : <em>No image yet</em>}
      </div>
      <div className="tool-row">
        {value ? (
          <button className="ghost" type="button" onClick={() => setEditor({ src: value, revoke: false })}>
            <Pencil />
            Edit image
          </button>
        ) : null}
        <label className="ghost file-btn">
          <ImageUp />
          Replace
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={openFile} />
        </label>
      </div>
      {editor ? (
        <ImageEditor
          src={editor.src}
          pending={pending}
          aspect={imageAspect(path)}
          format={format}
          onCancel={closeEditor}
          onApply={applyImage}
        />
      ) : null}
    </div>
  );
}

export function Fields({ value, onChange, onUpload, path = "" }) {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string") && !/(stats|metrics|journey|presence|topics)$/.test(path)) {
      return (
        <label className="field">
          <span>{labelFor(path.split(".").pop() || "Items")}</span>
          <input
            value={value.join(", ")}
            onChange={(event) =>
              onChange(
                event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      );
    }
    if (isPairList(value) || (value.length === 0 && /(stats|metrics|journey|presence|topics)$/.test(path))) {
      const rows = value.length ? value : [];
      return (
        <div className="stack">
          {rows.map((pair, index) => (
            <div className="pair" key={index}>
              <input
                value={pair[0]}
                aria-label="Value"
                onChange={(event) => {
                  const next = rows.map((row, rowIndex) => (rowIndex === index ? [event.target.value, row[1]] : row));
                  onChange(next);
                }}
              />
              <input
                value={pair[1]}
                aria-label="Label"
                onChange={(event) => {
                  const next = rows.map((row, rowIndex) => (rowIndex === index ? [row[0], event.target.value] : row));
                  onChange(next);
                }}
              />
              <button
                type="button"
                className="text-btn"
                onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
              >
                <Trash2 />
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="text-btn" onClick={() => onChange([...rows, ["", ""]])}>
            <Plus />
            Add row
          </button>
        </div>
      );
    }
    return (
      <div className="stack">
        {value.map((item, index) => (
          <fieldset key={index} className="card">
            <legend>
              {labelFor(path.split(".").pop() || "Item")} {index + 1}
            </legend>
            <Fields
              value={item}
              path={`${path}.${index}`}
              onUpload={onUpload}
              onChange={(next) => onChange(value.map((row, rowIndex) => (rowIndex === index ? next : row)))}
            />
            <button
              type="button"
              className="text-btn"
              onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))}
            >
              <Trash2 />
              Remove
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="text-btn"
          onClick={() => onChange([...value, value[0] ? blankLike(value[0]) : ""])}
        >
          <Plus />
          Add item
        </button>
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="stack">
        {Object.entries(value).map(([key, child]) => (
          <div key={key}>
            {typeof child === "string" ? null : <p className="group-label">{labelFor(key)}</p>}
            <Fields
              value={child}
              path={path ? `${path}.${key}` : key}
              onUpload={onUpload}
              onChange={(next) => onChange({ ...value, [key]: next })}
            />
          </div>
        ))}
      </div>
    );
  }

  const key = path.split(".").pop() || "";
  const imageField = typeof value === "string" && (IMAGE.test(key) || /(^|\.)photos\./.test(path));
  if (imageField) {
    return <ImageField label={labelFor(key)} value={value} path={path} onChange={onChange} onUpload={onUpload} />;
  }

  return (
    <label className="field">
      <span>{labelFor(key)}</span>
      {LONG.test(key) || String(value || "").length > 120 ? (
        <textarea rows={4} value={value || ""} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value || ""} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
