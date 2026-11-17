import type { CSSProperties, ImgHTMLAttributes } from "react";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Fill the positioned parent (like next/image `fill`). */
  fill?: boolean;
  /** Load eagerly (above the fold). */
  priority?: boolean;
  /** Accepted for compatibility; the browser picks sizes itself. */
  sizes?: string;
  quality?: number;
};

/** Plain <img> with the few next/image options the portfolio components use. */
export default function Img({ fill, priority, sizes: _sizes, quality: _quality, style, ...rest }: Props) {
  const fillStyle: CSSProperties | undefined = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : style;
  return <img {...rest} style={fillStyle} loading={priority ? "eager" : "lazy"} decoding="async" />;
}
