"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { submitContactForm } from "@/actions/contact";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { ContactFormSubmitButton } from "@/components/sections/ContactFormSubmitButton";
import { PendingFieldset } from "@/components/app/PendingFieldset";
import { services } from "@/lib/content";

type ContactFormState = {
  submitted: boolean;
};

async function contactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const result = await submitContactForm(formData);
  if (!result.success) {
    toast.error(result.error);
    return { submitted: false };
  }
  toast.success(result.data.message);
  return { submitted: true };
}

export function ContactForm() {
  const [state, formAction] = useActionState(contactAction, {
    submitted: false,
  });

  if (state.submitted) {
    return (
      <ScrollReveal>
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.08)] sm:p-10">
          <p className="eyebrow mb-4">Message sent</p>
          <p className="heading-display text-2xl font-semibold text-foreground sm:text-3xl">
            Thanks for reaching out
          </p>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            We received your message and will reply within a couple of business
            days. In the meantime, explore our features to see what Finance
            Buddy can do for your budget.
          </p>
        </div>
      </ScrollReveal>
    );
  }

  const fieldClassName =
    "w-full rounded-2xl border border-border/80 bg-white px-4 py-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent-green focus:ring-2 focus:ring-accent-green/15";

  return (
    <ScrollReveal>
      <form
        action={formAction}
        className="rounded-3xl bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)] sm:p-9"
      >
        <PendingFieldset>
        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Full name
            </span>
            <input
              required
              type="text"
              name="name"
              autoComplete="name"
              className={fieldClassName}
              placeholder="Alex Morgan"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              University or college
            </span>
            <input
              type="text"
              name="university"
              autoComplete="organization"
              className={fieldClassName}
              placeholder="Your university"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Email
            </span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              className={fieldClassName}
              placeholder="you@university.edu.au"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Year of study
            </span>
            <input
              type="text"
              name="year"
              className={fieldClassName}
              placeholder="e.g. Second year"
            />
          </label>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            What interests you most?
          </span>
          <select
            name="feature"
            className={fieldClassName}
            defaultValue="General early access"
          >
            <option>General early access</option>
            {services.map((service) => (
              <option key={service.id}>{service.title}</option>
            ))}
          </select>
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Message
          </span>
          <textarea
            name="message"
            rows={6}
            className={`${fieldClassName} resize-y`}
            placeholder="Tell us what you struggle with most — food, transport, subscriptions, or saving for something big."
          />
        </label>
        </PendingFieldset>

        <div className="mt-9">
          <ContactFormSubmitButton />
        </div>
      </form>
    </ScrollReveal>
  );
}
