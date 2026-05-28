import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  getIntegrationStatus,
  listDriveFiles,
  sendGmail,
  listCalendarEvents,
  createCalendarEvent,
} from "@/lib/integrations.functions";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Node FMS" },
      {
        name: "description",
        content:
          "Connect Node FMS to Google Drive, Gmail, and Google Calendar. Browse files, send notifications, and schedule events without leaving the app.",
      },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const statusFn = useServerFn(getIntegrationStatus);
  const { data: status } = useQuery({
    queryKey: ["integration-status"],
    queryFn: () => statusFn(),
  });

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border/60 bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/app" className="text-sm text-muted-foreground hover:text-ink">
            ← Back to app
          </Link>
          <div className="text-sm font-semibold tracking-tight">Integrations</div>
          <Link to="/settings" className="text-sm text-muted-foreground hover:text-ink">
            Settings
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Connected services
        </span>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Node FMS is connected to the Node team's Google Workspace account. Use the panels below to browse Drive files,
          send notification emails, and manage Calendar events from inside the app.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StatusCard name="Google Drive" ok={status?.drive} desc="Browse and search files" />
          <StatusCard name="Gmail" ok={status?.gmail} desc="Send notification emails" />
          <StatusCard name="Google Calendar" ok={status?.calendar} desc="List & create events" />
        </div>

        <DrivePanel />
        <GmailPanel />
        <CalendarPanel />
      </main>
    </div>
  );
}

function StatusCard({ name, ok, desc }: { name: string; ok: boolean | undefined; desc: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-ink">{name}</div>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${
            ok
              ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
              : "bg-muted text-muted-foreground ring-ink/10"
          }`}
        >
          <span className={`size-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-muted-foreground"}`} />
          {ok ? "Connected" : "Not linked"}
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5">{children}</div>
    </section>
  );
}

// ---------- Drive ----------

function DrivePanel() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const listFn = useServerFn(listDriveFiles);
  const { data, isLoading, error } = useQuery({
    queryKey: ["drive-files", active],
    queryFn: () => listFn({ data: { query: active || undefined } }),
  });

  return (
    <Panel title="Google Drive">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setActive(q.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Drive by name…"
          className="flex-1 px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        <button className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90">
          Search
        </button>
      </form>
      <div className="mt-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading files…</div>}
        {error && <div className="text-sm text-red-600">{(error as Error).message}</div>}
        {data && data.files.length === 0 && (
          <div className="text-sm text-muted-foreground">No files match.</div>
        )}
        <ul className="divide-y divide-border/60">
          {data?.files.map((f) => (
            <li key={f.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {f.mimeType}
                  {f.modifiedTime && ` · modified ${new Date(f.modifiedTime).toLocaleDateString()}`}
                </div>
              </div>
              {f.webViewLink && (
                <a
                  href={f.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-ink underline-offset-4 hover:underline shrink-0"
                >
                  Open ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

// ---------- Gmail ----------

function GmailPanel() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const sendFn = useServerFn(sendGmail);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendFn({ data: { to: to.trim(), subject: subject.trim(), body: body.trim() } });
      toast.success("Email sent");
      setSubject("");
      setBody("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel title="Send a notification email (Gmail)">
      <form onSubmit={submit} className="grid gap-3">
        <input
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient email"
          className="px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          placeholder="Subject"
          className="px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        <textarea
          required
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={10000}
          placeholder="Message body…"
          className="px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send email"}
          </button>
        </div>
      </form>
    </Panel>
  );
}

// ---------- Calendar ----------

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function toLocalInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CalendarPanel() {
  const listFn = useServerFn(listCalendarEvents);
  const createFn = useServerFn(createCalendarEvent);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: () => listFn(),
  });

  const now = new Date();
  const inHour = new Date(now.getTime() + 60 * 60 * 1000);
  const [summary, setSummary] = useState("");
  const [start, setStart] = useState(toLocalInput(now));
  const [end, setEnd] = useState(toLocalInput(inHour));
  const [creating, setCreating] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createFn({
        data: {
          summary: summary.trim(),
          startISO: new Date(start).toISOString(),
          endISO: new Date(end).toISOString(),
        },
      });
      toast.success("Event created");
      setSummary("");
      refetch();
      if (res.htmlLink) window.open(res.htmlLink, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Panel title="Google Calendar">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Event title</label>
          <input
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="New event"
            className="mt-1 w-full px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Start</label>
          <input
            type="datetime-local"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">End</label>
          <input
            type="datetime-local"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90 disabled:opacity-60"
        >
          {creating ? "Creating…" : "Create"}
        </button>
      </form>

      <div className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Upcoming events
        </div>
        {isLoading && <div className="mt-2 text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="mt-2 text-sm text-red-600">{(error as Error).message}</div>}
        {data && data.events.length === 0 && (
          <div className="mt-2 text-sm text-muted-foreground">No upcoming events.</div>
        )}
        <ul className="mt-3 divide-y divide-border/60">
          {data?.events.map((ev) => {
            const startStr = ev.start?.dateTime ?? ev.start?.date ?? "";
            return (
              <li key={ev.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">
                    {ev.summary ?? "(no title)"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {startStr ? new Date(startStr).toLocaleString() : ""}
                  </div>
                </div>
                {ev.htmlLink && (
                  <a
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-ink underline-offset-4 hover:underline shrink-0"
                  >
                    Open ↗
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}
