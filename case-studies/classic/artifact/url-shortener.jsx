export const difficulty = 'Medium'

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Chip } from "@heroui/react";

const TEAL   = "#4ecca3";
const GOLD   = "#f6c90e";
const BLUE   = "#5dade2";
const RED    = "#ff6b6b";
const PURPLE = "#a78bfa";

// ── Architecture Diagram ─────────────────────────────────────────────
const CELL_W = 160;
const CELL_H = 110;
const NODE_W = 130;
const NODE_H = 46;
const PAD_X  = (CELL_W - NODE_W) / 2;
const PAD_Y  = (CELL_H - NODE_H) / 2;

function nr(col, row) {
  return {
    x:  col * CELL_W + PAD_X,
    y:  row * CELL_H + PAD_Y,
    cx: col * CELL_W + PAD_X + NODE_W / 2,
    cy: row * CELL_H + PAD_Y + NODE_H / 2,
  };
}

function edgePts(a, b) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0
      ? { x1: a.x + NODE_W, y1: a.cy, x2: b.x, y2: b.cy }
      : { x1: a.x, y1: a.cy, x2: b.x + NODE_W, y2: b.cy };
  }
  return dy > 0
    ? { x1: a.cx, y1: a.y + NODE_H, x2: b.cx, y2: b.y }
    : { x1: a.cx, y1: a.y, x2: b.cx, y2: b.y + NODE_H };
}

const NODES = [
  { id: "client", label: "Client",          emoji: "💻", col: 0, row: 0, color: BLUE   },
  { id: "cdn",    label: "CDN / Gateway",   emoji: "🌐", col: 1, row: 0, color: GOLD   },
  { id: "app",    label: "App Servers",     emoji: "⚙️", col: 2, row: 0, color: TEAL   },
  { id: "redis",  label: "Redis Cache",     emoji: "🔴", col: 3, row: 0, color: RED    },
  { id: "idgen",  label: "ID Generator",   emoji: "🔢", col: 2, row: 1, color: PURPLE },
  { id: "db",     label: "PostgreSQL",      emoji: "🗄️", col: 3, row: 1, color: BLUE   },
];

const EDGES = [
  { from: "client", to: "cdn",   label: "request" },
  { from: "cdn",    to: "app",   label: "cache miss" },
  { from: "app",    to: "redis", label: "lookup" },
  { from: "app",    to: "db",    label: "on miss / write" },
  { from: "app",    to: "idgen", label: "shorten" },
  { from: "idgen",  to: "db",    label: "store mapping" },
];

function ArchDiagram() {
  const maxCol = Math.max(...NODES.map(n => n.col));
  const maxRow = Math.max(...NODES.map(n => n.row));
  const vw = (maxCol + 1) * CELL_W + 20;
  const vh = (maxRow + 1) * CELL_H + 20;

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, nr(n.col, n.row)]));

  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ overflow: "visible" }}>
      <defs>
        <marker id="arrow-url" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--viz-border)" />
        </marker>
      </defs>

      {/* Edges */}
      {EDGES.map(e => {
        const a = nodeMap[e.from], b = nodeMap[e.to];
        const { x1, y1, x2, y2 } = edgePts(a, b);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--viz-border)" strokeWidth="1.5"
              markerEnd="url(#arrow-url)"
            />
            <text
              x={mx} y={my - 5}
              textAnchor="middle"
              fontSize="9"
              fill="var(--viz-muted)"
              fontFamily="monospace"
            >{e.label}</text>
          </g>
        );
      })}

      {/* Nodes */}
      {NODES.map(n => {
        const r = nodeMap[n.id];
        return (
          <g key={n.id}>
            <rect
              x={r.x} y={r.y} width={NODE_W} height={NODE_H}
              rx="8" ry="8"
              fill="var(--viz-surface)"
              stroke={n.color}
              strokeWidth="1.5"
            />
            <text x={r.cx} y={r.cy - 6} textAnchor="middle" fontSize="14" dominantBaseline="middle">{n.emoji}</text>
            <text x={r.cx} y={r.cy + 11} textAnchor="middle" fontSize="10" fill={n.color} fontWeight="600" fontFamily="sans-serif">{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function App() {
  const [deepOpen, setDeepOpen] = useState({});
  const toggleDeep = (k) => setDeepOpen(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1 flex-wrap">
        <span className="text-xl">🔗</span>
        <h1 className="font-semibold text-base">URL Shortener</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">System Design · Storage & Caching</Chip>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 max-w-4xl mx-auto">
          <Tabs aria-label="URL Shortener" color="primary" variant="underlined">

            {/* ── Tab 0: Requirements ── */}
            <Tab key="requirements" title="Requirements">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

                {/* Functional */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Functional Requirements</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { req: "Shorten a long URL → unique short code", note: "Core feature" },
                      { req: "Redirect short URL → original URL",       note: "301 or 302" },
                      { req: "Custom alias support (optional)",          note: "Nice to have" },
                      { req: "URL expiration / TTL (optional)",          note: "Delete or deactivate" },
                      { req: "Analytics: click counts per short URL",    note: "Optional stretch goal" },
                    ].map(({ req, note }) => (
                      <div key={req} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <span className="text-xs font-mono shrink-0" style={{ color: TEAL }}>{req}</span>
                        <span className="text-xs text-default-400 min-w-0 flex-1">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>

                {/* Non-functional */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Non-Functional Requirements & Scale</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { metric: "100M URLs stored",           color: TEAL  },
                      { metric: "1B redirect requests / day", color: GOLD  },
                      { metric: "< 10ms redirect latency",    color: BLUE  },
                      { metric: "99.99% availability",        color: TEAL  },
                      { metric: "Read-heavy: ~100:1 read/write ratio", color: RED },
                    ].map(({ metric, color }) => (
                      <div key={metric} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: "var(--viz-surface)", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}` }}>
                        <span className="text-xs font-mono" style={{ color }}>{metric}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg text-xs text-default-500 leading-relaxed"
                    style={{ background: `${GOLD}0d`, border: `1px solid ${GOLD}44` }}>
                    <span style={{ color: GOLD, fontWeight: 700 }}>Back of envelope: </span>
                    1B reads/day ÷ 86,400 ≈ <strong>~11,600 RPS average</strong>, peak ~35K RPS.
                    100M URLs × 500 bytes avg ≈ <strong>~50GB total storage</strong> — fits on a single DB instance.
                  </div>
                </CardBody></Card>

                {/* API */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">API Endpoints</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { method: "POST", path: "/shorten",    body: '{ "url": "...", "alias"?: "...", "ttl"?: 3600 }', resp: '{ "code": "abc123" }',            desc: "Create a short code for the given URL" },
                      { method: "GET",  path: "/{code}",     body: "—",                                               resp: "HTTP 302 Location: <original>",  desc: "Redirect to original URL" },
                      { method: "GET",  path: "/{code}/info",body: "—",                                               resp: '{ "url": "...", "clicks": 42 }', desc: "Get metadata and analytics" },
                      { method: "DELETE",path:"/{code}",     body: "—",                                               resp: "HTTP 204",                       desc: "Delete a short URL" },
                    ].map(({ method, path, body, resp, desc }) => {
                      const mc = { GET: TEAL, POST: GOLD, DELETE: RED, PUT: BLUE }[method] ?? BLUE;
                      return (
                        <div key={path + method} className="py-3 flex gap-3 items-start flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded shrink-0"
                            style={{ background: `${mc}22`, color: mc, border: `1px solid ${mc}44` }}>{method}</span>
                          <code className="text-xs font-mono shrink-0" style={{ color: TEAL }}>{path}</code>
                          <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardBody></Card>
              </div>
            </Tab>

            {/* ── Tab 1: Architecture ── */}
            <Tab key="architecture" title="Architecture">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

                {/* Diagram */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">System Architecture</p>
                  <div className="rounded-xl p-4 overflow-x-auto"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <ArchDiagram />
                  </div>
                </CardBody></Card>

                {/* Flow legend */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Request Flows</p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        num: "1", color: TEAL, title: "Read path (GET /{code})",
                        steps: ["Client → CDN (cache hit → 302 directly)", "CDN cache miss → App Server", "App checks Redis → found → 302 redirect", "Redis miss → query PostgreSQL → cache result → 302 redirect"],
                      },
                      {
                        num: "2", color: GOLD, title: "Write path (POST /shorten)",
                        steps: ["Client → CDN → App Server", "App calls ID Generator for unique 7-char Base62 code", "App stores { code → url } in PostgreSQL and Redis", "Returns { code } to client"],
                      },
                    ].map(({ num, color, title, steps }) => (
                      <div key={num} className="rounded-lg p-4"
                        style={{ background: `${color}0d`, border: `1px solid ${color}33` }}>
                        <p className="text-xs font-bold mb-2" style={{ color }}>{num}. {title}</p>
                        <ol className="flex flex-col gap-1">
                          {steps.map((s, i) => (
                            <li key={i} className="text-xs text-default-500 flex gap-2">
                              <span style={{ color, fontWeight: 700 }}>{i + 1}.</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>
              </div>
            </Tab>

            {/* ── Tab 2: Deep Dive ── */}
            <Tab key="deep-dive" title="Deep Dive">
              <div className="flex flex-col gap-3 max-w-3xl mx-auto py-4 pb-10">
                {[
                  {
                    key: "idgen", color: TEAL, emoji: "🔢", title: "ID Generation — Base62 vs Hashing",
                    body: `Two main approaches:

**Counter + Base62 (recommended):** A monotonically increasing counter (e.g. from a DB sequence or ZooKeeper range) converted to Base62. 7 Base62 chars = 62⁷ ≈ 3.5 trillion unique URLs. No collision risk, deterministic length, fast.

**MD5/SHA hash:** Hash the input URL and take the first 7 chars of the Base62-encoded hash. Risk: collisions (two URLs → same prefix) require a retry loop. Also: two users shortening the same URL would get the same code — could be a feature or a bug depending on requirements.

For distributed ID generation, allocate ranges to each app server (server 1 gets 0–999999, server 2 gets 1000000–1999999, etc.) or use a centralized counter with ZooKeeper. Snowflake IDs also work but are more than needed here.`,
                  },
                  {
                    key: "redirect", color: GOLD, emoji: "↩️", title: "301 vs 302 Redirect",
                    body: `This is a deliberate choice with real consequences:

**301 Permanent redirect:** The browser caches the redirect permanently and never hits your servers again for that short URL. Reduces server load and latency for repeat visitors. But: you lose click analytics (browser goes direct), and you can't update or expire the destination.

**302 Temporary redirect:** Browser always hits your server before redirecting. You capture every click for analytics, can change the destination URL, and can deactivate links. Costs one extra server round-trip per click.

**Default choice: 302** — the flexibility for analytics and link management is worth the extra hop. Only use 301 if you're explicitly optimizing for latency and don't need analytics.`,
                  },
                  {
                    key: "caching", color: RED, emoji: "⚡", title: "Caching Strategy",
                    body: `Cache-aside with Redis is the right pattern here:

**Read:** Check Redis first (O(1) lookup by code). Cache hit → redirect immediately. Miss → query PostgreSQL → store in Redis with TTL → redirect.

**Write:** On URL creation, optionally pre-warm the cache by writing the new mapping to Redis immediately (write-through). On URL deletion or update, invalidate the Redis key.

**TTL:** Match the URL's expiry time if it has one. For permanent URLs, use a long TTL (24h–7 days) and refresh on access (sliding window). Short TTLs mean more DB hits; long TTLs risk serving stale data after a URL is deleted.

**Cache size:** The top 20% of URLs get 80% of traffic. At 100M URLs × 500 bytes metadata each, the hot set is ~10GB — fits in a single Redis instance easily.`,
                  },
                  {
                    key: "db", color: BLUE, emoji: "🗄️", title: "Database Schema & Indexing",
                    body: `Minimal schema — this is essentially a key-value store:

\`\`\`sql
CREATE TABLE urls (
  code        VARCHAR(10)  PRIMARY KEY,     -- the short code
  original    TEXT         NOT NULL,        -- the full URL
  user_id     INT,                          -- nullable (anonymous allowed)
  created_at  TIMESTAMP    DEFAULT NOW(),
  expires_at  TIMESTAMP,                    -- NULL = never expires
  click_count BIGINT       DEFAULT 0
);
\`\`\`

The PRIMARY KEY on code covers the redirect lookup (only access pattern that matters for performance). No joins needed. For analytics, click_count update can be async (write to Kafka → batch increment) to avoid hot row contention at 11K RPS.

At 100M rows × ~600 bytes avg = ~60GB — comfortably fits on a single Postgres instance with SSD. Add a read replica if needed.`,
                  },
                  {
                    key: "scale", color: PURPLE, emoji: "📈", title: "Scaling Beyond Single Servers",
                    body: `At 35K peak RPS, a single Postgres instance handles reads fine with Redis absorbing 99%+ of traffic. Here's when to scale each component:

**App servers:** Stateless → horizontal scale behind load balancer. Auto-scale based on CPU/RPS.

**Redis:** Single instance handles 100K+ ops/sec. If that's not enough, Redis Cluster shards by code hash. For failover, use Redis Sentinel or Cluster with replicas.

**PostgreSQL:** Read replicas absorb any cache misses. For writes (URL creation), a single primary handles 10K+ writes/sec easily at this scale. Sharding by code prefix is an option if you grow to billions of URLs and need more write throughput.

**CDN:** Cache redirect responses at the edge for popular short URLs (cache the 302 response). This cuts ~80% of traffic before it reaches your origin servers.`,
                  },
                ].map(({ key, color, emoji, title, body }) => (
                  <div key={key} className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid var(--viz-border)`, borderLeft: `4px solid ${color}` }}>
                    <button
                      onClick={() => toggleDeep(key)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      style={{ background: "var(--viz-surface)" }}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
                      <span className="text-xs" style={{ color, transform: deepOpen[key] ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▶</span>
                    </button>
                    {deepOpen[key] && (
                      <div className="px-4 pb-4 pt-2" style={{ background: `${color}05` }}>
                        <div className="text-xs text-default-500 leading-relaxed whitespace-pre-line">{body}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Tab>

            {/* ── Tab 3: Tradeoffs ── */}
            <Tab key="tradeoffs" title="Tradeoffs">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Design Decisions</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      {
                        decision: "ID Generation: Base62 counter vs MD5 hash",
                        chose: "Base62 counter",
                        why: "Zero collision risk, predictable 7-char length, simpler to reason about. MD5 requires a collision-retry loop and produces inconsistent-length codes.",
                        color: TEAL,
                      },
                      {
                        decision: "Redirect type: 301 Permanent vs 302 Temporary",
                        chose: "302 Temporary",
                        why: "Enables click analytics and future URL edits/deactivation. 301 is a one-way door — once cached by browsers it's impossible to retract.",
                        color: GOLD,
                      },
                      {
                        decision: "Database: SQL vs NoSQL",
                        chose: "PostgreSQL (SQL)",
                        why: "Simple key-value access pattern fits well; ACID guarantees prevent double-issuing the same code; the data volume (50GB) doesn't require horizontal sharding.",
                        color: BLUE,
                      },
                      {
                        decision: "Caching: write-through vs cache-aside",
                        chose: "Cache-aside (lazy loading)",
                        why: "Only cache what's actually accessed. Write-through would pre-populate every URL including those never clicked, wasting Redis memory.",
                        color: RED,
                      },
                      {
                        decision: "Analytics: synchronous vs async click counting",
                        chose: "Async (Kafka → batch write)",
                        why: "Synchronous UPDATE on click_count at 11K RPS creates hot row contention. Async buffering via Kafka decouples the write path and allows batch increments.",
                        color: PURPLE,
                      },
                    ].map(({ decision, chose, why, color }) => (
                      <div key={decision} className="py-4 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-foreground">{decision}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[11px] px-2 py-0.5 rounded font-semibold shrink-0"
                            style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                            ✓ {chose}
                          </span>
                        </div>
                        <p className="text-xs text-default-500 leading-relaxed">{why}</p>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>

                {/* Common Mistakes */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Common Interview Mistakes</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: "❌", color: RED,  tip: "Using a random hash (UUID/MD5) for the code without handling collisions — always justify your ID generation choice." },
                      { icon: "❌", color: RED,  tip: "Proposing sharding from the start — 50GB fits on one DB, shard only when you need it." },
                      { icon: "❌", color: RED,  tip: "Forgetting that 301 redirects get cached by browsers forever — you can't undo them." },
                      { icon: "✅", color: TEAL, tip: "Mention the read:write ratio upfront — it justifies the caching strategy immediately." },
                      { icon: "✅", color: TEAL, tip: "Do the capacity math: 1B reads/day ÷ 86400 ≈ 11.6K RPS shows you don't need extreme scaling." },
                    ].map(({ icon, color, tip }) => (
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                        style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                        <span>{icon}</span>
                        <span className="text-xs text-default-500 leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>
              </div>
            </Tab>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
