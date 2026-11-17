import type { IconType } from "react-icons";
import type { SectionKey } from "@/lib/settingsDefaults";

interface MenuData {
  id: SectionKey;
  label: string;
  Icon: IconType;
  Component: React.ComponentType;
}
