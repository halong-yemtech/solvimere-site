import Image from "next/image";
import type { TestimonialData } from "@/lib/siteTypes";

interface Props {
  testimonial: TestimonialData;
}

export default function Testimonial({ testimonial }: Props) {
  return (
    <div className="testimonial px-12 py-10 flex flex-col items-center">
      <h3 className="text-2xl italic text-gray-500 text-center font-medium tracking-wide relative mb-8 quote">
        <span className="inline-block mx-14">{testimonial.quote}</span>
      </h3>
      {testimonial.photo && (
        <Image
          src={testimonial.photo.url}
          alt={testimonial.photo.alt || testimonial.name}
          width={90}
          height={90}
          style={{ objectFit: "cover" }}
          className="rounded-full w-[90px] h-[90px]"
        />
      )}
      <h2 className="capitalize text-2xl font-semibold text-gray-300 mt-3 mb-1.5">
        {testimonial.name}
      </h2>
      {testimonial.role && (
        <p className="text-xl text-gray-500 text-center mb-6">{testimonial.role}</p>
      )}
    </div>
  );
}
