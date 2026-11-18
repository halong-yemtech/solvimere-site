import { useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FiSend } from "react-icons/fi";
import { createGuestbookComment } from "@/lib/actions";
import { track } from "@/lib/tracker";
import type { GuestbookComment } from "@/lib/siteTypes";

const GUEST_NAME_KEY = "portfolio_guestName";
const MAX_COMMENT = 2000;

interface Inputs {
  name: string;
  comment: string;
}

interface Props {
  onCreated: (comment: GuestbookComment) => void;
}

export default function GuestForm({ onCreated }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const [remember, setRemember] = useState(false);
  const [loading, startTransition] = useTransition();
  const length = (watch("comment") || "").length;

  // localStorage only exists in the browser, so read the saved name after mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GUEST_NAME_KEY);
      if (saved) {
        setValue("name", saved);
        setRemember(true);
      }
    } catch {
      // storage unavailable (private mode etc.) - just start empty
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    startTransition(async () => {
      const res = await createGuestbookComment(data);
      if (!res.ok) {
        track("form_error", { label: "guest book" });
        toast.error(res.error);
        return;
      }
      track("form_submit", { label: "guest book" });
      onCreated(res.data);
      toast.success("Thanks for your comment!", { duration: 5000 });
      reset({ comment: "", name: res.data.name });
      try {
        if (remember) localStorage.setItem(GUEST_NAME_KEY, res.data.name);
        else localStorage.removeItem(GUEST_NAME_KEY);
      } catch {
        // ignore storage errors
      }
    });
  };

  return (
    <form
      data-track-form="guest book"
      onSubmit={handleSubmit(onSubmit, () => track("form_error", { label: "guest book" }))}
      className="pf-card p-7 sm:p-8 grid gap-5 xl:sticky xl:top-[9rem]"
      noValidate
    >
      <div>
        <h3 className="text-[1.8rem] font-semibold text-white">Leave a note</h3>
        <p className="mt-1 text-[1.4rem] text-gray-400">Your comment shows up here right away.</p>
      </div>
      <label className="pf-field">
        <span className="pf-label">Your name</span>
        <input
          {...register("name", { required: "Please enter your name.", maxLength: 80 })}
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          aria-invalid={errors.name ? "true" : undefined}
          className="pf-input"
        />
        {errors.name && <span className="text-[1.25rem] text-red-400">{errors.name.message}</span>}
      </label>
      <label className="pf-field">
        <span className="flex justify-between">
          <span className="pf-label">Comment</span>
          <span className={`text-[1.2rem] ${length > MAX_COMMENT ? "text-red-400" : "text-gray-500"}`}>
            {length}/{MAX_COMMENT}
          </span>
        </span>
        <textarea
          {...register("comment", {
            required: "Please write a comment.",
            maxLength: { value: MAX_COMMENT, message: "That's a bit long — please shorten it." },
          })}
          placeholder="Great work! I especially liked…"
          aria-invalid={errors.comment ? "true" : undefined}
          className="pf-input"
        />
        {errors.comment && <span className="text-[1.25rem] text-red-400">{errors.comment.message}</span>}
      </label>
      <label className="flex items-center gap-3 text-[1.35rem] text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          className="pf-check"
          disabled={loading}
          checked={remember}
          onChange={() => setRemember((prev) => !prev)}
        />
        Remember my name on this device
      </label>
      <button type="submit" data-track-ignore disabled={loading} className="pf-btn justify-self-start">
        {loading ? "Posting…" : "Post comment"}
        <span className="pf-btn-ico">
          <FiSend aria-hidden />
        </span>
      </button>
    </form>
  );
}
