"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiX } from "react-icons/fi";
import { reorderItems } from "@/lib/edit/actions";
import type { EditableCollection } from "@/lib/edit/types";
import { useEdit } from "./EditProvider";

function Row({ id, label }: { id: number; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-4 rounded-xl px-5 py-4 bg-gray-800 ${isDragging ? "ring-2 ring-main-orange z-10 relative" : ""}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 p-1" aria-label="Drag to reorder">
        <FiMenu className="text-2xl" />
      </button>
      <span className="text-xl text-gray-200 truncate">{label}</span>
    </li>
  );
}

export default function ReorderDrawer({ slug, title, items, onClose }: {
  slug: EditableCollection;
  title: string;
  items: { id: number; label: string }[];
  onClose: () => void;
}) {
  const { refresh } = useEdit();
  const [order, setOrder] = useState(items);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setOrder((o) => arrayMove(o, o.findIndex((x) => x.id === active.id), o.findIndex((x) => x.id === over.id)));
  };

  async function save() {
    setSaving(true);
    const res = await reorderItems(slug, order.map((o) => o.id));
    setSaving(false);
    if (!res.ok) return toast.error(res.error);
    toast.success("New order saved as draft");
    refresh();
    onClose();
  }

  const changed = order.some((o, i) => o.id !== items[i].id);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative w-[44rem] max-w-full h-full flex flex-col bg-gray-900 border-l border-gray-700 text-gray-300">
        <header className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
          <div>
            <p className="text-base uppercase tracking-widest text-gray-500">Reorder</p>
            <h2 className="text-3xl font-semibold text-gray-100 capitalize">{title}</h2>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-gray-800"><FiX className="text-2xl" /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <p className="mb-4 text-lg text-gray-500">Drag the handles (or focus one and use ↑ ↓ + space).</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order.map((o) => o.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">{order.map((o) => <Row key={o.id} {...o} />)}</ul>
            </SortableContext>
          </DndContext>
        </div>
        <footer className="flex justify-end gap-3 px-8 py-5 border-t border-gray-800">
          <button onClick={onClose} className="px-5 py-3 rounded-lg hover:bg-gray-800">Cancel</button>
          <button onClick={save} disabled={!changed || saving}
            className="px-6 py-3 rounded-lg bg-main-orange text-gray-900 font-semibold disabled:opacity-50">
            {saving ? "Saving…" : "Save order"}
          </button>
        </footer>
      </aside>
    </div>
  );
}
