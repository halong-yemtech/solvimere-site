"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiCheck } from "react-icons/fi";
import { publish } from "@/lib/edit/actions";
import { useEdit } from "../edit/EditProvider";
import Card from "./Card";

export default function PendingCard() {
  const { pending, openDrawer, refresh } = useEdit();
  const [working, setWorking] = useState(false);

  async function publishAll() {
    setWorking(true);
    const res = await publish();
    setWorking(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Published ${res.data.published} change(s)`);
    refresh();
  }

  return (
    <Card
      title="Unpublished changes"
      actions={pending.length > 0 && (
        <button onClick={publishAll} disabled={working}
          className="flex items-center gap-2 rounded-full px-5 py-2 bg-green-600/90 text-white text-xl hover:bg-green-500 disabled:opacity-60">
          <FiCheck /> {working ? "Publishing…" : "Publish all"}
        </button>
      )}
    >
      {pending.length === 0 ? (
        <p className="text-xl text-gray-500">Everything is live. Edits you make are saved as drafts until you publish.</p>
      ) : (
        <ul className="divide-y divide-gray-800">
          {pending.map((p) => (
            <li key={JSON.stringify(p.target)}>
              <button onClick={() => openDrawer(p.target)} className="w-full flex justify-between gap-4 py-3 text-xl text-left hover:text-main-orange">
                <span className="truncate">{p.label}</span>
                <span className="shrink-0 text-gray-500">{p.group}{p.isNew && <span className="ml-2 text-main-orange">new</span>}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
