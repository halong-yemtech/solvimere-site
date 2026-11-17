import { useMemo } from "react";
import { buildMenus } from "@/lib/menus";
import { useSite } from "@/components/SiteProvider";
import { currentMenu, useReactiveVar } from "./state";

/** Visible menus (from Site settings) and the key of the open one. */
export function useMenus() {
  const { settings } = useSite();
  const menus = useMemo(() => buildMenus(settings.sections), [settings.sections]);
  const selected = useReactiveVar(currentMenu);
  // Fall back to the first section if nothing is selected or the selected one was hidden.
  const activeKey = menus.some((m) => m.id === selected) ? selected! : (menus[0]?.id ?? null);
  return { menus, activeKey };
}
