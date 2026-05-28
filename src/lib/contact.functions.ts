import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(5000),
  userAgent: z.string().max(500).optional(),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      message: data.message,
      user_agent: data.userAgent ?? null,
    });
    if (error) {
      console.error("[contact] insert failed:", error);
      return { ok: false as const, error: "Could not save your message. Please try again." };
    }
    return { ok: true as const };
  });
