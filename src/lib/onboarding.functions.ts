import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FIELDS = [
  "company_name",
  "industry",
  "team_size",
  "location",
  "products_services",
  "target_customers",
  "goals",
  "current_tools",
  "notes",
] as const;

type Field = (typeof FIELDS)[number];
type Profile = Partial<Record<Field, string>> & { completed?: boolean };

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).max(40),
});

const SYSTEM_PROMPT = `You are the onboarding concierge for Node FMS (Node File Management Suite), a secure file storage product for small businesses.

Your job: have a short, warm conversation with a new customer to learn about their business so we can tailor Node FMS to them. Ask ONE focused question at a time. Keep replies under 2 sentences.

Cover these areas in roughly this order, but adapt to what the user volunteers:
1. Company name
2. Industry / what the business does
3. Team size
4. Location (city / country)
5. Products or services offered
6. Target customers
7. Business goals for the next year
8. Current tools they use for files and collaboration
9. Anything else worth noting

Every turn, call the update_business_profile tool with any new or refined information you can confidently infer from the user's latest message. Only include fields you actually learned this turn — never overwrite with empty strings. When all 8 core areas are covered, set completed=true and end with a friendly handoff like "You're all set — taking you to your workspace."`;

const tools = [
  {
    type: "function" as const,
    function: {
      name: "update_business_profile",
      description:
        "Persist newly learned information about the user's business. Only include fields you learned or refined this turn.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          company_name: { type: "string" },
          industry: { type: "string" },
          team_size: { type: "string" },
          location: { type: "string" },
          products_services: { type: "string" },
          target_customers: { type: "string" },
          goals: { type: "string" },
          current_tools: { type: "string" },
          notes: { type: "string" },
          completed: {
            type: "boolean",
            description: "Set true once you have covered all 8 areas.",
          },
        },
      },
    },
  },
];

export const getBusinessProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { profile: (data ?? null) as Profile | null };
  });

export const chatOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        throw new Response("Rate limit exceeded. Please wait a moment.", { status: 429 });
      }
      if (res.status === 402) {
        throw new Response("AI credits exhausted. Add credits in workspace settings.", { status: 402 });
      }
      throw new Response("AI gateway error", { status: 500 });
    }

    const payload = await res.json();
    const choice = payload.choices?.[0]?.message ?? {};
    const reply: string = choice.content ?? "";
    const toolCall = choice.tool_calls?.[0];

    let updates: Profile = {};
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        for (const k of FIELDS) {
          const v = parsed[k];
          if (typeof v === "string" && v.trim()) updates[k] = v.trim();
        }
        if (parsed.completed === true) updates.completed = true;
      } catch {
        // ignore malformed tool args
      }
    }

    let profile: Profile | null = null;
    if (Object.keys(updates).length > 0) {
      const { data: upserted } = await supabase
        .from("business_profiles")
        .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" })
        .select()
        .single();
      profile = upserted as Profile;
    } else {
      const { data: existing } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      profile = (existing ?? null) as Profile | null;
    }

    return {
      reply: reply || "Got it — tell me a bit more.",
      profile,
    };
  });
