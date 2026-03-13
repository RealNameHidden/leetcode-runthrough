/**
 * System design core concepts — content only.
 * Edit this file to change copy; UI lives in SystemDesign.jsx.
 */

const BLUE = "#5dade2";
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const RED = "#ff6b6b";
const PURPLE = "#a78bfa";

export const CORE_CONCEPTS = [
  {
    name: "Networking Essentials",
    emoji: "🌐",
    color: BLUE,
    tagline: "How services talk and what happens when connections fail.",
    desc: "Choose protocol by use case: HTTP/TCP for most systems; SSE for server→client push (live scores, notifications); WebSockets for bidirectional (chat, collaboration). gRPC for internal service-to-service when performance matters. L7 load balancers route by HTTP content; L4 is faster but content-agnostic — use L4 for WebSockets.",
    keyPoints: ["HTTP default; SSE vs WebSocket for real-time", "L4 vs L7 load balancing", "Geography = latency (NY→London ~80ms); CDNs at edge"],
    gotcha: "Don't propose WebSockets when HTTP long polling or SSE is enough — stateful connections add complexity at scale.",
    fullExplanation: `Networking is one of those topics where you can go incredibly deep, but for system design interviews you need to know the practical bits that come up when you're designing distributed systems. At a basic level, you need to understand how services talk to each other and what happens when those connections fail or get slow.

The most important decision you'll make is choosing your communication protocol. For most systems, you'll default to HTTP over TCP. It's well-understood, works everywhere, and handles 90% of use cases. Your interviewer will expect this unless you have a specific reason to use something else.

WebSockets and Server-Sent Events (SSE) come up when you need real-time updates. The key difference: SSE is unidirectional — the client makes an initial HTTP request to open the connection, and then the server pushes data down that connection (like live scores or notifications). The client can't send additional data over the same SSE connection. WebSockets handle true bidirectional communication where both sides send messages freely (like chat or live collaboration). SSE is simpler to implement and works better with standard HTTP infrastructure, but WebSockets are necessary when clients need to push data back to the server frequently. Both are stateful connections, which means you can't just throw them behind a standard load balancer. You'll need to think about connection persistence and what happens when a server goes down with thousands of active connections.

gRPC is worth mentioning for internal service-to-service communication when performance is critical. It uses binary serialization and HTTP/2, making it significantly faster than JSON over HTTP. But you won't use it for public-facing APIs because browsers don't natively support gRPC.

Load balancing is another area interviewers love to probe. Layer 7 load balancers operate at the application level and can route based on the actual HTTP request content. You can send API calls to one service and web page requests to another. Layer 4 load balancers work at the TCP level and are faster but dumber. They just distribute connections without looking at the content. For WebSockets, you typically need Layer 4 balancing because you're maintaining a persistent TCP connection.

Geography and latency matter more than most candidates realize. A request from New York to London has a minimum latency of around 80ms just from the speed of light through fiber optic cables, before you even process anything. If your system needs low latency globally, you'll need regional deployments with data replicated or partitioned by geography. This is why CDNs exist — to serve static content from edge servers close to users.`,
  },
  {
    name: "API Design",
    emoji: "📋",
    color: TEAL,
    tagline: "Reasonable endpoints so you can move on to architecture.",
    desc: "Default to REST: resources as URLs, HTTP methods. Sketch 4–5 key endpoints quickly; don't over-design. Use cursor-based pagination for real-time data; offset-based is fine otherwise. JWT for user sessions, API keys for service-to-service. Mention rate limiting if abuse is a concern.",
    keyPoints: ["REST by default", "Cursor vs offset pagination", "JWT / API keys; rate limiting when relevant"],
    gotcha: "Spending too long on API details in the interview leaves less time for scaling and tradeoffs.",
    fullExplanation: `In almost every system design interview, you'll need to sketch out the APIs that clients use to interact with your system. The good news is that most interviewers don't care about perfect API design. They want to see that you can create reasonable endpoints and move on to the harder architectural problems. That said, sloppy API design can signal inexperience, so it's worth knowing the basics.

For 90% of interviews, you'll default to REST. It maps resources to URLs and uses HTTP methods to manipulate them. Think /users/{id} for getting a user, POST /events/{id}/bookings for creating a booking. REST is well-understood, works everywhere, and your interviewer will assume this unless you propose something else.

There are a few concepts worth mentioning when they come up. If you're returning large result sets, you'll need pagination. Cursor-based works better for real-time data where new items get added frequently, but offset-based is fine for most cases. For authentication, use JWT tokens for user sessions and API keys for service-to-service calls. And if your system could get hammered by bots or abuse, mention rate limiting. But don't go deep on any of these unless the interviewer specifically asks.

The key is to sketch out 4–5 key endpoints in a couple minutes and move on. If you find yourself still designing API details 10 minutes into the interview, you're going too deep and leaving less time for scaling, tradeoffs, and the parts of the design that actually differentiate you.`,
  },
  {
    name: "Data Modeling",
    emoji: "📊",
    color: GOLD,
    tagline: "Structure and consistency choices that drive performance and scale.",
    desc: "Relational (Postgres) when you need strong consistency, joins, and clear relationships. NoSQL (DynamoDB, MongoDB) for flexible schemas and horizontal scale. Normalization avoids duplication; denormalization speeds reads and complicates updates. In NoSQL, partition/sort keys must match access patterns — design for your main queries.",
    keyPoints: ["Relational vs NoSQL by consistency and access pattern", "Normalize first; denormalize hot paths", "Partition key = access pattern (e.g. user_id for \"posts by user\")"],
    gotcha: "Start normalized; denormalize only when you've identified a read bottleneck.",
    fullExplanation: `Data modeling is one of those things that sounds simple but has massive downstream effects on your system. The decisions you make about what data to store and how to structure it directly affect performance, scalability, and how painful it is to build and maintain your system.

The first big choice is relational versus NoSQL. Relational databases like Postgres work great when you have structured data with clear relationships and need strong consistency. Things like user accounts linking to orders linking to products. You can express complex queries with SQL, use transactions to keep data consistent, and enforce foreign key constraints. NoSQL databases like DynamoDB or MongoDB shine when you need flexible schemas (your data structure changes frequently) or you need to scale horizontally across many servers without complex joins.

Within relational databases, you'll hear about normalization and denormalization. Normalization means splitting data across tables to avoid duplication. You have a users table, an orders table, and a products table. Each order references a user ID and product ID instead of copying the full user and product data into every order record. This keeps your data consistent — update a product name once and it's updated everywhere — but it means you need joins to get complete data. Joins get expensive when your tables are huge or you're joining across multiple tables.

Denormalization goes the other way. You duplicate data to avoid joins and make reads faster. Instead of joining to the users table every time you display an order, you store the username directly in each order record. Now you can fetch an order and display it without touching another table. The downside is updates: if a user changes their name, you have to update it in the users table plus every order record that copied it. For read-heavy systems where data rarely changes, this tradeoff is often worth it.

NoSQL databases force you to think differently. DynamoDB requires you to design your partition key and sort key based on your access patterns. If you're building a social media app and your most common query is "get all posts for user X," you'd use user_id as the partition key. This makes that query a fast single-partition lookup. But now queries like "get all posts mentioning hashtag Y" require scanning the entire table because you didn't design for that access pattern. You have to know your queries upfront and design around them. In interviews, a safe default is to start with a normalized relational model and then denormalize specific hot paths if you identify read performance issues.`,
  },
  {
    name: "Database Indexing",
    emoji: "🔑",
    color: TEAL,
    tagline: "Indexes turn full scans into fast lookups.",
    desc: "B-trees for exact and range queries; hash indexes for exact only. Index columns you filter or sort on (e.g. email, user_id). Compound indexes for multi-field queries (e.g. city + date). Use Elasticsearch for full-text search; PostGIS for geo — synced via CDC, so search index is slightly stale.",
    keyPoints: ["B-tree vs hash; compound indexes", "Index what you query", "External search/geo indexes with CDC"],
    gotcha: "External search/geo adds a small staleness lag; acceptable for search, not for transactional reads.",
    fullExplanation: `Indexes are used to make database queries fast. Without an index, finding a user by email means scanning every single row in your users table. If you have 10 million users, that's 10 million rows to check. With an index on the email column, the database can jump straight to the right row in milliseconds.

The most common index is a B-tree. It keeps data sorted in a tree structure that supports both exact lookups (find user with email X) and range queries (find all orders between date A and date B). Most relational databases create B-tree indexes by default. Hash indexes are faster for exact matches but can't do range queries, so they're less common. You'll also see specialized indexes like full-text indexes for search (finding documents containing specific words) and geospatial indexes for location queries (find restaurants within 5 miles).

In interviews, think about your query patterns and propose indexes on the fields you're querying frequently. If you're looking up users by email for authentication, index the email column. If you're fetching a user's orders, index the user_id column on the orders table. For composite queries like "find events in San Francisco on December 25th," you might need a compound index on both city and date.

For specialized needs beyond what your primary database supports, you'll need external systems. Elasticsearch is the go-to for full-text search (think searching tweets or documents). For geospatial queries in Postgres, PostGIS is a popular extension. These external indexes typically sync from your primary database via change data capture (CDC), meaning the search index will lag slightly behind the primary database. The data you read from the search index is going to be stale by some small amount, but for search use cases that's almost always acceptable. The tradeoff is worth it because it lets you search in ways your main database can't handle.`,
  },
  {
    name: "Caching",
    emoji: "⚡",
    color: RED,
    tagline: "Hot data in memory to cut DB load and latency.",
    desc: "Cache-aside with Redis: read from cache; on miss, DB then populate cache with TTL. Invalidation is the hard part — invalidate on write or use short TTLs. Plan for cache failure: stampede when Redis is down can overwhelm the DB; use fallbacks or circuit breakers. Cache only frequently read, rarely changing data.",
    keyPoints: ["Cache-aside + TTL; invalidation strategy", "Stampede on cache failure", "Cache hot paths only"],
    gotcha: "Caching data that changes every request adds latency and complexity without benefit.",
    fullExplanation: `Caching comes up in almost every system design interview, usually when you identify that your database is getting hammered with reads. The idea is simple: store frequently accessed data in fast memory (like Redis) so you can skip the database entirely for most reads.

The performance difference is massive. A cache hit on Redis takes around 1ms compared to 20–50ms for a typical database query. When you're serving millions of requests, that 20–50x speedup matters. You also reduce load on your database, letting it handle more write traffic and avoiding the need to scale it prematurely.

The pattern you'll use 90% of the time is cache-aside with Redis. On a read, check the cache first. If the data is there, return it. If not, query the database, store the result in the cache with a TTL, and return it. This is straightforward to implement and works for most read-heavy systems.

But caching introduces real complexity. The hardest part is invalidation. When a user updates their profile in the database, you need to delete or update the cached copy. Otherwise the next read returns stale data. There are a few strategies here: you can invalidate the cache entry immediately after writes, use short TTLs and accept some staleness, or combine both. The right choice depends on how fresh your data needs to be.

You also need to think about cache failures. If Redis goes down, every request suddenly hits your database. Can it handle that traffic spike? This is called a cache stampede and it can take down your whole system. Some approaches include keeping a small in-process cache as a fallback, using circuit breakers to prevent overwhelming the database, or accepting degraded performance until Redis comes back up.

CDN caching is different — it's for static assets like images, videos, and JavaScript files served from edge locations close to users. In-process caching works for small values that change rarely, like feature flags or config data. But for your core application data, external caching with Redis is the default. Cache only data that's read frequently and doesn't change often. If you're caching data that changes on every request, you're just adding latency and complexity for no benefit.`,
  },
  {
    name: "Sharding",
    emoji: "📦",
    color: PURPLE,
    tagline: "Split data across DBs when one node can't handle load or storage.",
    desc: "Shard key drives distribution and query patterns. Hash-based (e.g. user_id) spreads load evenly but hurts global queries (e.g. \"trending everywhere\"). Range-based can create hotspots. Do capacity math first — a single DB with replicas handles more than many assume; shard when numbers justify it. Cross-shard transactions are hard; avoid them via shard boundaries.",
    keyPoints: ["Shard key = query pattern tradeoff", "Hash vs range; avoid hotspots", "Shard only when single DB is insufficient"],
    gotcha: "Sharding too early adds complexity without real need; justify with throughput/storage numbers.",
    fullExplanation: `Sharding comes up when you've outgrown a single database and need to split your data across multiple independent servers. This happens when you hit storage limits (a single Postgres instance maxes out around a few TB), write throughput limits (tens of thousands of writes per second), or read throughput that even replicas can't handle.

The most important decision is your shard key. This determines how data gets distributed and affects everything else in your design. For a user-centric app like Instagram, sharding by user_id means all of a user's posts, likes, and comments live on one shard. User-scoped queries are fast because they only hit one shard. But now global queries like "trending posts across all users" become expensive because you have to hit every shard and aggregate results. That's the tradeoff.

Most systems use hash-based sharding where you hash the shard key and use modulo to pick a shard. This distributes data evenly and avoids hot spots. Range-based sharding can work if your access patterns naturally partition (like multi-tenant SaaS where each company only queries their own data), but it's easy to create hot spots if one range gets more traffic. Directory-based sharding uses a lookup table to decide where data lives. It's flexible but adds a dependency and latency to every request, so it's rarely worth it in interviews.

The biggest mistake with sharding is doing it too early. A well-tuned single database with read replicas can handle way more than most candidates think. Before you propose sharding, do the capacity math. If you're at 10K writes per second and 100GB of data, you don't need sharding yet. Bring it up when the numbers justify it, not as a default scaling strategy.

Sharding creates new problems you need to address. Cross-shard transactions become nearly impossible, so you need to design your shard boundaries to avoid them. If a user transfer in your banking app requires updating accounts on different shards, you'll need distributed transactions or sagas, which are complex and slow. Hot spots happen when one shard gets disproportionate traffic. And resharding is painful — you can't just add a new shard without moving massive amounts of data around. In interviews, bring up sharding after you've justified why a single database won't work. Then clearly state your shard key choice and explain the tradeoff.`,
  },
  {
    name: "Consistent Hashing",
    emoji: "🎯",
    color: BLUE,
    tagline: "Add/remove nodes without remapping most keys.",
    desc: "Keys and servers on a ring; key belongs to next server clockwise. Adding/removing a node only moves keys in that segment (~1/N of data), not 90% like modulo. Used by distributed caches (Memcached, Redis Cluster), sharded DBs (Cassandra, DynamoDB), and some load balancers.",
    keyPoints: ["Ring: key → next server clockwise", "~10% movement per node change vs ~90% with modulo", "Caches, sharded DBs, elastic scaling"],
    gotcha: "Mention when discussing elastic scaling of cache or DB nodes; you rarely need to derive the algorithm.",
    fullExplanation: `Consistent hashing solves a specific problem that comes up with distributed caches and sharded databases. When you use simple hash-based distribution (hash(key) % N to pick which server stores the data), adding or removing a server changes N. That means almost every key maps to a different server, so you'd have to move most of your data around. With millions of cache entries or database records, that's a disaster.

Consistent hashing fixes this by arranging both servers and keys on a virtual ring. You hash each key and place it on the ring, then the key belongs to the next server you encounter going clockwise. When you add a new server, only the keys between that new server and the previous server need to move. When you remove a server, only its keys relocate to the next server on the ring. Everything else stays put.

The improvement is massive. With simple modulo hashing, adding one server to a 10-server cluster means moving roughly 90% of your data. With consistent hashing, you only move about 10% — the keys that belonged to the affected range. This makes it practical to add and remove servers dynamically without causing a massive data migration.

This pattern shows up in several places. Distributed caches like Memcached and Redis Cluster use it to distribute keys across cache nodes. Distributed databases like Cassandra and DynamoDB use it for sharding. Some load balancers use it to assign requests to backend servers in a way that's stable when servers come and go. CDNs use it to route requests to edge servers.

In interviews, you rarely need to explain how consistent hashing works unless specifically asked. It's enough to say "we'll use consistent hashing to distribute data across cache nodes" when you're talking about a distributed cache or "we'll use consistent hashing for the shard key" when discussing database sharding. The main time to bring it up is when you're discussing elastic scaling: if your system needs to add or remove cache nodes or database shards based on load, mention consistent hashing as the mechanism that makes this practical without massive data movement.`,
  },
  {
    name: "CAP Theorem",
    emoji: "⚖️",
    color: GOLD,
    tagline: "During a partition: consistency or availability, not both.",
    desc: "You get two of three: Consistency, Availability, Partition tolerance. In practice you choose CP (refuse requests when partitioned) or AP (keep serving, accept temporary inconsistency). Most systems choose availability; use strong consistency only for money, inventory, or limited resources (e.g. seats). PACELC: when healthy, strong consistency adds latency.",
    keyPoints: ["Partition → CP or AP", "Eventual consistency for feeds/recommendations", "Strong consistency for payments, inventory, booking"],
    gotcha: "Default to eventual consistency unless the problem involves money, inventory, or double-booking.",
    fullExplanation: `The CAP theorem comes up when you're designing distributed systems and need to make tradeoffs about how your data behaves during failures. It states you can only have two of three properties at once: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition tolerance (system works even when network connections fail between nodes). Since network partitions are unavoidable in distributed systems, you're really choosing between consistency and availability.

Here's what that means in practice. If you choose consistency, when a network partition happens, some nodes will refuse to serve requests rather than return potentially stale data. Your system might go down, but when it's up, the data is always correct. If you choose availability, every node keeps serving requests even during a partition. Users always get a response, but different nodes might temporarily have different data until the partition heals.

For most systems, availability is the right default. Users can tolerate seeing slightly stale data (your Instagram feed being 2 seconds old), but they can't tolerate the app being down. Social media feeds, recommendation systems, and analytics dashboards all work fine with eventual consistency, where the system guarantees that all nodes will converge to the same state given enough time without new updates. This is different from weak consistency, which makes no such guarantee about convergence.

Strong consistency matters when stale data causes actual business problems. Inventory systems need accurate stock counts or you'll oversell products. Banking systems need correct account balances or you'll allow fraud. Booking systems need to prevent double-booking the same seat. These are systems where reading stale data for even a few seconds can cost real money or create bad user experiences.

You don't have to pick one model for your entire system. It's common to have different consistency requirements for different parts of the same application. In an e-commerce system, product descriptions and reviews can be eventually consistent, but inventory counts and order processing need strong consistency to prevent overselling.

It's worth knowing that the CAP theorem only describes behavior during network partitions, which are relatively rare. In normal operation, the real tradeoff is between consistency and latency. This is captured by the PACELC theorem: during a Partition, choose Availability or Consistency; Else, choose Latency or Consistency. In practice this means that even when your network is healthy, choosing strong consistency adds latency because nodes need to coordinate before responding.`,
  },
  {
    name: "Numbers to Know",
    emoji: "📐",
    color: TEAL,
    tagline: "Use numbers when making decisions, not as an opening recitation.",
    desc: "Latency: memory ns, SSD μs, same-DC network 1–10 ms, cross-continent tens–hundreds ms. DB: tens of thousands of queries/s, sub-5 ms reads (cached), multi-TB per instance. Redis: ~1 ms, 100k+ ops/s. Do capacity math when asked (\"how many servers?\"): e.g. 50k RPS, 5k per server → ~10 servers + headroom.",
    keyPoints: ["Latency ladder: memory → SSD → network → geography", "DB/Redis/app server scale triggers", "Calculate when justifying sharding, cache size, server count"],
    gotcha: "Use 2020s-era numbers; old estimates lead to over-engineering (sharding/caching too early).",
    fullExplanation: `You don't need to do back-of-the-envelope calculations at the start of an interview. That's not what interviewers care about. What matters is doing them when you need to make a decision. Should you shard the database? Can a single Redis instance handle the cache load? You can't answer these questions without rough numbers.

The trick is knowing which numbers to use. Modern hardware is way more powerful than most candidates realize. A well-tuned database server handles tens of thousands of queries per second. A single Redis instance handles hundreds of thousands of operations per second. If you're using 2010-era numbers in your head, you'll propose sharding and caching way earlier than you need to.

Start with the latency numbers because they affect almost every design decision. Memory access takes nanoseconds. SSD reads take microseconds. Network calls within a data center take 1–10 milliseconds. Cross-continent calls take tens to hundreds of milliseconds. When you're deciding whether to cache something or whether geographic distribution is worth the complexity, these gaps are what matter.

Do your capacity calculations in context when you need them. If your interviewer asks "how many servers do we need," that's when you pull out the numbers. Walk through it: "We're expecting 50K requests per second, each server can handle maybe 5K requests, so we need around 10 servers plus some headroom." The interviewer wants to see you think through the math, not recite memorized facts.

Storage capacity matters for sharding decisions. A single Postgres instance handles a few terabytes comfortably. You don't need sharding until you're hitting tens or hundreds of terabytes. Key metrics: caching has roughly 1ms latency and 100k+ ops/sec but is memory-bound; databases can do up to 50k TPS with sub-5ms read latency and 64TB+ storage; app servers handle 100k+ concurrent connections with 8–64 cores; message queues can do up to 1M msgs/sec per broker. Use these when justifying scaling decisions, not as an opening recitation.`,
  },
];
