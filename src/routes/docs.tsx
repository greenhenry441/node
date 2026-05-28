import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Node FMS" },
      {
        name: "description",
        content:
          "Long-form documentation for Node File Management Suite: setup, file storage, workspaces, sharing, editor, security, plans, and troubleshooting.",
      },
      { property: "og:title", content: "Docs — Node FMS" },
      {
        property: "og:description",
        content:
          "Long-form documentation for Node File Management Suite: setup, file storage, workspaces, sharing, editor, security, plans, and troubleshooting.",
      },
      { property: "og:url", content: "https://nodefms.lovable.app/docs" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/docs" }],
  }),
  component: DocsPage,
});

type Section = { id: string; label: string };

const sections: Section[] = [
  { id: "introduction", label: "Introduction" },
  { id: "getting-started", label: "Getting started" },
  { id: "accounts-auth", label: "Accounts & authentication" },
  { id: "file-storage", label: "File storage" },
  { id: "workspaces", label: "Workspaces & teams" },
  { id: "sharing-invites", label: "Sharing & invites" },
  { id: "join-codes", label: "Workspace join codes" },
  { id: "chat", label: "Real-time chat" },
  { id: "editor", label: "Code & file editor" },
  { id: "plans-storage", label: "Plans & storage limits" },
  { id: "security", label: "Security model" },
  { id: "data-residency", label: "Data residency" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "support", label: "Getting support" },
];

function DocsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid md:grid-cols-[240px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="md:sticky md:top-8 md:self-start">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Documentation
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight">Node FMS Handbook</h2>
          <nav className="mt-6 flex flex-col gap-1 text-sm">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-md px-2 py-1.5 text-muted-foreground hover:bg-ink/5 hover:text-ink transition-colors"
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 rounded-xl border border-ink/10 bg-card p-4 text-xs">
            <div className="font-semibold text-ink">Need help?</div>
            <p className="mt-1 text-muted-foreground">
              Can't find an answer? Ask the community.
            </p>
            <Link
              to="/forum"
              className="mt-3 inline-flex text-ink underline-offset-4 hover:underline font-medium"
            >
              Visit the Forum →
            </Link>
          </div>
        </aside>

        {/* Content */}
        <article className="prose-docs max-w-3xl">
          <header className="border-b border-border/60 pb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Support files
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
              The Node FMS Handbook
            </h1>
            <p className="mt-5 text-lg text-muted-foreground text-pretty">
              Everything you need to set up, run, and trust Node File Management Suite — written long-form, in plain
              English, by the team that builds it.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Last updated May 28, 2026 · v1.0 · Maintained by the Node FMS team
            </p>
          </header>

          <Section id="introduction" title="1. Introduction">
            <p>
              <strong>Node File Management Suite</strong> — Node FMS for short — is a secure file storage and team
              workspace built for small and medium businesses. It is a division of <strong>Node</strong>, a software
              studio that focuses on operational tools for teams the enterprise platforms tend to forget.
            </p>
            <p>
              This handbook is the canonical reference for the product. It is intentionally written in long form: every
              feature has its own section, every section explains both <em>what</em> the feature does and{" "}
              <em>why</em> it works the way it does. If you read top to bottom, you'll have a complete model of how
              Node FMS thinks about files, teams, and security.
            </p>
            <Callout title="Conventions used in this document">
              <ul>
                <li>
                  <strong>Workspace</strong> — a shared container for files, members, and chat.
                </li>
                <li>
                  <strong>Member</strong> — an account that has been added to a workspace.
                </li>
                <li>
                  <strong>Owner / Admin / Member</strong> — the three workspace roles, in descending order of authority.
                </li>
              </ul>
            </Callout>
          </Section>

          <Section id="getting-started" title="2. Getting started">
            <p>
              You can sign up for Node FMS in under a minute. There is no credit card required for the Free plan, and
              you can move between plans at any time from <code>Settings → Plan</code>.
            </p>
            <ol>
              <li>
                Open <Link to="/signup">/signup</Link> and create an account with email + password, or with Google.
              </li>
              <li>
                Confirm your email if asked, then complete the short business profile in{" "}
                <Link to="/onboarding">/onboarding</Link>. This is optional but it helps us tune storage tier
                recommendations.
              </li>
              <li>
                Land on the <Link to="/app">main app</Link>. Your personal workspace is created for you automatically.
              </li>
              <li>Upload your first file by dragging it onto the file grid.</li>
            </ol>
            <p>
              That's the entire on-ramp. If something on this list doesn't behave the way the docs describe, jump to{" "}
              <a href="#troubleshooting">Troubleshooting</a>.
            </p>
          </Section>

          <Section id="accounts-auth" title="3. Accounts & authentication">
            <p>
              Node FMS uses standard email + password authentication, with Google OAuth as a one-click alternative.
              We do <strong>not</strong> use anonymous sign-in: every account is tied to a real, verifiable identity so
              that file ownership, audit logs, and billing all line up cleanly.
            </p>
            <h3>Password resets</h3>
            <p>
              If you forget your password, use <Link to="/forgot-password">/forgot-password</Link>. You'll receive an
              email with a single-use reset link that expires after 1 hour. The reset flow lands you on{" "}
              <Link to="/reset-password">/reset-password</Link>, where you set a new password and are signed in
              automatically.
            </p>
            <h3>Sessions</h3>
            <p>
              Sessions are stored in your browser's <code>localStorage</code> and rotate refresh tokens roughly every
              hour. Closing your browser doesn't sign you out — use the explicit <strong>Sign out</strong> button in
              Settings if you're on a shared machine.
            </p>
          </Section>

          <Section id="file-storage" title="4. File storage">
            <p>
              Every file you upload goes into the <code>user-files</code> bucket on encrypted object storage. Files are
              private by default: only you (or members of a workspace you've shared the file into) can list or
              download them.
            </p>
            <h3>Limits per file</h3>
            <p>
              The hard upper bound for any single file is <strong>15 GB</strong>. This is enforced at the database
              level via the <code>max_file_bytes()</code> function — uploads larger than this fail with a clear error
              before any bytes hit storage.
            </p>
            <h3>Versioning & history</h3>
            <p>
              Every plan includes <strong>180 days</strong> of file history. Renaming a file does not consume a new
              version; replacing its contents does. History is per-file and survives moves between folders.
            </p>
            <h3>Supported types</h3>
            <p>
              Node FMS is content-agnostic. Any MIME type is allowed; preview generation is currently provided for
              images, PDFs, plain text, and most common code files. Unknown types still upload and download fine, they
              just don't render a thumbnail.
            </p>
          </Section>

          <Section id="workspaces" title="5. Workspaces & teams">
            <p>
              A <strong>workspace</strong> is the unit of collaboration in Node FMS. It owns members, files (when
              shared into it), chat messages, and invites. Every account has a personal workspace by default, and you
              can create additional workspaces from <Link to="/settings">Settings</Link>.
            </p>
            <h3>Roles</h3>
            <ul>
              <li>
                <strong>Owner</strong> — created the workspace; can delete it, transfer ownership, and manage billing.
              </li>
              <li>
                <strong>Admin</strong> — can invite/remove members and manage settings, but cannot delete the
                workspace or remove the owner.
              </li>
              <li>
                <strong>Member</strong> — can read and write workspace content but cannot manage other members.
              </li>
            </ul>
            <p>
              Role escalation is blocked at the database layer. Admins cannot promote themselves to owner; no member
              can change their own role. These are RLS-level guarantees, not just UI affordances.
            </p>
          </Section>

          <Section id="sharing-invites" title="6. Sharing & invites">
            <p>
              There are two ways to bring people into a workspace:
            </p>
            <ol>
              <li>
                <strong>Email invite.</strong> From <Link to="/settings">Settings</Link>, type an email address and
                pick a role. The recipient gets a 14-day invite link that only they can accept (their email must match
                exactly when they sign in).
              </li>
              <li>
                <strong>Join code.</strong> Every workspace has a short, copy-paste-friendly code that anyone with the
                link can use to join. Codes can be regenerated at any time, which immediately invalidates the previous
                one.
              </li>
            </ol>
            <p>
              Both flows funnel through <Link to="/invite/$code" params={{ code: "your-code" }}>/invite/&lt;code&gt;</Link>, which
              resolves the code, signs the user in if needed, and adds them to the workspace.
            </p>
          </Section>

          <Section id="join-codes" title="7. Workspace join codes">
            <p>
              Join codes are designed for the messy real-world moment when you're standing next to a colleague and
              just want them <em>in</em> the workspace. They look like this:
            </p>
            <pre>k3m9pq2r7w</pre>
            <p>The full join URL is:</p>
            <pre>https://nodefms.lovable.app/invite/k3m9pq2r7w</pre>
            <h3>Security properties</h3>
            <ul>
              <li>Codes are 10 characters from a reduced, unambiguous alphabet (no <code>0</code>, <code>1</code>, <code>l</code>, <code>i</code>).</li>
              <li>Joining still requires a signed-in account.</li>
              <li>Regenerating a code is a hard cut-off; no grace period for the old one.</li>
              <li>Codes never grant owner or admin privileges; new joiners always come in as <strong>member</strong>.</li>
            </ul>
          </Section>

          <Section id="chat" title="8. Real-time chat">
            <p>
              Every workspace has a built-in chat channel, accessible from the <strong>Chat</strong> button in the app
              header. Messages are delivered in real-time using Supabase Realtime over WebSockets — typical end-to-end
              latency is well under a second.
            </p>
            <p>
              Chat is intended for short-form coordination ("uploaded the Q3 deck", "can you re-share the logo?").
              For long-form discussion across the broader Node community, use the public{" "}
              <Link to="/forum">Forum</Link> instead.
            </p>
          </Section>

          <Section id="editor" title="9. Code & file editor">
            <p>
              The <Link to="/editor">Editor</Link> at <code>/editor</code> is the in-browser workspace for editing any
              text file you've uploaded to your box, as well as code files that can be run and compiled. It is
              available to all signed-in users; signing in is required because the editor reads and writes against
              your private file storage.
            </p>
            <h3>What you can edit</h3>
            <ul>
              <li>Source code in any language (syntax highlighting auto-detects from the file extension).</li>
              <li>Plain text, Markdown, JSON, YAML, TOML, CSV.</li>
              <li>Configuration files (<code>.env</code>, <code>.gitignore</code>, dotfiles).</li>
            </ul>
            <h3>What you cannot edit</h3>
            <p>
              Binary files (images, PDFs, archives, video) open in a preview pane rather than the editor. There is no
              hex-edit mode.
            </p>
          </Section>

          <Section id="plans-storage" title="10. Plans & storage limits">
            <p>The four plans and their storage caps:</p>
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Storage cap</th>
                  <th>Per-file limit</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Free</td><td>500 GB</td><td>15 GB</td></tr>
                <tr><td>Starter</td><td>1 TB</td><td>15 GB</td></tr>
                <tr><td>Steady</td><td>5 TB</td><td>15 GB</td></tr>
                <tr><td>Suite</td><td>Unlimited</td><td>15 GB</td></tr>
              </tbody>
            </table>
            <p>
              You can change plans freely from <Link to="/app">the app</Link>'s plan switcher or from{" "}
              <Link to="/settings">Settings</Link>. Downgrades are accepted even if your current usage exceeds the
              lower cap; you simply can't upload new files until you're back under it.
            </p>
          </Section>

          <Section id="security" title="11. Security model">
            <p>
              Security in Node FMS rests on three layers:
            </p>
            <ol>
              <li>
                <strong>Authentication</strong> — every request is tied to a verified Supabase auth user. There are no
                anonymous sessions and no shared API keys exposed to the browser.
              </li>
              <li>
                <strong>Row-Level Security</strong> — every table that holds user data has explicit RLS policies. The
                database, not the application, decides what each user can read and write.
              </li>
              <li>
                <strong>Separation of roles</strong> — admin operations (e.g. accepting a workspace invite) run as
                tightly-scoped server functions that read the caller's identity from a verified JWT. The service-role
                key never reaches the client.
              </li>
            </ol>
            <Callout title="Reporting a vulnerability">
              <p>
                If you believe you've found a security issue, please email{" "}
                <a href="mailto:security@nodefms.lovable.app">security@nodefms.lovable.app</a> with steps to reproduce.
                Do not file it on the public forum.
              </p>
            </Callout>
          </Section>

          <Section id="data-residency" title="12. Data residency">
            <p>
              Files are stored in one of three regions: <strong>US</strong>, <strong>EU</strong>, or{" "}
              <strong>AU</strong>. Your region is set when your account is first provisioned and is currently fixed
              for the lifetime of the account; region migration is on the roadmap.
            </p>
            <p>
              All data is encrypted at rest with AES-256 and in transit with TLS 1.3. We do not move data across
              regions for backups; backups are kept in the same region as the primary copy.
            </p>
          </Section>

          <Section id="troubleshooting" title="13. Troubleshooting">
            <h3>"Storage quota exceeded"</h3>
            <p>
              Your account has hit the cap for its current plan. Either delete files you no longer need, or upgrade
              from the plan switcher. The error is raised by the database trigger <code>enforce_storage_quota</code>{" "}
              before any bytes are written.
            </p>
            <h3>"File too large"</h3>
            <p>
              A single file is over 15 GB. There is no plan that lifts this limit today — split the file (e.g. into a
              multi-part archive) before uploading.
            </p>
            <h3>Chat messages aren't appearing</h3>
            <p>
              Real-time chat requires an open WebSocket connection. If you're on a corporate network that blocks
              WebSockets, messages will still send and persist, but you'll only see them after a page refresh.
            </p>
            <h3>I can't see a file a teammate uploaded</h3>
            <p>
              Files are private to the uploader unless they've been shared into a workspace you're a member of. Ask
              the uploader to share the file or move it into your shared workspace.
            </p>
          </Section>

          <Section id="support" title="14. Getting support">
            <p>There are three places to get help, in roughly this order of effectiveness:</p>
            <ol>
              <li>
                <strong>Search this handbook.</strong> Use your browser's find (<kbd>Cmd</kbd>+<kbd>F</kbd>) — the
                whole thing lives on one page on purpose.
              </li>
              <li>
                <strong>Ask the <Link to="/forum">Forum</Link>.</strong> Community questions, feature requests, and
                showcases live here. Other users (and the Node team) answer in public so the next person can find it.
              </li>
              <li>
                <strong>Email <a href="mailto:support@nodefms.lovable.app">support@nodefms.lovable.app</a></strong>{" "}
                for billing or account-specific issues that shouldn't be public.
              </li>
            </ol>
            <p className="text-sm text-muted-foreground">
              That's the whole handbook. If you spot something out of date, please flag it on the forum so we can fix
              it for everyone.
            </p>
          </Section>
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-10 border-b border-border/60 last:border-b-0">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
        <a href={`#${id}`} className="hover:underline underline-offset-4">
          {title}
        </a>
      </h2>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground [&_strong]:text-ink [&_h3]:text-ink [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-ink [&_a]:underline-offset-4 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-ink/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-ink [&_pre]:rounded-lg [&_pre]:bg-ink [&_pre]:text-surface [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:py-2 [&_th]:pr-4 [&_th]:font-semibold [&_th]:text-ink [&_td]:py-2 [&_td]:pr-4 [&_thead]:border-b [&_thead]:border-border [&_tbody_tr]:border-b [&_tbody_tr]:border-border/40 [&_kbd]:rounded [&_kbd]:border [&_kbd]:border-ink/15 [&_kbd]:bg-card [&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:text-[11px] [&_kbd]:font-mono">
        {children}
      </div>
    </section>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-ink/10 bg-card p-5">
      <div className="text-sm font-semibold text-ink">{title}</div>
      <div className="mt-2 text-sm text-muted-foreground [&_a]:text-ink [&_a]:underline-offset-4 hover:[&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-2">
        {children}
      </div>
    </div>
  );
}
