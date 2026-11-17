import Testimonial from "../../Testimonial";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useSite } from "../../SiteProvider";

export default function Testimonials() {
  const { testimonials } = useSite();

  return (
    <div className="testimonials">
      <Swiper pagination={true} modules={[Pagination]}>
        {testimonials.map((t) => (
          <SwiperSlide key={t.id}>
            <>
              <Testimonial testimonial={t} />
            </>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
