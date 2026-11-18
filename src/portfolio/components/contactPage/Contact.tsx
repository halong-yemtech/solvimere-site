import { FaWhatsapp } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import MyInfo from "../MyInfo";
import { useSite } from "../SiteProvider";
import ContactForm from "./ContactForm";

const linkClass = "hover:text-main-orange transition-colors duration-200";

/** Contact: ways to reach the person, a message form and a map. */
export default function Contact() {
  const { profile } = useSite();
  const whatsapp = profile.phoneLink?.includes("wa.me");

  return (
    <section>
      {(profile.email || profile.phone || profile.address) && (
        <ul className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {profile.email && (
            <MyInfo
              field="email"
              value={
                <a href={`mailto:${profile.email}`} className={linkClass}>
                  {profile.email}
                </a>
              }
            />
          )}
          {profile.phone && (
            <MyInfo
              field="phone"
              icon={whatsapp ? FaWhatsapp : undefined}
              hint={whatsapp ? "Chat on WhatsApp" : undefined}
              value={
                profile.phoneLink ? (
                  <a href={profile.phoneLink} target="_blank" rel="noreferrer" className={linkClass}>
                    {profile.phone}
                  </a>
                ) : (
                  profile.phone
                )
              }
            />
          )}
          {profile.address && <MyInfo field="address" value={profile.address} />}
        </ul>
      )}
      <div className={`grid gap-4 ${profile.mapEmbedUrl ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : ""}`}>
        <ContactForm name={profile.name} />
        {profile.mapEmbedUrl && (
          <div className="pf-card relative min-h-[26rem] overflow-hidden bg-[#0f0f13]">
            {/* Shown until the map loads (or if it can't). */}
            <div className="absolute inset-0 grid place-content-center justify-items-center gap-3 p-6 text-center text-gray-400">
              <FiMapPin className="text-[3rem] text-main-orange" aria-hidden />
              <span className="text-[1.45rem]">{profile.address || "Location"}</span>
            </div>
            <iframe
              src={profile.mapEmbedUrl}
              title={profile.address ? `Map of ${profile.address}` : "Location map"}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="relative h-full min-h-[26rem] w-full border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)_brightness(0.95)]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
