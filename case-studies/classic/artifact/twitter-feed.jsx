export const difficulty = 'Hard'

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
const CELL_W = 155;
const CELL_H = 110;
const NODE_W = 128;
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
  { id: "client",   label: "Client",          emoji: "💻", col: 0, row: 0, color: BLUE   },
  { id: "api",      label: "API Gateway",      emoji: "🚪", col: 1, row: 0, color: GOLD   },
  { id: "tweet",    label: "Tweet Service",    emoji: "✍️", col: 2, row: 0, color: TEAL   },
  { id: "fanout",   label: "Fanout Service",   emoji: "📡", col: 3, row: 0, color: PURPLE },
  { id: "feed",     label: "Feed Cache",       emoji: "⚡", col: 4, row: 0, color: RED    },
  { id: "timeline", label: "Timeline Service", emoji: "📰", col: 2, row: 1, color: TEAL   },
  { id: "kafka",    label: "Kafka",            emoji: "📨", col: 3, row: 1, color: GOLD   },
  { id: "db",       label: "Tweet DB",         emoji: "🗄️", col: 4, row: 1, color: BLUE   },
];

const EDGES = [
  { from: "client",   to: "api",      label: "all requests" },
  { from: "api",      to: "tweet",    label: "post tweet" },
  { from: "api",      to: "timeline", label: "read feed" },
  { from: "tweet",    to: "db",       label: "persist" },
  { from: "tweet",    to: "kafka",    label: "publish event" },
  { from: "kafka",    to: "fanout",   label: "consume" },
  { from: "fanout",   to: "feed",     label: "push to followers" },
  { from: "timeline", to: "feed",     label: "read cache" },
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
        <marker id="arrow-tw" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
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
              markerEnd="url(#arrow-tw)" />
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

export default function App() {
  const [deepOpen, setDeepOpen] = useState({});
  const toggleDeep = (k) => setDeepOpen(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1 flex-wrap">
        <span className="text-xl">🐦</span>
        <h1 className="font-semibold text-base">Twitter / Social Feed</h1>
        <Chip size="sm" color="danger" variant="flat">Hard</Chip>
        <Chip size="sm" color="primary" variant="flat">System Design · Social Networks</Chip>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 max-w-4xl mx-auto">
          <Tabs aria-label="Twitter Feed" color="primary" variant="underlined">

            {/* ── Tab 0: Requirements ── */}
            <Tab key="requirements" title="Requirements">
              <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Functional Requirements</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { req: "Post a tweet (text, images, videos)",      note: "Core write path" },
                      { req: "View home timeline (chronological feed)",  note: "Core read path" },
                      { req: "Follow / unfollow users",                  note: "Social graph" },
                      { req: "Like, retweet, reply",                     note: "Engagement actions" },
                      { req: "Search tweets and users",                  note: "Stretch goal" },
                      { req: "Trending topics / hashtags",               note: "Stretch goal" },
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
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Scale Numbers</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { metric: "300M daily active users",                color: TEAL   },
                      { metric: "500M tweets posted / day (~6K TPS)",    color: GOLD   },
                      { metric: "Home timeline reads: ~300B / day (~3.5M RPS)", color: BLUE },
                      { metric: "Average follower count: ~200",           color: TEAL   },
                      { metric: "Celebrity accounts: up to 100M followers", color: RED  },
                      { metric: "Read:Write ratio ≈ 600:1",               color: PURPLE },
                    ].map(({ metric, color }) => (
                      <div key={metric} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: "var(--viz-surface)", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}` }}>
                        <span className="text-xs font-mono" style={{ color }}>{metric}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg text-xs text-default-500 leading-relaxed"
                    style={{ background: `${GOLD}0d`, border: `1px solid ${GOLD}44` }}>
                    <span style={{ color: GOLD, fontWeight: 700 }}>Key insight: </span>
                    The 600:1 read/write ratio means the read path is the bottleneck, not writes. All major decisions revolve around making timeline reads fast.
                  </div>
                </CardBody></Card>

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">API Endpoints</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { method: "POST", path: "/tweets",             desc: "Post a new tweet" },
                      { method: "GET",  path: "/timeline",           desc: "Get home timeline (paginated, cursor-based)" },
                      { method: "GET",  path: "/users/{id}/tweets",  desc: "Get a user's own tweets" },
                      { method: "POST", path: "/follows",            desc: "Follow a user" },
                      { method: "DELETE",path:"/follows/{id}",       desc: "Unfollow a user" },
                      { method: "POST", path: "/tweets/{id}/like",   desc: "Like a tweet" },
                    ].map(({ method, path, desc }) => {
                      const mc = { GET: TEAL, POST: GOLD, DELETE: RED }[method] ?? BLUE;
                      return (
                        <div key={path + method} className="py-3 flex gap-3 items-start flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded shrink-0"
                            style={{ background: `${mc}22`, color: mc, border: `1px solid ${mc}44` }}>{method}</span>
                          <code className="text-xs font-mono shrink-0" style={{ color: TEAL }}>{path}</code>
                          <span className="text-xs text-default-500 min-w-0 flex-1">{desc}</span>
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

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">System Architecture</p>
                  <div className="rounded-xl p-4 overflow-x-auto"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <ArchDiagram />
                  </div>
                </CardBody></Card>

                {/* Fanout comparison */}
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">The Core Choice: Fanout Strategy</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border"
                      style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-2" style={{ color: TEAL }}>Fanout on Write (Push)</p>
                      <p className="text-xs text-default-500 leading-relaxed mb-2">
                        When a tweet is posted, immediately push it into every follower's pre-built feed cache. Reads are instant (O(1) cache lookup). Writes are expensive — one tweet by a user with 1M followers = 1M cache writes.
                      </p>
                      <p className="text-xs font-mono" style={{ color: TEAL }}>Good for: regular users (&lt;10K followers)</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border"
                      style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-2" style={{ color: GOLD }}>Fanout on Read (Pull)</p>
                      <p className="text-xs text-default-500 leading-relaxed mb-2">
                        When a user reads their feed, fetch tweets from everyone they follow and merge them on-the-fly. No write overhead. Reads are slow — must query N users' tweet lists and merge + sort.
                      </p>
                      <p className="text-xs font-mono" style={{ color: GOLD }}>Good for: celebrities (100M followers)</p>
                    </div>
                  </div>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${PURPLE}0d`, borderColor: `${PURPLE}44` }}>
                    <span style={{ color: PURPLE }} className="font-bold">Hybrid approach (Twitter's actual solution): </span>
                    Use fanout-on-write for most users. For celebrities (followers {'>'} threshold ~10K), skip the push and merge their tweets at read time. Most users follow few celebrities, so the read-time merge is bounded.
                  </div>
                </CardBody></Card>

                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Request Flows</p>
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        num: "1", color: TEAL, title: "Post tweet",
                        steps: [
                          "Client → API Gateway → Tweet Service",
                          "Tweet Service persists tweet to Tweet DB (Cassandra or MySQL)",
                          "Tweet Service publishes tweet event to Kafka",
                          "Fanout Service consumes event, looks up follower list from Social Graph DB",
                          "For each follower (if not celebrity): prepend tweet_id to their Feed Cache (Redis sorted set)",
                        ],
                      },
                      {
                        num: "2", color: GOLD, title: "Read home timeline",
                        steps: [
                          "Client → API Gateway → Timeline Service",
                          "Timeline Service reads pre-built feed from Redis (list of tweet_ids)",
                          "For followed celebrities: fetch their recent tweets from Tweet DB (fan-in on read)",
                          "Merge celebrity tweets with pre-built feed, sort by timestamp",
                          "Hydrate tweet_ids → full tweet objects via Tweet Service (or cache)",
                          "Return paginated timeline to client",
                        ],
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
                    key: "feed-cache", color: TEAL, emoji: "⚡", title: "Feed Cache — Redis Sorted Sets",
                    body: `Each user has a Redis sorted set keyed by user_id. Entries are tweet_ids with timestamps as scores. This enables:

- O(log N) prepend on write (ZADD)
- O(log N) range reads for pagination (ZREVRANGEBYSCORE)
- Eviction of old tweets by score (ZREMRANGEBYSCORE)

Cap each feed to the most recent ~800 tweet_ids (Twitter's actual limit). Older tweets are fetched from the DB on demand when the user scrolls far back.

Feed cache size estimate: 300M users × 800 tweet_ids × 8 bytes = ~1.9TB. This is spread across a Redis Cluster of ~20 nodes (100GB each).`,
                  },
                  {
                    key: "tweet-db", color: BLUE, emoji: "🗄️", title: "Tweet Storage — Cassandra",
                    body: `Tweets are write-heavy append-only data — a great fit for Cassandra:

- Partition key: user_id — keeps all tweets by a user on one partition
- Clustering key: tweet_id (time-ordered via Snowflake ID) — enables efficient range scans for "get latest tweets by user"
- No updates (tweets are immutable once posted)
- Wide column model handles sparse engagement data (likes, retweets) efficiently

Schema sketch:
  tweets (user_id, tweet_id, content, media_ids, created_at, like_count, retweet_count)

Why not MySQL? At 500M tweets/day, write throughput (6K TPS) and storage growth (50GB/day) push past comfortable single-node MySQL territory within months. Cassandra's linear horizontal scalability fits better.`,
                  },
                  {
                    key: "social-graph", color: PURPLE, emoji: "👥", title: "Social Graph Storage",
                    body: `The follower/following relationship is a directed graph. Two access patterns dominate:

1. "Who follows user X?" (needed during fanout-on-write)
2. "Who does user X follow?" (needed to build feed on read)

Store in a dedicated Social Graph service backed by a wide-column DB:
- followers table: (user_id, follower_id) — partition by user_id
- following table: (user_id, followee_id) — partition by user_id

For celebrities with 100M+ followers, streaming the full follower list during fanout takes time. Skip the push for these accounts and use fanout-on-read instead (the hybrid approach).

A graph DB (Neo4j) is overkill here — you don't need multi-hop traversal, just 1-hop neighbor lookups.`,
                  },
                  {
                    key: "media", color: GOLD, emoji: "🖼️", title: "Media Storage (Images & Videos)",
                    body: `Never route media through your app servers. The pattern:

1. Client requests a presigned S3 upload URL from the Media Service
2. Client uploads directly to S3 (bypasses your servers)
3. Client sends the S3 key to the Tweet Service along with tweet text
4. Media Service kicks off async processing: thumbnail generation, video transcoding, CDN propagation
5. CDN serves media to end users (never from S3 directly — too slow and expensive)

Video transcoding is async — tweet is created immediately with a "processing" status, then updated once the video is ready. This is the long-running task pattern.

Storage: S3 with lifecycle policies to move old media to cheaper Glacier storage after 90 days.`,
                  },
                  {
                    key: "search", color: RED, emoji: "🔍", title: "Search & Trending Topics",
                    body: `Full-text tweet search requires a dedicated search index — Postgres/Cassandra don't support efficient full-text at this scale.

Architecture:
1. Tweet Service publishes to Kafka on every new tweet
2. Search Indexer consumes Kafka, indexes tweet into Elasticsearch
3. Search queries hit Elasticsearch directly
4. Elasticsearch is eventually consistent (small lag behind primary DB)

For trending topics / hashtags:
- Extract hashtags at write time, publish counts to a stream processor (Flink or Spark Streaming)
- Aggregate counts in sliding time windows (e.g., last 10 minutes)
- Store top-N trending hashtags in Redis, refresh every 30 seconds
- Read latency: O(1) from Redis

This is a separate pipeline from the main tweet flow — don't mix them.`,
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
                        decision: "Fanout: on-write vs on-read vs hybrid",
                        chose: "Hybrid — push for regular users, pull for celebrities",
                        why: "Pure fanout-on-write fails for celebrities (100M writes per tweet). Pure fanout-on-read fails at 3.5M RPS (too slow). Hybrid caps worst-case write fan-out and keeps reads fast for the common case.",
                        color: PURPLE,
                      },
                      {
                        decision: "Tweet storage: Cassandra vs MySQL",
                        chose: "Cassandra",
                        why: "Append-only workload with high write throughput and no joins makes Cassandra's wide-column model ideal. MySQL would require sharding at this scale, adding operational complexity.",
                        color: BLUE,
                      },
                      {
                        decision: "Feed representation: tweet_ids vs full tweet objects in cache",
                        chose: "Store only tweet_ids in feed cache",
                        why: "If tweets are mutable (edits, deletes), caching full objects creates stale data problems. tweet_id references are tiny (8 bytes) and resolve to current tweet data on read.",
                        color: TEAL,
                      },
                      {
                        decision: "Timeline pagination: offset vs cursor",
                        chose: "Cursor-based (tweet_id as cursor)",
                        why: "New tweets are posted constantly. Offset pagination would shift results between pages (user sees duplicates or misses tweets). Cursor-based pagination is stable as new content arrives.",
                        color: GOLD,
                      },
                      {
                        decision: "Consistency: strong vs eventual",
                        chose: "Eventual consistency for feeds",
                        why: "A follower seeing a tweet 1–2 seconds after it's posted is acceptable. Strong consistency would require cross-shard coordination at 3.5M RPS — prohibitively expensive.",
                        color: RED,
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
                      { icon: "❌", color: RED,  tip: "Proposing only fanout-on-write without addressing the celebrity problem — always acknowledge the hotspot." },
                      { icon: "❌", color: RED,  tip: "Using SQL joins to build the timeline at read time — this is what kills read performance at scale." },
                      { icon: "❌", color: RED,  tip: "Storing full tweet objects in the feed cache — they become stale on edit/delete." },
                      { icon: "✅", color: TEAL, tip: "Start with the read:write ratio (600:1) — it immediately justifies the pre-computed feed approach." },
                      { icon: "✅", color: TEAL, tip: "Mention the hybrid fanout explicitly and define the celebrity threshold (~10K followers)." },
                      { icon: "✅", color: TEAL, tip: "Use cursor-based pagination for any feed with real-time updates." },
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
