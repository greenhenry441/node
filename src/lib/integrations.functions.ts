import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev";

function authHeaders(connectorKeyName: string) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const connKey = process.env[connectorKeyName];
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!connKey) throw new Error(`${connectorKeyName} is not configured — connect the integration first`);
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": connKey,
  };
}

// ---------- Status ----------

export const getIntegrationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return {
      drive: !!process.env.GOOGLE_DRIVE_API_KEY,
      gmail: !!process.env.GOOGLE_MAIL_API_KEY,
      calendar: !!process.env.GOOGLE_CALENDAR_API_KEY,
    };
  });

// ---------- Google Drive ----------

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
};

export const listDriveFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { query?: string } | undefined) => data ?? {})
  .handler(async ({ data }): Promise<{ files: DriveFile[] }> => {
    const params = new URLSearchParams({
      pageSize: "25",
      fields: "files(id,name,mimeType,modifiedTime,size,webViewLink)",
      orderBy: "modifiedTime desc",
    });
    if (data.query) params.set("q", `name contains '${data.query.replace(/'/g, "\\'")}'`);
    const res = await fetch(
      `${GATEWAY}/google_drive/drive/v3/files?${params.toString()}`,
      { headers: authHeaders("GOOGLE_DRIVE_API_KEY") },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(`Drive [${res.status}]: ${JSON.stringify(body)}`);
    return { files: (body.files ?? []) as DriveFile[] };
  });

// ---------- Gmail ----------

function encodeRawEmail(to: string, subject: string, body: string, from?: string): string {
  const lines = [
    `To: ${to}`,
    from ? `From: ${from}` : "",
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ].filter(Boolean);
  const email = lines.join("\r\n");
  // base64url
  const b64 = btoa(unescape(encodeURIComponent(email)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const sendGmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        to: z.string().trim().email().max(320),
        subject: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(10000),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const raw = encodeRawEmail(data.to, data.subject, data.body);
    const res = await fetch(
      `${GATEWAY}/google_mail/gmail/v1/users/me/messages/send`,
      {
        method: "POST",
        headers: {
          ...authHeaders("GOOGLE_MAIL_API_KEY"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(`Gmail [${res.status}]: ${JSON.stringify(body)}`);
    return { id: body.id as string };
  });

// ---------- Google Calendar ----------

export type CalendarEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
};

export const listCalendarEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<{ events: CalendarEvent[] }> => {
    const params = new URLSearchParams({
      maxResults: "15",
      orderBy: "startTime",
      singleEvents: "true",
      timeMin: new Date().toISOString(),
    });
    const res = await fetch(
      `${GATEWAY}/google_calendar/calendar/v3/calendars/primary/events?${params.toString()}`,
      { headers: authHeaders("GOOGLE_CALENDAR_API_KEY") },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(`Calendar [${res.status}]: ${JSON.stringify(body)}`);
    return { events: (body.items ?? []) as CalendarEvent[] };
  });

export const createCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        summary: z.string().trim().min(1).max(200),
        startISO: z.string().min(10),
        endISO: z.string().min(10),
        description: z.string().trim().max(2000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const res = await fetch(
      `${GATEWAY}/google_calendar/calendar/v3/calendars/primary/events`,
      {
        method: "POST",
        headers: {
          ...authHeaders("GOOGLE_CALENDAR_API_KEY"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: data.summary,
          description: data.description,
          start: { dateTime: new Date(data.startISO).toISOString() },
          end: { dateTime: new Date(data.endISO).toISOString() },
        }),
      },
    );
    const body = await res.json();
    if (!res.ok) throw new Error(`Calendar [${res.status}]: ${JSON.stringify(body)}`);
    return { id: body.id as string, htmlLink: body.htmlLink as string | undefined };
  });
