import type { ComponentType } from "react";
import type { IconType } from "react-icons";
import type { SectionKey } from "./settingsDefaults";

/** A section of a portfolio (About, Résumé, …) as shown in the menu. */
export interface MenuData {
  id: SectionKey;
  label: string;
  Icon: IconType;
  Component: ComponentType;
}
