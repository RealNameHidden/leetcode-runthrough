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
      ? { x1: a.x + NODE_W, y1: a.cy, x2: b.x,         y2: b.cy }
      : { x1: a.x,          y1: a.cy, x2: b.x + NODE_W, y2: b.cy };
  }
  return dy > 0
    ? { x1: a.cx, y1: a.y + NODE_H, x2: b.cx, y2: b.y }
    : { x1: a.cx, y1: a.y,          x2: b.cx, y2: b.y + NODE_H };
}

const NODES = [
  { id: "client",  label: "Client",          emoji: "💻", col: 0, row: 0, color: BLUE   },
  { id: "lb",      label: "Load Balancer",   emoji: "⚖️", col: 1, row: 0, color: GOLD   },
  { id: "rl",      label: "Rate Limiter",    emoji: "🚦", col: 2, row: 0, color: RED    },
  { id: "api",     label: "API Servers",     emoji: "⚙️", col: 3, row: 0, color: TEAL   },
  { id: "redis",   label: "Redis Cluster",   emoji: "🔴", col: 2, row: 1, color: RED    },
  { id: "rules",   label: "Rules Service",   emoji: "📋", col: 3, row: 1, color: PURPLE },
];

const EDGES = [
  { from: "client", to: "lb",    label: "request" },
  { from: "lb",     to: "rl",    label: "forward" },
  { from: "rl",     to: "api",   label: "allowed" },
  { from: "rl",     to: "redis", label: "check/incr counter" },
  { from: "rl",     to: "rules", label: "fetch limits" },
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
        <marker id="arrow-rl" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--viz-border)" />
        </marker>
      </defs>
      {EDGES.map(e => {
        const a = nodeMap[e.from], b = nodeMap[e.to];
        const { x1, y1, x2, y2 } = edgePts(a, b);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--viz-border)" strokeWidth="1.5"
              markerEnd="url(#arrow-rl)" />
            <text x={mx} y={my - 5} textAnchor="middle" fontSize="9"
              fill="var(--viz-muted)" fontFamily="monospace">{e.label}</text>
          </g>
        );
      })}
      {NODES.map(n => {
        const r = nodeMap[n.id];
        return (
          <g key={n.id}>
            <rect x={r.x} y={r.y} width={NODE_W} height={NODE_H}
              rx="8" ry="8" fill="var(--viz-surface)" stroke={n.color} strokeWidth="1.5" />
            <text x={r.cx} y={r.cy - 6} textAnchor="middle" fontSize="14" dominantBaseline="middle">{n.emoji}</text>
            <text x={r.cx} y={r.cy + 11} textAnchor="middle" fontSize="10"
              fill={n.color} fontWeight="600" fontFamily="sans-serif">{n.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Algorithm Comparison ─────────────────────────────────────────────
const ALGORITHMS = [
  {
    name: "Token Bucket",
    color: TEAL,
    emoji: "🪣",
    pros: ["Allows short bursts up to bucket capacity", "Smooth average rate", "Easy to implement"],
    cons: ["Bucket size must be tuned carefully", "Race condition risk without atomic ops"],
    when: "General API rate limiting where bursting is acceptable",
    complexity: "O(1) per request",
    redis: "INCRBY + EXPIRE on a counter key",
  },
  {
    name: "Sliding Window Log",
    color: GOLD,
    emoji: "📜",
    pros: ["Precise — no boundary spike problem", "Accurate rate calculation at any moment"],
    cons: ["High memory: stores timestamp of every request", "Not practical above ~1K RPS per user"],
    when: "Low-volume APIs where precision matters (e.g. payment endpoints)",
    complexity: "O(N) per request (N = requests in window)",
    redis: "ZADD timestamps + ZREMRANGEBYSCORE to evict old entries",
  },
  {
    name: "Sliding Window Counter",
    color: BLUE,
    emoji: "🔢",
    pros: ["Low memory (O(1))", "No boundary spike problem", "Good accuracy (~0.003% error)"],
    cons: ["Assumes even distribution within prior window (approximation)"],
    when: "Production default — best balance of accuracy and efficiency",
    complexity: "O(1) per request",
    redis: "Two INCR keys (current + previous window) with weighted calculation",
  },
  {
    name: "Fixed Window Counter",
    color: PURPLE,
    emoji: "🪟",
    pros: ["Simplest to implement", "O(1) memory and time"],
    cons: ["Boundary spike: 2× the limit can pass at window boundary"],
    when: "Non-critical limits where the boundary spike is acceptable",
    complexity: "O(1) per request",
    redis: "INCR + EXPIRE on a key per user per window",
  },
  {
    name: "Leaky Bucket",
    color: RED,
    emoji: "💧",
    pros: ["Perfectly smooth output rate", "No bursting"],
    cons: ["Queued requests add latency", "Old requests may be dropped for new ones"],
    when: "Outbound API calls where downstream needs steady flow (payment processors)",
    complexity: "O(1) per request",
    redis: "Queue + timestamp of last processed request",
  },
];

export default function App() {
  const [deepOpen, setDeepOpen] = useState({});
  const [selectedAlgo, setSelectedAlgo] = useState("Sliding Window Counter");
  const toggleDeep = (k) => setDeepOpen(p => ({ ...p, [k]: !p[k] }));

  const algo = ALGORITHMS.find(a => a.name === selectedAlgo);

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1 flex-wrap">
        <span className="text-xl">🚦</span>
        <h1 className="font-semibold text-base">Rate Limiter</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">System Design · Infrastructure</Chip>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 max-w-4xl mx-auto">
          <Tabs aria-label="Rate Limiter" color="primary" variant="underlined">

            {/* ── Tab 0: Requirements ── */}
            <Tab key="requirements" title="Requirements">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Functional Requirements</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { req: "Limit requests per user/IP within a time window",      note: "e.g. 100 req/min per user" },
                      { req: "Return HTTP 429 with Retry-After header when limited", note: "Standard response" },
                      { req: "Support multiple rule types",                           note: "per-user, per-IP, per-endpoint, global" },
                      { req: "Rules configurable without code deploy",               note: "Rules Service / config store" },
                      { req: "Works across multiple API server instances",           note: "Distributed — can't use in-memory only" },
                    ].map(({ req, note }) => (
                      <div key={req} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <span className="text-xs font-mono shrink-0" style={{ color: TEAL }}>{req}</span>
                        <span className="text-xs text-default-400 min-w-0 flex-1">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Non-Functional Requirements</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { metric: "Low latency: < 1ms overhead per request",       color: TEAL   },
                      { metric: "High availability: rate limiter must not block traffic if it fails", color: RED },
                      { metric: "Accuracy: no more than ~0.1% error on limits",   color: GOLD   },
                      { metric: "Scalability: handle millions of RPS",            color: BLUE   },
                      { metric: "Fault tolerant: Redis failure → fail open (allow traffic)", color: PURPLE },
                    ].map(({ metric, color }) => (
                      <div key={metric} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: "var(--viz-surface)", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}` }}>
                        <span className="text-xs font-mono" style={{ color }}>{metric}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg text-xs text-default-500 leading-relaxed"
                    style={{ background: `${GOLD}0d`, border: `1px solid ${GOLD}44` }}>
                    <span style={{ color: GOLD, fontWeight: 700 }}>Critical insight: </span>
                    The rate limiter sits in the hot path of every request. A 1ms overhead at 100K RPS = 100 seconds of added latency per second system-wide. Redis at ~0.1ms RTT is the right tool; a DB query (~5ms) is not.
                  </div>
                </CardBody></Card>

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Where to Implement</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { loc: "API Gateway (recommended)",    color: TEAL, desc: "Central enforcement. No app code changes. Handles all services at once. Add as middleware." },
                      { loc: "Client-side SDK",              color: GOLD, desc: "Can't be trusted alone — clients can bypass it. Use only as a courtesy to reduce unnecessary requests." },
                      { loc: "In each microservice",         color: BLUE, desc: "Flexible per-service limits. Higher operational overhead. Good for service-to-service limits." },
                      { loc: "Reverse proxy (Nginx/Envoy)", color: PURPLE, desc: "Fast, language-agnostic. Good for simple IP-based limits. Less flexible for complex rules." },
                    ].map(({ loc, color, desc }) => (
                      <div key={loc} className="rounded-lg p-3"
                        style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                        <p className="text-xs font-bold mb-1" style={{ color }}>{loc}</p>
                        <p className="text-xs text-default-500 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>
              </div>
            </Tab>

            {/* ── Tab 1: Architecture ── */}
            <Tab key="architecture" title="Architecture">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">System Architecture</p>
                  <div className="rounded-xl p-4 overflow-x-auto"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <ArchDiagram />
                  </div>
                </CardBody></Card>

                {/* Algorithm selector */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Comparison</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ALGORITHMS.map(a => (
                      <button
                        key={a.name}
                        onClick={() => setSelectedAlgo(a.name)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                          background: selectedAlgo === a.name ? `${a.color}22` : "var(--viz-surface)",
                          color: selectedAlgo === a.name ? a.color : "var(--color-default-500)",
                          border: `1px solid ${selectedAlgo === a.name ? a.color : "var(--viz-border)"}`,
                        }}
                      >
                        {a.emoji} {a.name}
                      </button>
                    ))}
                  </div>

                  {algo && (
                    <div className="rounded-xl p-4 border" style={{ background: `${algo.color}08`, borderColor: `${algo.color}33` }}>
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-36">
                          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: TEAL }}>Pros</p>
                          {algo.pros.map(p => (
                            <p key={p} className="text-xs text-default-500 mb-1 flex gap-1"><span style={{ color: TEAL }}>✓</span>{p}</p>
                          ))}
                        </div>
                        <div className="flex-1 min-w-36">
                          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: RED }}>Cons</p>
                          {algo.cons.map(c => (
                            <p key={c} className="text-xs text-default-500 mb-1 flex gap-1"><span style={{ color: RED }}>✗</span>{c}</p>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${algo.color}33` }}>
                        <p className="text-xs"><span style={{ color: GOLD, fontWeight: 700 }}>Best for: </span><span className="text-default-500">{algo.when}</span></p>
                        <p className="text-xs"><span style={{ color: BLUE, fontWeight: 700 }}>Complexity: </span><span className="text-default-400 font-mono">{algo.complexity}</span></p>
                        <p className="text-xs"><span style={{ color: PURPLE, fontWeight: 700 }}>Redis impl: </span><span className="text-default-400 font-mono">{algo.redis}</span></p>
                      </div>
                    </div>
                  )}
                </CardBody></Card>

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Request Flow</p>
                  <div className="rounded-lg p-4" style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}33` }}>
                    <ol className="flex flex-col gap-2">
                      {[
                        "Request arrives at Load Balancer → forwarded to Rate Limiter middleware",
                        "Rate Limiter fetches the applicable rule from Rules Service (cached in-process, refreshed every 60s)",
                        "Rate Limiter executes atomic Redis command (e.g. INCR + EXPIRE) to check + increment counter",
                        "Counter ≤ limit → forward request to API servers with X-RateLimit-* headers",
                        "Counter > limit → return HTTP 429 with Retry-After header. Do NOT forward to API servers.",
                        "Redis failure → fail open: allow request through and log the bypass for alerting",
                      ].map((step, i) => (
                        <li key={i} className="text-xs text-default-500 flex gap-2">
                          <span style={{ color: TEAL, fontWeight: 700 }}>{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardBody></Card>
              </div>
            </Tab>

            {/* ── Tab 2: Deep Dive ── */}
            <Tab key="deep-dive" title="Deep Dive">
              <div className="flex flex-col gap-3 max-w-3xl mx-auto py-4 pb-10">
                {[
                  {
                    key: "redis-impl", color: TEAL, emoji: "🔴", title: "Redis Implementation — Atomic Operations",
                    body: `The core challenge: check and increment must be atomic, or two simultaneous requests can both read "99/100" and both succeed, allowing 101 requests.

**Fixed Window Counter (simplest):**
\`\`\`
key = "rl:{user_id}:{window}"   # window = floor(now / 60)
count = INCR key
if count == 1: EXPIRE key 60    # set TTL on first request
if count > limit: return 429
\`\`\`
Race condition: INCR and EXPIRE are not atomic. Use a Lua script:
\`\`\`lua
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
\`\`\`
Lua scripts run atomically in Redis — no race conditions.

**Sliding Window Counter (production default):**
current_window_count + (prior_window_count × overlap_fraction)
where overlap_fraction = 1 - (elapsed_ms_in_current_window / window_ms)

Two Redis keys per user (current + previous window), each with EXPIRE.`,
                  },
                  {
                    key: "distributed", color: PURPLE, emoji: "🌐", title: "Distributed Rate Limiting",
                    body: `Single-node Redis handles ~100K ops/sec easily, but what about multiple Redis nodes?

**Problem:** If user's requests are spread across 3 rate limiter servers each talking to a different Redis shard, each shard sees 1/3 of the traffic. User could send 3× the limit.

**Solution A: Centralized Redis Cluster (recommended)**
All rate limiter instances talk to the same Redis Cluster. Consistent hashing ensures a given user_id always maps to the same Redis node. No synchronization needed. Works up to millions of RPS with Redis Cluster.

**Solution B: Sticky sessions at load balancer**
Route all requests from the same user to the same rate limiter instance which uses local memory. Simpler but breaks when rate limiter instances die.

**Solution C: Eventual consistency with gossip (for very high scale)**
Each instance maintains a local counter and periodically syncs with peers. Allows up to ~10% over-limit in exchange for much lower latency. Acceptable when limits aren't strict (e.g. spam prevention vs payment limits).`,
                  },
                  {
                    key: "rules", color: GOLD, emoji: "📋", title: "Rules & Configuration",
                    body: `Rules should be configurable without code deploys. Common rule types:

\`\`\`
rules:
  - type: per_user
    endpoint: /api/*
    limit: 1000
    window: 3600        # 1000 req/hour per user

  - type: per_ip
    endpoint: /auth/login
    limit: 5
    window: 300         # 5 login attempts per IP per 5 min

  - type: global
    endpoint: /api/search
    limit: 10000
    window: 60          # 10K total search req/min
\`\`\`

Store rules in a config file (YAML/JSON) that the Rules Service reads. Cache rules in-process with a 60-second TTL so every request doesn't need a Rules Service call. This keeps the overhead under 0.1ms.

Rule priority: more specific rules win (per-user > per-IP > global). Apply all matching rules and reject if any is exceeded.`,
                  },
                  {
                    key: "headers", color: BLUE, emoji: "📡", title: "Response Headers",
                    body: `Always return rate limit headers so clients can self-throttle:

\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 43
X-RateLimit-Reset: 1704067200    # Unix timestamp when window resets
Retry-After: 30                  # Only on 429 — seconds until retry
\`\`\`

These are standardized (RFC 6585 for 429, draft-ietf for RateLimit headers). Well-behaved API clients use Retry-After to back off automatically. Setting these headers correctly reduces retried requests by 60–80% in practice.

For 429 responses, also return a JSON body:
\`\`\`json
{
  "error": "rate_limit_exceeded",
  "limit": 100,
  "window": "1m",
  "retry_after": 30
}
\`\`\``,
                  },
                  {
                    key: "failopen", color: RED, emoji: "⚡", title: "Failure Mode — Fail Open vs Fail Closed",
                    body: `What happens when Redis goes down?

**Fail open (recommended for most APIs):** Allow all requests through. Log the bypass for alerting. Rate limiter outage becomes a visibility problem, not a service outage. This is the right call when your API has other abuse protections (auth, WAF) and a brief window of unlimited access is acceptable.

**Fail closed:** Reject all requests (return 503) when Redis is unavailable. Use only when rate limiting is security-critical — e.g. a financial API where unlimited access would cause direct financial loss.

**Mitigation:** Use Redis Sentinel or Redis Cluster for HA. Keep in-process fallback counters (local memory) as a best-effort backstop when Redis is unreachable — they won't be perfectly accurate across instances but are better than nothing.

Monitor Redis connection health separately with alerting so outages are caught in seconds, not minutes.`,
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
                      <span className="text-xs" style={{ color, display: "inline-block", transition: "transform 0.2s", transform: deepOpen[key] ? "rotate(90deg)" : "none" }}>▶</span>
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
                        decision: "Algorithm: Fixed Window vs Sliding Window Counter vs Token Bucket",
                        chose: "Sliding Window Counter",
                        why: "Eliminates the boundary spike of fixed window with O(1) memory. Token bucket is great but requires two Redis fields per user (tokens + last_refill_time) and careful tuning of burst size.",
                        color: TEAL,
                      },
                      {
                        decision: "Where to enforce: API Gateway vs in each service",
                        chose: "API Gateway middleware",
                        why: "Centralizes enforcement so no service can accidentally skip it. Easier to update rules globally. Only add per-service limiting if services need different limits than the gateway enforces.",
                        color: GOLD,
                      },
                      {
                        decision: "Counter storage: Redis vs in-process memory",
                        chose: "Redis (shared across instances)",
                        why: "In-process memory doesn't work with multiple server instances — each server would allow the full limit. Redis atomicity prevents race conditions.",
                        color: BLUE,
                      },
                      {
                        decision: "Failure mode: fail open vs fail closed",
                        chose: "Fail open (for most APIs)",
                        why: "Availability > perfect rate limiting for most systems. A brief window of unlimited access during Redis downtime is acceptable. Fail closed only for security-critical endpoints (auth, payments).",
                        color: RED,
                      },
                      {
                        decision: "Rate limit key: by user_id vs by IP address",
                        chose: "user_id (authenticated) + IP (unauthenticated)",
                        why: "IP-only limiting is easy to bypass (VPNs, NAT). user_id is the right unit for authenticated endpoints. Use IP as a fallback for login/signup where no auth exists yet.",
                        color: PURPLE,
                      },
                    ].map(({ decision, chose, why, color }) => (
                      <div key={decision} className="py-4 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-foreground">{decision}</p>
                        <span className="text-[11px] px-2 py-0.5 rounded font-semibold self-start"
                          style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                          ✓ {chose}
                        </span>
                        <p className="text-xs text-default-500 leading-relaxed">{why}</p>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Common Interview Mistakes</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { icon: "❌", color: RED,  tip: "Using a DB (Postgres/MySQL) to store counters — 5ms per request × millions of RPS = non-starter. Redis at 0.1ms is the only viable option." },
                      { icon: "❌", color: RED,  tip: "Non-atomic check-then-increment — two concurrent requests can both pass a limit of 1. Always use Lua scripts or Redis atomic commands." },
                      { icon: "❌", color: RED,  tip: "Forgetting about distributed rate limiting — a single in-memory counter doesn't work across multiple server instances." },
                      { icon: "✅", color: TEAL, tip: "Mention Retry-After header in 429 response — shows you've thought about the client experience." },
                      { icon: "✅", color: TEAL, tip: "Clarify fail-open vs fail-closed early — it signals that you understand availability vs correctness tradeoffs." },
                      { icon: "✅", color: TEAL, tip: "Recommend Sliding Window Counter as the default — explain it's a good balance of accuracy and efficiency." },
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
