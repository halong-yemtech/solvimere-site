import { RiDoubleQuotesL } from "react-icons/ri";
import Img from "@/components/Img";
import type { TestimonialData } from "@/lib/siteTypes";

interface Props {
  testimonial: TestimonialData;
  className?: string;
}

/** A quote with the person's photo, name and role. */
export default function Testimonial({ testimonial, className = "" }: Props) {
  return (
    <figure className={`pf-card p-8 sm:p-10 ${className}`}>
      <RiDoubleQuotesL className="text-[4rem] text-main-orange opacity-80" aria-hidden />
      <blockquote className="mt-4 text-[1.8rem] leading-[1.6] text-gray-200 whitespace-pre-line">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-4">
        {testimonial.photo ? (
          <Img
            src={testimonial.photo.url}
            alt={testimonial.photo.alt || testimonial.name}
            width={52}
            height={52}
            className="w-[5.2rem] h-[5.2rem] rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <span className="grid w-[5.2rem] h-[5.2rem] place-items-center rounded-full bg-main-orange/15 text-[2rem] font-bold text-main-orange">
            {testimonial.name.charAt(0)}
          </span>
        )}
        <span>
          <span className="block text-[1.6rem] font-semibold text-white">{testimonial.name}</span>
          {testimonial.role && <span className="block text-[1.35rem] text-gray-400">{testimonial.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}
