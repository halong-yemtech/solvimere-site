import { useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FiSend } from "react-icons/fi";
import { sendContactMessage } from "@/lib/actions";
import { track } from "@/lib/tracker";

interface Inputs {
  fullName: string;
  email: string;
  message: string;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

export default function ContactForm({ name }: { name: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const [loading, startTransition] = useTransition();
  const firstName = name.split(" ")[0] || name;

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    startTransition(async () => {
      const res = await sendContactMessage(data);
      if (!res.ok) {
        track("form_error", { label: "contact" });
        toast.error(res.error);
        return;
      }
      track("form_submit", { label: "contact" });
      toast.success(`Thanks, ${res.data.fullName}! ${firstName} will get back to you soon.`, { duration: 6000 });
      reset({ fullName: "", email: "", message: "" });
    });
  };

  return (
    <form
      className="pf-card p-7 sm:p-10 grid gap-5"
      data-track-form="contact"
      onSubmit={handleSubmit(onSubmit, () => track("form_error", { label: "contact" }))}
      noValidate
    >
      <div>
        <h3 className="text-[2rem] font-semibold text-white">Send {firstName} a message</h3>
        <p className="mt-1 text-[1.45rem] text-gray-400">Share a few details about your project or question.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="pf-field">
          <span className="pf-label">Full name</span>
          <input
            {...register("fullName", { required: "Please enter your name." })}
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={errors.fullName ? "true" : undefined}
            className="pf-input"
          />
          {errors.fullName && <span className="text-[1.25rem] text-red-400">{errors.fullName.message}</span>}
        </label>
        <label className="pf-field">
          <span className="pf-label">Email</span>
          <input
            {...register("email", {
              required: "Please enter your email.",
              validate: (email) => isValidEmail(email) || "That email doesn't look right.",
            })}
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            aria-invalid={errors.email ? "true" : undefined}
            className="pf-input"
          />
          {errors.email && <span className="text-[1.25rem] text-red-400">{errors.email.message}</span>}
        </label>
      </div>
      <label className="pf-field">
        <span className="pf-label">Message</span>
        <textarea
          {...register("message", { required: "Please write a message." })}
          placeholder="Hi! I'd like to talk about…"
          aria-invalid={errors.message ? "true" : undefined}
          className="pf-input !min-h-[18rem]"
        />
        {errors.message && <span className="text-[1.25rem] text-red-400">{errors.message.message}</span>}
      </label>
      <button type="submit" data-track-ignore disabled={loading} className="pf-btn justify-self-start">
        {loading ? "Sending…" : "Send message"}
        <span className="pf-btn-ico">
          <FiSend aria-hidden />
        </span>
      </button>
    </form>
  );
}
