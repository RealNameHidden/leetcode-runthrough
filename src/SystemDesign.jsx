import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Switch } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";
const PURPLE = "#a78bfa";

function publicAsset(path) {
  return `${import.meta.env.BASE_URL}${encodeURI(path)}`;
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function CoffeeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8h1a3 3 0 0 1 0 6h-1" />
      <path d="M2 8h14v5a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
      <path d="M6 22h8" />
    </svg>
  );
}

function ModeSwitch({ onSwitchToArchive }) {
  return (
    <div className="flex items-center rounded-full border border-divider bg-content2 p-1">
      <button
        type="button"
        onClick={onSwitchToArchive}
        className="rounded-full px-3 py-1.5 text-xs font-medium text-default-500 transition-colors hover:text-foreground"
      >
        Algorithms
      </button>
      <button
        type="button"
        className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-800 transition-colors dark:bg-purple-900/40 dark:text-purple-200"
      >
        System Design
      </button>
    </div>
  );
}

// ── Key Technologies Data ────────────────────────────────────────────
const TECHNOLOGIES = [
  // Databases
  { name: "PostgreSQL / MySQL", emoji: "🗄️", category: "Databases", color: BLUE,
    desc: "Relational databases with ACID transactions, SQL joins, and B-tree indexes.",
    when: "Transactional data, complex queries, strong consistency requirements.",
    key: "ACID, indexes, foreign keys, joins" },
  { name: "DynamoDB / Cassandra", emoji: "⚡", category: "Databases", color: TEAL,
    desc: "NoSQL databases built for horizontal scaling and flexible schemas.",
    when: "Write-heavy workloads, global scale, variable data shapes.",
    key: "Partition key, eventual consistency, wide-column" },
  { name: "MongoDB", emoji: "🍃", category: "Databases", color: "#4db380",
    desc: "Document store with flexible JSON-like schemas and rich query language.",
    when: "Hierarchical data, rapid iteration, document-centric access patterns.",
    key: "Collections, BSON, aggregation pipeline" },
  { name: "Graph Database", emoji: "🕸️", category: "Databases", color: PURPLE,
    desc: "Stores entities as nodes and relationships as edges for traversal queries.",
    when: "Social networks, recommendation engines, fraud detection.",
    key: "Nodes, edges, traversal, Neo4j" },
  // Storage
  { name: "Blob Storage (S3)", emoji: "🪣", category: "Storage", color: GOLD,
    desc: "Object storage for large unstructured files — images, videos, backups.",
    when: "Any large binary data. Store metadata in DB, file in S3.",
    key: "Presigned URLs, multipart upload, durability 99.999999999%" },
  { name: "Elasticsearch", emoji: "🔍", category: "Storage", color: "#f0b429",
    desc: "Distributed search engine with inverted indexes for full-text search.",
    when: "Full-text search, log analytics, autocomplete, fuzzy matching.",
    key: "Inverted index, tokenization, stemming, shards" },
  { name: "Time Series DB", emoji: "📈", category: "Storage", color: RED,
    desc: "Optimized for append-heavy time-stamped data like metrics and IoT.",
    when: "Monitoring, analytics, sensor data, financial tick data.",
    key: "InfluxDB, TimescaleDB, retention policies, downsampling" },
  { name: "Vector Database", emoji: "🧮", category: "Storage", color: PURPLE,
    desc: "Stores high-dimensional vectors for similarity/semantic search.",
    when: "AI embeddings, recommendation systems, semantic search.",
    key: "Pinecone, Weaviate, cosine similarity, ANN" },
  // Caching
  { name: "Redis", emoji: "🔴", category: "Caching", color: RED,
    desc: "In-memory data store used for caching, pub/sub, distributed locks, and rate limiting.",
    when: "Hot data caching, session storage, leaderboards, rate limiters.",
    key: "TTL, eviction policies, Lua scripts, pub/sub, sorted sets" },
  // Infrastructure
  { name: "CDN", emoji: "🌐", category: "Infrastructure", color: BLUE,
    desc: "Globally distributed edge servers that cache static content close to users.",
    when: "Static assets, media files, globally distributed read traffic.",
    key: "Edge nodes, cache invalidation, Cloudflare, CloudFront" },
  { name: "Load Balancer", emoji: "⚖️", category: "Infrastructure", color: TEAL,
    desc: "Distributes incoming traffic across multiple servers to prevent overload.",
    when: "Any multi-server deployment. L4 for TCP, L7 for HTTP routing.",
    key: "Round robin, least connections, health checks, sticky sessions" },
  { name: "API Gateway", emoji: "🚪", category: "Infrastructure", color: GOLD,
    desc: "Entry point that handles auth, rate limiting, routing, and logging.",
    when: "Microservices architecture, public APIs, authentication boundary.",
    key: "Kong, AWS API Gateway, rate limiting, JWT validation" },
  // Async
  { name: "Message Queue (Kafka/SQS)", emoji: "📨", category: "Async", color: PURPLE,
    desc: "Buffer bursty traffic and fan-out work to multiple consumers asynchronously.",
    when: "Decoupling services, retry logic, event-driven pipelines.",
    key: "Topics, partitions, consumer groups, dead letter queue" },
  { name: "Streams / Event Sourcing", emoji: "🌊", category: "Async", color: TEAL,
    desc: "Persist and replay event logs for real-time processing and audit trails.",
    when: "Real-time analytics, event sourcing, CQRS patterns.",
    key: "Kafka, log compaction, offset, replay" },
  { name: "Flink", emoji: "⚙️", category: "Async", color: BLUE,
    desc: "Stateful stream processing framework for complex event processing at scale.",
    when: "Real-time aggregations, fraud detection, windowed computations.",
    key: "Windowing, watermarks, exactly-once, stateful operators" },
  // Coordination
  { name: "ZooKeeper / etcd", emoji: "🦁", category: "Coordination", color: GOLD,
    desc: "Distributed coordination service for leader election and config management.",
    when: "Service discovery, distributed locks, cluster coordination.",
    key: "Consensus, znodes, watches, Raft protocol" },
  { name: "Distributed Locks", emoji: "🔒", category: "Coordination", color: RED,
    desc: "Mutually exclusive access to shared resources across multiple nodes.",
    when: "Preventing double-booking, exactly-once processing, critical sections.",
    key: "Redlock, TTL, fencing tokens, lease renewal" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TECHNOLOGIES.map(t => t.category)))];

// ── Patterns Data ────────────────────────────────────────────────────
const PATTERNS = [
  {
    name: "Pushing Realtime Updates",
    emoji: "📡",
    color: TEAL,
    image: publicAsset("system-design/pushing realtime updates.png"),
    tagline: "From polling to WebSockets — pick the right transport.",
    desc: "Enables real-time communication between servers and clients for immediate information delivery.",
    explain: "Use this when users need updates as they happen, like chat, notifications, or live dashboards. Start with simple polling, then move to SSE or WebSockets when latency and connection efficiency matter more.",
    progression: ["HTTP Polling", "Long Polling", "Server-Sent Events (SSE)", "WebSockets", "Pub/Sub"],
    techs: ["Redis Pub/Sub", "Kafka", "WebSockets", "SSE"],
    useCases: ["Chat apps", "Live dashboards", "Notifications", "Multiplayer games"],
    tip: "Start with HTTP polling until it no longer serves your needs. SSE is great for one-way server→client. WebSockets for bidirectional.",
  },
  {
    name: "Managing Long-Running Tasks",
    emoji: "⏳",
    color: GOLD,
    image: publicAsset("system-design/manage long running tasks.png"),
    tagline: "Return a job ID immediately, process in background.",
    desc: "Handles operations too lengthy for synchronous processing through deferred execution with job queues.",
    explain: "This pattern keeps APIs fast by acknowledging the request quickly and pushing the heavy work to background workers. It is a good fit for things like report generation or media processing, where the user can check status later.",
    progression: ["Client requests", "API returns job ID", "Worker picks up task", "Client polls status", "Notify on complete"],
    techs: ["Kafka / SQS", "Redis queues", "Worker pools", "Webhooks"],
    useCases: ["Video encoding", "Report generation", "Bulk imports", "ML inference"],
    tip: "Store job status in DB. Use exponential backoff for retries. Set max attempts and move to dead letter queue.",
  },
  {
    name: "Dealing with Contention",
    emoji: "🥊",
    color: RED,
    image: publicAsset("system-design/dealing with contention.png"),
    tagline: "Prevent race conditions when multiple users touch the same resource.",
    desc: "Prevents race conditions when multiple users access the same resources simultaneously.",
    explain: "Use this when two or more requests might mutate the same record at the same time, such as ticket booking or inventory reservation. The goal is to preserve correctness with optimistic concurrency, transactions, locks, or serialized processing.",
    progression: ["Optimistic locking (CAS)", "Pessimistic locking (SELECT FOR UPDATE)", "Distributed locks (Redis)", "Queue-based serialization"],
    techs: ["DB transactions", "Redis Redlock", "ZooKeeper", "Optimistic concurrency"],
    useCases: ["Concert ticket booking", "Auction bidding", "Inventory management", "Seat reservations"],
    tip: "Prefer optimistic concurrency for low-contention. Use distributed locks sparingly — they're a single point of failure.",
  },
  {
    name: "Scaling Reads",
    emoji: "📖",
    color: BLUE,
    image: publicAsset("system-design/scalingreads.png"),
    tagline: "Read replicas → caching → CDN. Apply in order.",
    desc: "Addresses high-volume read request bottlenecks through staged optimization.",
    explain: "Most products receive far more reads than writes, so read paths often become the first bottleneck. Start by improving database access, then scale out with replicas, caches, and CDNs to reduce latency and database pressure.",
    progression: ["Index optimization", "Read replicas", "Redis caching layer", "CDN for static", "Denormalization"],
    techs: ["PostgreSQL replicas", "Redis", "CDN", "Elasticsearch"],
    useCases: ["News feeds", "Product catalogs", "User profiles", "Search results"],
    tip: "Read:write ratios are often 10:1 to 100:1. Cache aggressively with short TTLs. Invalidation is the hard part.",
  },
  {
    name: "Scaling Writes",
    emoji: "✍️",
    color: PURPLE,
    tagline: "Shard by partition key. Choose keys that distribute evenly.",
    desc: "Handles write bottlenecks through horizontal sharding and vertical partitioning.",
    explain: "When one database node cannot keep up with sustained or bursty writes, you need to spread the load. Good partitioning, batching, and buffering help you increase throughput without creating hotspots.",
    progression: ["Vertical scale DB", "Write batching / buffering", "Horizontal sharding", "Write-ahead log", "CQRS"],
    techs: ["Cassandra", "DynamoDB", "Kafka", "Sharding middleware"],
    useCases: ["Social media posts", "Metrics ingestion", "IoT sensor data", "Ad click streams"],
    tip: "Avoid hot partitions. Hash-based sharding distributes evenly but kills range queries. Range sharding enables scans but risks hotspots.",
  },
  {
    name: "Handling Large Blobs",
    emoji: "🗂️",
    color: GOLD,
    image: publicAsset("system-design/handlinglargeblobs.png"),
    tagline: "Never route large files through your app server.",
    desc: "Manages large file transfers using presigned URLs for direct client-to-storage uploads.",
    explain: "Large files should usually go directly between the client and object storage instead of passing through your application servers. This removes your app as the bandwidth bottleneck and makes uploads and downloads much easier to scale.",
    progression: ["Client requests presigned URL", "Server generates signed S3 URL", "Client uploads directly to S3", "Client notifies server on complete", "CDN serves the file"],
    techs: ["S3 / GCS", "CDN (CloudFront)", "Presigned URLs", "Multipart upload"],
    useCases: ["Photo uploads", "Video hosting", "Document storage", "Backups"],
    tip: "Use multipart upload for files >5MB. Store only the S3 key in your DB. Serve via CDN, not presigned URLs, for public content.",
  },
  {
    name: "Multi-Step Processes",
    emoji: "🔄",
    color: TEAL,
    image: publicAsset("system-design/multistepprocess.png"),
    tagline: "Use a workflow engine for exactly-once, resumable pipelines.",
    desc: "Coordinates complex business workflows across multiple services with reliability and auditability.",
    explain: "This pattern is useful when business logic spans several steps, services, or retries and you need the workflow to survive failures. Workflow engines keep track of state, retries, timeouts, and audit history so the process stays understandable.",
    progression: ["Define workflow as code", "Orchestrator schedules steps", "Each step is idempotent", "Retry on failure", "Complete audit trail"],
    techs: ["Temporal", "AWS Step Functions", "Apache Airflow", "Event sourcing"],
    useCases: ["Order fulfillment", "User onboarding", "Payment processing", "Data pipelines"],
    tip: "Make every step idempotent. Use workflow engines (Temporal) over hand-rolled state machines — they handle retries, timeouts, and versioning.",
  },
  {
    name: "Proximity-Based Services",
    emoji: "📍",
    color: RED,
    image: publicAsset("system-design/proximityBasedServices.png"),
    tagline: "Geospatial indexes turn radius queries from O(n) to O(log n).",
    desc: "Efficiently retrieves nearby entities using geospatial indexing and quadtrees.",
    explain: "Use this when users need to find nearby drivers, stores, or matches without scanning every record. Geospatial indexes narrow the search space first, then the system filters and ranks the remaining results by exact distance.",
    progression: ["Encode locations as geohash", "Index in DB or Redis", "Query by bounding box", "Filter by exact radius", "Sort by distance"],
    techs: ["PostGIS (PostgreSQL)", "Redis GEO commands", "Elasticsearch geo", "Quadtrees / S2"],
    useCases: ["Ride sharing (Uber)", "Food delivery", "Store finders", "Dating apps"],
    tip: "Geohash encodes lat/lng to a string — nearby hashes share prefixes. For high-frequency updates (drivers), keep in Redis not DB.",
  },
];

// ── Technology Card ──────────────────────────────────────────────────
function TechCard({ tech, index }) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => setExpanded(e => !e)}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        border: `1px solid ${hovered ? tech.color : "var(--viz-border)"}`,
        background: hovered ? `${tech.color}0d` : "var(--viz-surface)",
        boxShadow: hovered ? `0 0 16px ${tech.color}33` : "none",
        padding: "14px 16px",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      }}
    >
      <div className="flex items-start gap-3">
        <span style={{ fontSize: 24, lineHeight: 1 }}>{tech.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{tech.name}</p>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20,
              background: `${tech.color}22`, color: tech.color, border: `1px solid ${tech.color}44`
            }}>{tech.category}</span>
          </div>
          <p className="text-xs text-default-500 mt-1 leading-relaxed">{tech.desc}</p>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${tech.color}33` }}>
                  <p className="text-xs mb-1.5">
                    <span style={{ color: tech.color, fontWeight: 700 }}>When to use: </span>
                    <span className="text-default-500">{tech.when}</span>
                  </p>
                  <p className="text-xs">
                    <span style={{ color: GOLD, fontWeight: 700 }}>Key concepts: </span>
                    <span className="text-default-400 font-mono">{tech.key}</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Pattern Card ─────────────────────────────────────────────────────
function PatternCard({ pattern, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 20 }}
      onClick={() => setExpanded(e => !e)}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        border: `1px solid var(--viz-border)`,
        borderLeft: `4px solid ${pattern.color}`,
        background: "var(--viz-surface)",
        padding: "16px",
        transition: "box-shadow 0.2s",
      }}
      whileHover={{ boxShadow: `0 0 20px ${pattern.color}22` }}
    >
      <div className="flex items-start gap-3">
        <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{pattern.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-foreground">{pattern.name}</p>
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              style={{ color: "var(--color-default-400)", fontSize: 12, flexShrink: 0 }}
            >▶</motion.span>
          </div>
          <p className="text-xs mt-1" style={{ color: pattern.color, fontWeight: 600 }}>{pattern.tagline}</p>
          <p className="text-xs text-default-400 mt-1 leading-relaxed">{pattern.desc}</p>

          {/* Tech chips always visible */}
          <div className="flex flex-wrap gap-1 mt-2">
            {pattern.techs.map(t => (
              <span key={t} style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 20,
                background: `${pattern.color}1a`, color: pattern.color,
                border: `1px solid ${pattern.color}33`, fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: "hidden" }}
              >
                <div className="mt-4 flex flex-col gap-3">
                  {/* Diagram image */}
                  {pattern.image && (
                    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${pattern.color}33` }}>
                      <img
                        src={pattern.image}
                        alt={`${pattern.name} diagram`}
                        style={{ width: "100%", display: "block", objectFit: "contain", maxHeight: 320 }}
                      />
                    </div>
                  )}
                  {/* Brief explanation */}
                  {pattern.explain && (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: `${pattern.color}0d`,
                        border: `1px solid ${pattern.color}33`,
                      }}
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: pattern.color }}
                      >
                        Brief Explanation
                      </p>
                      <p className="text-xs text-default-500 leading-relaxed">{pattern.explain}</p>
                    </div>
                  )}
                  {/* Flow */}
                  <div>
                    <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">Flow</p>
                    <div className="flex flex-wrap gap-1 items-center">
                      {pattern.progression.map((step, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span style={{
                            fontSize: 11, padding: "3px 9px", borderRadius: 20,
                            background: "var(--code-bg)", color: "var(--code-text)",
                            border: "1px solid var(--code-border)", fontFamily: "monospace",
                          }}>{step}</span>
                          {i < pattern.progression.length - 1 && (
                            <span className="text-default-300 text-xs">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Use cases */}
                  <div>
                    <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">Use Cases</p>
                    <div className="flex flex-wrap gap-1">
                      {pattern.useCases.map(u => (
                        <span key={u} style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 6,
                          background: `${BLUE}18`, color: BLUE, border: `1px solid ${BLUE}33`,
                        }}>{u}</span>
                      ))}
                    </div>
                  </div>
                  {/* Tip */}
                  <div style={{
                    padding: "10px 14px", borderRadius: 8,
                    background: `${GOLD}0d`, border: `1px solid ${GOLD}44`,
                  }}>
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: 12 }}>💡 Key insight: </span>
                    <span className="text-xs text-default-500">{pattern.tip}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function SystemDesign({ isDark = false, onDarkModeChange, onSwitchToArchive, supportUrl }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [patternSearch, setPatternSearch] = useState("");

  const filteredTechs = activeFilter === "All"
    ? TECHNOLOGIES
    : TECHNOLOGIES.filter(t => t.category === activeFilter);

  const filteredPatterns = patternSearch
    ? PATTERNS.filter(p =>
        p.name.toLowerCase().includes(patternSearch.toLowerCase()) ||
        p.tagline.toLowerCase().includes(patternSearch.toLowerCase())
      )
    : PATTERNS;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center justify-between gap-3 bg-content1 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <span className="text-xl">🏗️</span>
          <div>
            <h1 className="font-semibold text-base">System Design</h1>
            <p className="text-xs text-default-400">Interview patterns and technologies</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ModeSwitch onSwitchToArchive={onSwitchToArchive} />
          <div className="flex items-center gap-1.5 text-default-400">
            <SunIcon />
            <Switch
              size="sm"
              isSelected={isDark}
              onValueChange={onDarkModeChange}
              aria-label="Toggle dark mode"
            />
            <MoonIcon />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">
          <Tabs aria-label="System Design" color="primary" variant="underlined">

            {/* ── Tab 0: Key Technologies ── */}
            <Tab key="technologies" title="⚡ Key Technologies">
              <div className="pt-4 flex flex-col gap-4">
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setActiveFilter(cat)}
                      style={{
                        padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        cursor: "pointer",
                        background: activeFilter === cat ? TEAL : "var(--viz-surface)",
                        color: activeFilter === cat ? "#0b0f0e" : "var(--color-default-500)",
                        border: `1px solid ${activeFilter === cat ? TEAL : "var(--viz-border)"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      {cat}
                      {cat !== "All" && (
                        <span style={{ marginLeft: 5, opacity: 0.7 }}>
                          {TECHNOLOGIES.filter(t => t.category === cat).length}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Cards grid */}
                <motion.div
                  key={activeFilter}
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
                >
                  {filteredTechs.map((tech, i) => (
                    <TechCard key={tech.name} tech={tech} index={i} />
                  ))}
                </motion.div>

                <p className="text-xs text-default-400 text-center mt-2">
                  Click any card to expand details
                </p>
              </div>
            </Tab>

            {/* ── Tab 1: Patterns ── */}
            <Tab key="patterns" title="🔄 Patterns">
              <div className="pt-4 flex flex-col gap-4">
                {/* Search */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--viz-surface)", border: "1px solid var(--viz-border)",
                  borderRadius: 10, padding: "8px 14px",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-default-400)", flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    value={patternSearch}
                    onChange={e => setPatternSearch(e.target.value)}
                    placeholder="Filter patterns..."
                    style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      fontSize: 13, color: "var(--color-foreground)",
                    }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: "Patterns", value: filteredPatterns.length, color: TEAL },
                    { label: "Core", value: 5, color: BLUE },
                    { label: "Advanced", value: 3, color: GOLD },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{
                      flex: 1, minWidth: 90, borderRadius: 10, padding: "10px 14px",
                      background: "var(--viz-surface)", border: `1px solid var(--viz-border)`,
                      textAlign: "center",
                    }}>
                      <p style={{ fontSize: 20, fontWeight: 800, color }}>{value}</p>
                      <p style={{ fontSize: 11, color: "var(--color-default-400)" }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Pattern cards */}
                <div className="flex flex-col gap-3">
                  {filteredPatterns.map((p, i) => (
                    <PatternCard key={p.name} pattern={p} index={i} />
                  ))}
                </div>

                <p className="text-xs text-default-400 text-center mt-2">
                  Click any pattern to expand the full breakdown
                </p>
              </div>
            </Tab>

          </Tabs>
          <div className="pt-8 pb-2 text-center">
            <a
              href={supportUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-default-400 transition-colors hover:text-foreground"
            >
              <CoffeeIcon />
              Buy me a coffee
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
