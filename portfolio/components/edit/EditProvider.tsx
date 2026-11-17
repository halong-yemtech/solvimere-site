"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getPendingChanges } from "@/lib/edit/actions";
import type { DrawerTarget, EditableCollection, PendingChange } from "@/lib/edit/types";
import EditBar from "./EditBar";
import ItemDrawer from "./ItemDrawer";
import ReorderDrawer from "./ReorderDrawer";

interface ReorderTarget {
  slug: EditableCollection;
  title: string;
  items: { id: number; label: string }[];
}

interface EditContextValue {
  /** True when a CMS user is logged in (may still have edit mode off). */
  canEdit: boolean;
  /** "site": the portfolio page (edit-mode toggle shown); "dashboard": always editing. */
  surface: "site" | "dashboard";
  /** Edit controls are visible. */
  editing: boolean;
  setEditing: (on: boolean) => void;
  openDrawer: (target: DrawerTarget) => void;
  openReorder: (target: ReorderTarget) => void;
  pending: PendingChange[];
  /** Re-render the page from the server and refresh the pending-changes count. */
  refresh: () => void;
  busy: boolean;
}

const EditContext = createContext<EditContextValue>({
  canEdit: false,
  surface: "site",
  editing: false,
  setEditing: () => {},
  openDrawer: () => {},
  openReorder: () => {},
  pending: [],
  refresh: () => {},
  busy: false,
});

export const useEdit = () => useContext(EditContext);

const STORAGE_KEY = "portfolio-edit-mode";

export function EditProvider({
  canEdit,
  surface = "site",
  children,
}: {
  canEdit: boolean;
  surface?: "site" | "dashboard";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [editing, setEditingState] = useState(false);
  const [drawer, setDrawer] = useState<DrawerTarget | null>(null);
  const [reorder, setReorder] = useState<ReorderTarget | null>(null);
  const [pending, setPending] = useState<PendingChange[]>([]);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (!canEdit) return;
    try {
      setEditingState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable */
    }
  }, [canEdit]);

  const setEditing = useCallback((on: boolean) => {
    setEditingState(on);
    try {
      localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const loadPending = useCallback(async () => {
    const res = await getPendingChanges();
    if (res.ok) setPending(res.data);
    else if (/session/i.test(res.error)) toast.error(res.error);
  }, []);

  useEffect(() => {
    if (canEdit) void loadPending();
  }, [canEdit, loadPending]);

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
    void loadPending();
  }, [router, loadPending]);

  const value = useMemo<EditContextValue>(
    () => ({
      canEdit,
      surface,
      editing: canEdit && (surface === "dashboard" || editing),
      setEditing,
      openDrawer: setDrawer,
      openReorder: setReorder,
      pending,
      refresh,
      busy,
    }),
    [canEdit, surface, editing, setEditing, pending, refresh, busy],
  );

  return (
    <EditContext.Provider value={value}>
      {children}
      {canEdit && (
        <>
          <EditBar />
          {drawer && <ItemDrawer key={JSON.stringify(drawer)} target={drawer} onClose={() => setDrawer(null)} />}
          {reorder && <ReorderDrawer {...reorder} onClose={() => setReorder(null)} />}
        </>
      )}
    </EditContext.Provider>
  );
}
