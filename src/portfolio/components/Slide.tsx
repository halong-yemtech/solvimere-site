import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import Img from "@/components/Img";
import type { SiteImage } from "@/lib/siteTypes";

interface Props {
  images: SiteImage[];
  className?: string;
}

/** Cover images at the top of the profile card, cross-fading every few seconds. */
export default function Slide({ images, className = "" }: Props) {
  return (
    <div className={`bgSlider relative overflow-hidden ${className}`}>
      {images.length === 0 ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--accent)/0.45),transparent_60%),linear-gradient(135deg,#16161c,#0b0b0e)]" />
      ) : (
        <Swiper
          effect="fade"
          modules={[Autoplay, EffectFade]}
          autoplay={images.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
          allowTouchMove={false}
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-full">
                <Img src={img.url} alt="" fill style={{ objectFit: "cover" }} priority={idx === 0} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {/* Fade into the card below */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/0 via-black/10 to-[#16161a]" />
    </div>
  );
}
