/**
 * Live-note-preview backend resolver (Task 2).
 *
 * Reads one published-snapshot doc from CouchDB by slug and returns its
 * markdown. A note is public iff a `pub:<slug>` doc exists — that doc is
 * written by the plugin's "Copy public link" command (Task 5) and already
 * holds the plaintext markdown, so the backend does no decryption or chunk
 * assembly. CouchDB credentials stay server-side.
 *
 * Run: bun run server/index.ts        (serve)
 *      bun run server/index.ts --check (self-check, no network)
 */

const env = {
  couchUrl: (process.env.COUCHDB_URL ?? "http://localhost:5984").replace(/\/+$/, ""),
  db: process.env.COUCHDB_DB ?? "obsidiannotes",
  user: process.env.COUCHDB_USER ?? "",
  password: process.env.COUCHDB_PASSWORD ?? "",
  port: Number(process.env.PORT ?? 8787),
};

// Slugs go straight into a CouchDB doc id / URL path, so keep them to a safe set.
export const isValidSlug = (slug: string) => /^[a-zA-Z0-9_-]{1,128}$/.test(slug);

export const publishDocId = (slug: string) => `pub:${slug}`;

export type PublicNote = { markdown: string; title: string };

/** Fetch a published note from CouchDB. Returns null if the slug is unknown. */
export async function fetchPublicNote(slug: string): Promise<PublicNote | null> {
  if (!isValidSlug(slug)) return null;
  const url = `${env.couchUrl}/${env.db}/${encodeURIComponent(publishDocId(slug))}`;
  const headers: Record<string, string> = {};
  if (env.user) headers.Authorization = "Basic " + btoa(`${env.user}:${env.password}`);

  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CouchDB ${res.status}`);

  const doc = (await res.json()) as { markdown?: string; title?: string };
  if (typeof doc.markdown !== "string") return null; // malformed / not a published note
  return { markdown: doc.markdown, title: doc.title ?? "" };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

async function handle(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);
  const match = pathname.match(/^\/api\/note\/([^/]+)$/);
  if (!match) return json({ error: "not found" }, 404);

  const slug = decodeURIComponent(match[1]);
  try {
    const note = await fetchPublicNote(slug);
    if (!note) return json({ error: "not found" }, 404);
    return json(note);
  } catch (err) {
    console.error("resolve failed:", err);
    return json({ error: "upstream error" }, 502);
  }
}

function selfCheck() {
  const ok = ["abc", "my-note_1", "A", "x".repeat(128)];
  const bad = ["", "a/b", "pub:x", "foo bar", "..", "a".repeat(129), "a?b"];
  for (const s of ok) if (!isValidSlug(s)) throw new Error(`should accept: ${s}`);
  for (const s of bad) if (isValidSlug(s)) throw new Error(`should reject: ${s}`);
  if (publishDocId("x") !== "pub:x") throw new Error("docid");
  console.log("selfCheck ok");
}

if (import.meta.main) {
  if (process.argv.includes("--check")) {
    selfCheck();
  } else {
    Bun.serve({ port: env.port, fetch: handle });
    console.log(`resolver on :${env.port} -> ${env.couchUrl}/${env.db}`);
  }
}
