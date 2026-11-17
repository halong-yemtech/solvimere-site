"use client";

import { BsFillCloudArrowDownFill } from "react-icons/bs";
import Image from "next/image";
import { useSite } from "./SiteProvider";
import { iconRegistry } from "./icons";
import MediaIcons from "./MediaIcons";
import MyLink from "./MyLink";
import Slide from "./Slide";
import Typing from "./Typing";
import { EditableProfileArea, EditText } from "./edit/Editable";

export default function ProfileCard() {
  const { profile, socialLinks } = useSite();
  const HireIcon = profile.hireLink ? iconRegistry[profile.hireLink.icon as keyof typeof iconRegistry] : undefined;

  return (
    <div className="profile h-full lg:w-[42rem] xl:w-[48rem] bg-gray-900 rounded-lg relative lg:block hidden">
      <EditableProfileArea tab="Profile card" label="Edit profile" className="relative z-40 w-full h-full">
        <div className="relative z-40 w-full h-full myShadow">
          <Slide images={profile.backgroundImages} />

          <div className="relative z-20 w-56 h-56 mx-auto -mt-36 rounded-full profilePic">
            {profile.avatar && (
              <Image
                src={profile.avatar.url}
                alt={profile.avatar.alt || profile.name}
                fill
                sizes="112px"
                style={{ objectFit: "cover" }}
                className="w-full h-full block p-0 z-20 relative object-cover rounded-full border-4 border-[#1c1b1b] border-solid"
              />
            )}
          </div>

          <EditText
            as="h1"
            target={{ kind: "collection", slug: "profiles", id: profile.id }}
            field="name"
            value={profile.name}
            className="block text-center text-gray-300 text-[3.4rem] font-medium mt-4 mb-0.5"
          />

          <Typing titles={profile.typingTitles} />
          <MediaIcons socialLinks={socialLinks} />

          <div className="flex absolute bottom-0 left-0 w-full h-28 borderLeft customLine">
            {profile.cvUrl && (
              <MyLink
                name="download cv"
                Icon={BsFillCloudArrowDownFill}
                url={profile.cvUrl}
                border={Boolean(profile.hireLink)}
                full={!profile.hireLink}
              />
            )}
            {profile.hireLink && HireIcon && (
              <MyLink name={profile.hireLink.label} Icon={HireIcon} url={profile.hireLink.url} full={!profile.cvUrl} />
            )}
          </div>
        </div>
      </EditableProfileArea>
    </div>
  );
}
