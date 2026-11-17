"use client";

import { useEffect, useState, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { AiOutlineSwapRight } from "react-icons/ai";
import { createGuestbookComment } from "@/app/(frontend)/actions";
import type { GuestbookComment } from "@/lib/siteTypes";

const GUEST_NAME_KEY = "portfolio_guestName";

interface Inputs {
  name: string;
  comment: string;
}

interface Props {
  onCreated: (comment: GuestbookComment) => void;
}

export default function GuestForm({ onCreated }: Props) {
  const { register, handleSubmit, reset, setValue } = useForm<Inputs>();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, startTransition] = useTransition();

  // localStorage only exists in the browser, so read the saved name after mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GUEST_NAME_KEY);
      if (saved) setValue("name", saved);
    } catch {
      // storage unavailable (private mode etc.) — just start empty
    }
  }, [setValue]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    startTransition(async () => {
      const res = await createGuestbookComment(data);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onCreated(res.data);
      toast.success("Thanks for your comment", { duration: 5000 });
      reset({ comment: "", name: res.data.name });
      if (isChecked) {
        try {
          localStorage.setItem(GUEST_NAME_KEY, res.data.name);
        } catch {
          // ignore storage errors
        }
      }
      setIsChecked(false);
    });
  };

  const onInvalid = () => toast.error("Please enter both a comment and your name.");

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <textarea
        {...register("comment", { required: true, maxLength: 2000 })}
        placeholder="Comment"
        className="h-32 mb-4 formStyle"
      ></textarea>
      <input
        {...register("name", { required: true, maxLength: 80 })}
        type="text"
        placeholder="Name"
        className="h-20 formStyle"
      />
      <fieldset className="flex items-center gap-4 mt-6 mb-8">
        <input
          disabled={loading}
          id="reminder"
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked((prev) => !prev)}
        />
        <label htmlFor="reminder" className="text-xl font-medium text-gray-600">
          Save my name for the next time I come.
        </label>
      </fieldset>
      <fieldset className="w-[22rem] h-20 bg-[#0e1422d9] flex justify-center items-center gap-3 text-gray-300 group mt-6 rounded-lg cursor-pointer">
        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "pointer-events-none" : "group-hover:text-main-orange"
          } uppercase text-2xl font-semibold group-hover:mx-2 transition-all duration-300`}
        >
          {loading ? "submitting..." : "submit"}
        </button>

        <AiOutlineSwapRight
          className={`text-4xl group-hover:text-main-orange transition-all duration-300 ${
            loading ? "hidden" : "block"
          }`}
        />
      </fieldset>
    </form>
  );
}
