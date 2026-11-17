"use client";

import { FaWhatsapp } from "react-icons/fa";
import MyInfo from "../MyInfo";
import { useSite } from "../SiteProvider";

const linkClass = "hover:text-main-orange transition-colors duration-200";

export default function Location() {
  const { profile } = useSite();

  return (
    <div className="p-12">
      {profile.mapEmbedUrl && (
        <iframe
          src={profile.mapEmbedUrl}
          title="Location map"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-96 rounded-xl border border-gray-800"
        />
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
        {profile.address && <MyInfo field="address" value={profile.address} />}
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
            icon={profile.phoneLink?.includes("wa.me") ? FaWhatsapp : undefined}
            hint={profile.phoneLink?.includes("wa.me") ? "Chat on WhatsApp" : undefined}
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
        {profile.status && <MyInfo field="status" value={profile.status} />}
      </ul>
    </div>
  );
}
