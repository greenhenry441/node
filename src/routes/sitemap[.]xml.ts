import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://nodefms.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", priority: "1.0" },
          { path: "/features", priority: "0.8" },
          { path: "/pricing", priority: "0.8" },
          { path: "/security", priority: "0.7" },
          { path: "/about", priority: "0.6" },
          { path: "/contact", priority: "0.6" },
          { path: "/privacy", priority: "0.4" },
          { path: "/status", priority: "0.4" },
          { path: "/login", priority: "0.3" },
          { path: "/signup", priority: "0.5" },
        ];
        const urls = entries.map(
          (e) => `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <priority>${e.priority}</priority>\n  </url>`,
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
