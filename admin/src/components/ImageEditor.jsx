import { useEffect, useRef, useState } from "react";
import {
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  RectangleHorizontal,
  RectangleVertical,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  Square,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "./Toast";

const ASPECTS = [
  { id: "portrait", label: "Portrait", ratio: 4 / 5 },
  { id: "square", label: "Square", ratio: 1 },
  { id: "wide", label: "Wide", ratio: 3 / 2 },
];

const ASPECT_ICONS = { portrait: RectangleVertical, square: Square, wide: RectangleHorizontal };
function AspectIcon({ id }) {
  const Icon = ASPECT_ICONS[id] || Square;
  return <Icon />;
}

const INITIAL = {
  scale: 1,
  x: 0,
  y: 0,
  rotation: 0,
  flipX: false,
  flipY: false,
  brightness: 100,
  contrast: 100,
  aspect: "portrait",
};

function fineRotation(rotation) {
  const nearest = Math.round(rotation / 90) * 90;
  return rotation - nearest;
}

function aspectRatio(id) {
  return ASPECTS.find((item) => item.id === id)?.ratio || 4 / 5;
}

function rotatedCover(imageWidth, imageHeight, rotation, frameWidth, frameHeight) {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const boundsWidth = imageWidth * cos + imageHeight * sin;
  const boundsHeight = imageWidth * sin + imageHeight * cos;
  const fit = Math.max(frameWidth / boundsWidth, frameHeight / boundsHeight);
  return { width: imageWidth * fit, height: imageHeight * fit };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The photo could not be opened for editing."));
    image.src = src;
  });
}

export function ImageEditor({ src, onCancel, onApply, pending, aspect = "portrait", format = "jpeg" }) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [edit, setEdit] = useState(() => ({ ...INITIAL, aspect }));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadImage(src)
      .then((image) => {
        if (!cancelled) setNatural({ width: image.naturalWidth, height: image.naturalHeight });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    const measure = () => setFrame({ width: node.clientWidth, height: node.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [edit.aspect]);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function patch(values) {
    setEdit((current) => ({ ...current, ...values }));
  }

  const ratio = aspectRatio(edit.aspect);
  const base = natural.width
    ? rotatedCover(natural.width, natural.height, edit.rotation, frame.width || 1, frame.height || 1)
    : { width: 0, height: 0 };
  const drawnWidth = base.width * edit.scale;
  const drawnHeight = base.height * edit.scale;

  function onPointerDown(event) {
    dragRef.current = { x: event.clientX, y: event.clientY, ox: edit.x, oy: edit.y };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* The drag still tracks pointermove on the frame. */
    }
  }

  function onPointerMove(event) {
    if (!dragRef.current) return;
    const { x, y, ox, oy } = dragRef.current;
    patch({ x: ox + event.clientX - x, y: oy + event.clientY - y });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  async function apply() {
    try {
      const image = await loadImage(src);
      const stage = stageRef.current;
      const outLong = 1400;
      const outWidth = ratio >= 1 ? outLong : Math.round(outLong * ratio);
      const outHeight = ratio >= 1 ? Math.round(outLong / ratio) : outLong;
      const pixelRatio = outWidth / stage.clientWidth;
      const cover = rotatedCover(
        image.naturalWidth,
        image.naturalHeight,
        edit.rotation,
        stage.clientWidth,
        stage.clientHeight,
      );
      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const context = canvas.getContext("2d");
      if (format === "png") {
        context.clearRect(0, 0, outWidth, outHeight);
      } else {
        context.fillStyle = "#111318";
        context.fillRect(0, 0, outWidth, outHeight);
      }
      context.translate(outWidth / 2 + edit.x * pixelRatio, outHeight / 2 + edit.y * pixelRatio);
      context.rotate((edit.rotation * Math.PI) / 180);
      context.scale(edit.flipX ? -1 : 1, edit.flipY ? -1 : 1);
      context.filter = `brightness(${edit.brightness}%) contrast(${edit.contrast}%)`;
      context.drawImage(
        image,
        -(cover.width * edit.scale * pixelRatio) / 2,
        -(cover.height * edit.scale * pixelRatio) / 2,
        cover.width * edit.scale * pixelRatio,
        cover.height * edit.scale * pixelRatio,
      );
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.92));
      if (!blob) throw new Error("The image could not be processed.");
      await onApply(blob);
    } catch (err) {
      toast.error(err.message || "The image could not be processed.");
    }
  }

  return (
    <div className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="image-editor-title">
      <div className="editor-sheet">
        <header>
          <div>
            <p className="eyebrow">Image tools</p>
            <h2 id="image-editor-title">Crop photo</h2>
          </div>
          <button className="ghost icon-btn" type="button" onClick={onCancel} aria-label="Close" title="Close">
            <X />
          </button>
        </header>
        <div className="editor-layout">
          <div
            ref={stageRef}
            className="crop-stage"
            role="application"
            aria-label="Crop area"
            style={{ aspectRatio: String(ratio), "--crop-ratio": ratio }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {natural.width ? (
              <img
                src={src}
                alt=""
                draggable="false"
                style={{
                  width: drawnWidth,
                  height: drawnHeight,
                  transform: `translate(calc(-50% + ${edit.x}px), calc(-50% + ${edit.y}px)) rotate(${edit.rotation}deg) scale(${edit.flipX ? -1 : 1}, ${edit.flipY ? -1 : 1})`,
                  filter: `brightness(${edit.brightness}%) contrast(${edit.contrast}%)`,
                }}
              />
            ) : null}
            <div className="crop-grid" aria-hidden="true" />
          </div>
          <div className="tool-panel">
            <div className="tool-group">
              <span>Crop</span>
              <div className="tool-row">
                {ASPECTS.map((item) => (
                  <button
                    key={item.id}
                    className={edit.aspect === item.id ? "ghost is-on" : "ghost"}
                    type="button"
                    onClick={() => patch({ aspect: item.id, scale: 1, x: 0, y: 0 })}
                  >
                    <AspectIcon id={item.id} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="tool-group">
              <span>Scale {Math.round(edit.scale * 100)}%</span>
              <div className="tool-row">
                <button
                  className="ghost"
                  type="button"
                  onClick={() => patch({ scale: Math.max(1, Math.round((edit.scale - 0.05) * 100) / 100) })}
                  disabled={edit.scale <= 1}
                >
                  <ZoomOut />
                  Scale down
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => patch({ scale: Math.min(4, Math.round((edit.scale + 0.05) * 100) / 100) })}
                  disabled={edit.scale >= 4}
                >
                  <ZoomIn />
                  Scale up
                </button>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="0.01"
                value={edit.scale}
                aria-label="Scale"
                onChange={(event) => patch({ scale: Number(event.target.value) })}
              />
            </div>
            <div className="tool-group">
              <span>Rotate {edit.rotation}°</span>
              <div className="tool-row">
                <button className="ghost" type="button" onClick={() => patch({ rotation: edit.rotation - 90 })}>
                  <RotateCcw />
                  Left
                </button>
                <button className="ghost" type="button" onClick={() => patch({ rotation: edit.rotation + 90 })}>
                  <RotateCw />
                  Right
                </button>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={fineRotation(edit.rotation)}
                aria-label="Straighten"
                onChange={(event) =>
                  patch({ rotation: Math.round(edit.rotation / 90) * 90 + Number(event.target.value) })
                }
              />
            </div>
            <div className="tool-group">
              <span>Flip</span>
              <div className="tool-row">
                <button
                  className={edit.flipX ? "ghost is-on" : "ghost"}
                  type="button"
                  onClick={() => patch({ flipX: !edit.flipX })}
                >
                  <FlipHorizontal2 />
                  Horizontal
                </button>
                <button
                  className={edit.flipY ? "ghost is-on" : "ghost"}
                  type="button"
                  onClick={() => patch({ flipY: !edit.flipY })}
                >
                  <FlipVertical2 />
                  Vertical
                </button>
              </div>
            </div>
            <label className="tool-group">
              <span>Brightness {edit.brightness}%</span>
              <input
                type="range"
                min="40"
                max="160"
                step="1"
                value={edit.brightness}
                aria-label="Brightness"
                onChange={(event) => patch({ brightness: Number(event.target.value) })}
              />
            </label>
            <label className="tool-group">
              <span>Contrast {edit.contrast}%</span>
              <input
                type="range"
                min="40"
                max="160"
                step="1"
                value={edit.contrast}
                aria-label="Contrast"
                onChange={(event) => patch({ contrast: Number(event.target.value) })}
              />
            </label>
            <p className="tool-note">
              Drag the photo inside the frame. Apply saves this crop as the image used on the site.
            </p>
            {error ? <p className="error">{error}</p> : null}
            <div className="tool-row">
              <button className="ghost" type="button" onClick={() => setEdit({ ...INITIAL, aspect })}>
                <RefreshCcw />
                Reset
              </button>
              <button className="ghost" type="button" onClick={onCancel}>
                <X />
                Cancel
              </button>
              <button className="primary" type="button" onClick={apply} disabled={pending || !natural.width}>
                {pending ? <Loader2 className="spin" /> : <Crop />}
                {pending ? "Saving…" : "Apply crop"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
