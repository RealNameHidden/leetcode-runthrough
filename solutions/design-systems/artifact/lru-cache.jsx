import { useState, useEffect } from "react";

const C = {
  bg: "#0d0b1a", card: "#13102b", border: "#2a2550",
  accent: "#818cf8", accentSoft: "#818cf818",
  green: "#34d399", greenSoft: "#34d39918",
  amber: "#fbbf24", amberSoft: "#fbbf2418",
  red: "#f87171", redSoft: "#f8717118",
  purple: "#c084fc", purpleSoft: "#c084fc18",
  muted: "#5b6898", text: "#e0e0ff", heap: "#09071a",
};

// ── Simulation ──────────────────────────────────────────────────────────────
function simulate(capacity, ops) {
  const steps = [];
  const map = new Map();   // key → val
  let list = [];           // [{key,val}] MRU first

  steps.push({
    list: [], mapSnap: {}, action: "init", evicted: null, result: undefined,
    desc: `Initialize LRU Cache with capacity = ${capacity}`, op: null, highlight: null,
  });

  for (const op of ops) {
    if (op.type === "get") {
      const idx = list.findIndex(n => n.key === op.key);
      if (idx === -1) {
        steps.push({
          list: list.map(n => ({ ...n })), mapSnap: Object.fromEntries(map),
          action: "get_miss", evicted: null, result: -1,
          desc: `get(${op.key}) → key not in cache → return -1`, op, highlight: null,
        });
      } else {
        const node = list.splice(idx, 1)[0];
        list.unshift(node);
        steps.push({
          list: list.map(n => ({ ...n })), mapSnap: Object.fromEntries(map),
          action: "get_hit", evicted: null, result: node.val,
          desc: `get(${op.key}) → hit! value = ${node.val}. Promoted to MRU.`, op, highlight: op.key,
        });
      }
    } else {
      const existingIdx = list.findIndex(n => n.key === op.key);
      const isUpdate = existingIdx !== -1;
      if (isUpdate) { list.splice(existingIdx, 1); map.delete(op.key); }
      list.unshift({ key: op.key, val: op.val });
      map.set(op.key, op.val);

      let evicted = null;
      if (list.length > capacity) {
        const lru = list.pop();
        map.delete(lru.key);
        evicted = lru.key;
      }

      const action = isUpdate ? "put_update" : evicted !== null ? "put_evict" : "put_new";
      const desc = isUpdate
        ? `put(${op.key}, ${op.val}) → key exists, update value & move to MRU.`
        : evicted !== null
        ? `put(${op.key}, ${op.val}) → cache full! Evict LRU key=${evicted}. Insert at MRU.`
        : `put(${op.key}, ${op.val}) → space available. Insert at MRU.`;

      steps.push({
        list: list.map(n => ({ ...n })), mapSnap: Object.fromEntries(map),
        action, evicted, result: undefined,
        desc, op, highlight: op.key,
      });
    }
  }
  return steps;
}

// ── Linked List Visual ───────────────────────────────────────────────────────
function LinkedListViz({ list, highlight, evicted, capacity }) {
  if (!list) return null;
  return (
    <div style={{ overflowX: "auto", padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content", padding: "4px 8px" }}>
        {/* HEAD sentinel */}
        <SentinelNode label="HEAD" sub="MRU" color={C.green} />
        <Arrow />

        {list.length === 0 && (
          <div style={{ padding: "10px 20px", color: C.muted, fontSize: 13, fontStyle: "italic" }}>— empty —</div>
        )}

        {list.map((node, i) => {
          const isHighlight = node.key === highlight;
          const isLRU = i === list.length - 1;
          const isEvicted = node.key === evicted;
          let borderColor = C.border;
          let bg = C.heap;
          let labelColor = C.muted;
          if (isEvicted) { borderColor = C.red; bg = C.redSoft; }
          else if (isHighlight) { borderColor = C.accent; bg = C.accentSoft; }
          else if (isLRU) { borderColor = C.amber; bg = C.amberSoft; }

          return (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                border: `2px solid ${borderColor}`, borderRadius: 10, padding: "10px 16px",
                background: bg, minWidth: 72, transition: "all 0.3s",
                boxShadow: isHighlight ? `0 0 16px ${C.accent}55` : isEvicted ? `0 0 16px ${C.red}55` : "none",
              }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2, letterSpacing: "0.08em" }}>
                  {i === 0 ? "MRU" : isLRU ? "LRU" : `pos ${i}`}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isEvicted ? C.red : isHighlight ? C.accent : C.text, fontFamily: "monospace" }}>
                  {node.key}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>val={node.val}</div>
                {isEvicted && <div style={{ fontSize: 9, color: C.red, marginTop: 3 }}>EVICTED</div>}
              </div>
              {i < list.length - 1 && <Arrow />}
            </div>
          );
        })}

        {list.length > 0 && <Arrow />}
        {/* TAIL sentinel */}
        <SentinelNode label="TAIL" sub="LRU" color={C.amber} />
      </div>

      {/* Capacity bar */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: C.muted, minWidth: 70 }}>capacity:</span>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: capacity }).map((_, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: 4,
              background: i < list.length ? C.accentSoft : C.heap,
              border: `1px solid ${i < list.length ? C.accent : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: i < list.length ? C.accent : C.muted, fontFamily: "monospace",
            }}>
              {i < list.length ? list[i].key : "·"}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, color: C.muted }}>{list.length}/{capacity}</span>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, margin: "0 2px" }}>
      <div style={{ fontSize: 11, color: C.muted }}>⇄</div>
    </div>
  );
}

function SentinelNode({ label, sub, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      border: `2px dashed ${color}`, borderRadius: 10, padding: "10px 14px",
      background: "transparent", minWidth: 60, opacity: 0.6,
    }}>
      <div style={{ fontSize: 10, color, letterSpacing: "0.08em" }}>{sub}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{label}</div>
      <div style={{ fontSize: 9, color, marginTop: 1 }}>dummy</div>
    </div>
  );
}

// ── HashMap Visual ───────────────────────────────────────────────────────────
function HashMapViz({ mapSnap, highlight }) {
  const entries = Object.entries(mapSnap);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
      {entries.length === 0
        ? <span style={{ color: C.muted, fontSize: 13 }}>{ }{}</span>
        : entries.map(([k, v]) => {
            const isHL = parseInt(k) === highlight;
            return (
              <div key={k} style={{
                background: isHL ? C.accentSoft : C.heap,
                border: `1px solid ${isHL ? C.accent : C.border}`,
                borderRadius: 6, padding: "5px 12px", fontSize: 13, fontFamily: "monospace",
                color: isHL ? C.accent : C.text, transition: "all 0.3s",
                boxShadow: isHL ? `0 0 10px ${C.accent}44` : "none",
              }}>
                {k} → {v}
              </div>
            );
          })}
    </div>
  );
}

// ── Op Parser ────────────────────────────────────────────────────────────────
function parseOps(str) {
  return str.split(",").map(s => s.trim()).filter(Boolean).map(token => {
    const putM = token.match(/^put\((\d+),(\d+)\)$/i);
    if (putM) return { type: "put", key: parseInt(putM[1]), val: parseInt(putM[2]) };
    const getM = token.match(/^get\((\d+)\)$/i);
    if (getM) return { type: "get", key: parseInt(getM[1]) };
    return null;
  }).filter(Boolean);
}

// ── Card ─────────────────────────────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</div>
      {children}
    </div>
  );
}

const TABS = ["Problem", "Intuition", "Visualizer", "Code"];
const DEFAULT_OPS = "put(1,1),put(2,2),get(1),put(3,3),get(2),put(4,4),get(1),get(3),get(4)";

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Problem");
  const [capacity, setCapacity] = useState(2);
  const [opsStr, setOpsStr] = useState(DEFAULT_OPS);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const ops = parseOps(opsStr);
    if (ops.length > 0) { setSteps(simulate(capacity, ops)); setSi(0); }
  }, [capacity, opsStr]);

  const step = steps[si] || null;

  const bannerColor = (action) => {
    if (action === "get_hit") return { bg: C.greenSoft, border: C.green };
    if (action === "get_miss") return { bg: C.redSoft, border: C.red };
    if (action === "put_evict") return { bg: C.amberSoft, border: C.amber };
    if (action === "put_new") return { bg: C.accentSoft, border: C.accent };
    if (action === "put_update") return { bg: C.purpleSoft, border: C.purple };
    return { bg: C.accentSoft, border: C.accent };
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Courier New', monospace" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "15px 24px", display: "flex", alignItems: "center", gap: 14, background: C.card }}>
        <span style={{ fontSize: 20 }}>🗄️</span>
        <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "Georgia, serif" }}>LRU Cache</span>
        <div style={{ padding: "2px 10px", borderRadius: 20, background: C.amberSoft, border: `1px solid ${C.amber}`, fontSize: 11, color: C.amber }}>Medium · HashMap + DLL</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 24px", background: C.card }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer", padding: "11px 16px",
            fontSize: 13, color: tab === t ? C.accent : C.muted,
            borderBottom: tab === t ? `2px solid ${C.accent}` : "2px solid transparent",
            fontFamily: "inherit", transition: "color 0.2s",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── PROBLEM ── */}
        {tab === "Problem" && (<>
          <Card title="Problem Statement">
            <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>
              Design a data structure that follows the <span style={{ color: C.accent }}>Least Recently Used (LRU)</span> cache eviction policy. Implement a class <code style={{ color: C.amber }}>LRUCache</code> with a fixed capacity. Both <code style={{ color: C.green }}>get</code> and <code style={{ color: C.green }}>put</code> must run in <strong style={{ color: C.text }}>O(1) average time</strong>.
            </p>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { sig: "int get(int key)", desc: "Return value if key exists, else -1. Mark as most recently used." },
                { sig: "void put(int key, int val)", desc: "Insert or update key. If over capacity, evict the least recently used key first." },
              ].map(({ sig, desc }) => (
                <div key={sig} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: C.heap, borderRadius: 8, padding: "12px 14px" }}>
                  <code style={{ color: C.green, fontSize: 13, minWidth: 220, flexShrink: 0 }}>{sig}</code>
                  <span style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Example  →  capacity = 2">
            <pre style={{ background: C.heap, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 2.1, margin: 0, overflowX: "auto" }}>
              <span style={{ color: C.green }}>put</span>(<span style={{ color: C.accent }}>1</span>, <span style={{ color: C.amber }}>1</span>)<span style={{ color: C.muted }}>  → cache: [</span><span style={{ color: C.accent }}>1=1</span><span style={{ color: C.muted }}>]{"\n"}</span>
              <span style={{ color: C.green }}>put</span>(<span style={{ color: C.accent }}>2</span>, <span style={{ color: C.amber }}>2</span>)<span style={{ color: C.muted }}>  → cache: [</span><span style={{ color: C.accent }}>2=2</span>, <span style={{ color: C.accent }}>1=1</span><span style={{ color: C.muted }}>]{"\n"}</span>
              <span style={{ color: C.green }}>get</span>(<span style={{ color: C.accent }}>1</span>)<span style={{ color: C.muted }}>     → </span><span style={{ color: C.green }}>1</span><span style={{ color: C.muted }}>   cache: [</span><span style={{ color: C.accent }}>1=1</span>, <span style={{ color: C.accent }}>2=2</span><span style={{ color: C.muted }}>] (1 promoted){"\n"}</span>
              <span style={{ color: C.green }}>put</span>(<span style={{ color: C.accent }}>3</span>, <span style={{ color: C.amber }}>3</span>)<span style={{ color: C.muted }}>  → EVICT 2   cache: [</span><span style={{ color: C.accent }}>3=3</span>, <span style={{ color: C.accent }}>1=1</span><span style={{ color: C.muted }}>]{"\n"}</span>
              <span style={{ color: C.green }}>get</span>(<span style={{ color: C.accent }}>2</span>)<span style={{ color: C.muted }}>     → </span><span style={{ color: C.red }}>-1</span><span style={{ color: C.muted }}>  (2 was evicted){"\n"}</span>
              <span style={{ color: C.green }}>put</span>(<span style={{ color: C.accent }}>4</span>, <span style={{ color: C.amber }}>4</span>)<span style={{ color: C.muted }}>  → EVICT 1   cache: [</span><span style={{ color: C.accent }}>4=4</span>, <span style={{ color: C.accent }}>3=3</span><span style={{ color: C.muted }}>]{"\n"}</span>
              <span style={{ color: C.green }}>get</span>(<span style={{ color: C.accent }}>1</span>)<span style={{ color: C.muted }}>     → </span><span style={{ color: C.red }}>-1</span><span style={{ color: C.muted }}>{"\n"}</span>
              <span style={{ color: C.green }}>get</span>(<span style={{ color: C.accent }}>3</span>)<span style={{ color: C.muted }}>     → </span><span style={{ color: C.green }}>3</span><span style={{ color: C.muted }}>{"\n"}</span>
              <span style={{ color: C.green }}>get</span>(<span style={{ color: C.accent }}>4</span>)<span style={{ color: C.muted }}>     → </span><span style={{ color: C.green }}>4</span>
            </pre>
          </Card>

          <Card title="Constraints">
            <ul style={{ color: C.muted, lineHeight: 2.2, paddingLeft: 20, margin: 0 }}>
              <li><code style={{ color: C.text }}>1 ≤ capacity ≤ 3000</code></li>
              <li><code style={{ color: C.text }}>0 ≤ key, value ≤ 10⁴</code></li>
              <li>At most <code style={{ color: C.text }}>2 × 10⁵</code> calls to get and put</li>
              <li>Both get and put must run in <strong style={{ color: C.accent }}>O(1) average time</strong></li>
            </ul>
          </Card>
        </>)}

        {/* ── INTUITION ── */}
        {tab === "Intuition" && (<>
          <Card title="🤔 What Makes This Hard?">
            <p style={{ color: C.muted, lineHeight: 1.8, margin: 0 }}>
              You need <strong style={{ color: C.text }}>two conflicting properties at once</strong>:
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
              {[
                { need: "O(1) lookup", sol: "HashMap", reason: "Direct key→node access" },
                { need: "O(1) ordered eviction", sol: "Doubly Linked List", reason: "O(1) insert + remove anywhere" },
              ].map(({ need, sol, reason }) => (
                <div key={need} style={{ flex: 1, minWidth: 180, background: C.heap, borderRadius: 10, padding: 14, textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 12, marginBottom: 6 }}>Need</div>
                  <div style={{ color: C.accent, fontWeight: 700, marginBottom: 8 }}>{need}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>→ Use</div>
                  <div style={{ color: C.text, fontWeight: 600 }}>{sol}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{reason}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, background: C.accentSoft, border: `1px solid ${C.accent}`, borderRadius: 8, padding: 12, textAlign: "center" }}>
              <span style={{ color: C.accent, fontWeight: 700 }}>Combine them: HashMap ← keys → DLL nodes</span>
            </div>
          </Card>

          <Card title="🏗️ Data Structure Design">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { n: "1", t: "Node stores key AND value", d: "When you evict tail.prev, you need the key to delete from the HashMap. Nodes must carry their own key!", color: C.amber },
                { n: "2", t: "Dummy head (MRU sentinel) + dummy tail (LRU sentinel)", d: "These empty boundary nodes mean you NEVER check for null. remove() and insertFront() always have valid prev/next.", color: C.green },
                { n: "3", t: "HashMap maps key → Node pointer", d: "O(1) jump to any node in the list. Without this, finding a node would take O(n).", color: C.accent },
                { n: "4", t: "MRU at head.next, LRU at tail.prev", d: "Most recently used is right after the dummy head. Evict candidate is right before the dummy tail.", color: C.purple },
              ].map(({ n, t, d, color }) => (
                <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${color}22`, border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color, flexShrink: 0, fontWeight: 700 }}>{n}</div>
                  <div>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t}</div>
                    <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="⚙️ The Two Helper Methods">
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
              Every operation decomposes into just these two primitives:
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, background: C.heap, borderRadius: 8, padding: 14 }}>
                <code style={{ color: C.red, fontSize: 13, fontWeight: 700 }}>remove(node)</code>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 1.7 }}>
                  Wire node's prev and next together, cutting node out of the chain.<br />
                  <code style={{ color: C.text, fontSize: 11 }}>node.prev.next = node.next</code><br />
                  <code style={{ color: C.text, fontSize: 11 }}>node.next.prev = node.prev</code>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200, background: C.heap, borderRadius: 8, padding: 14 }}>
                <code style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>insertFront(node)</code>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 1.7 }}>
                  Splice node between dummy head and current first real node.<br />
                  <code style={{ color: C.text, fontSize: 11 }}>node.next = head.next</code><br />
                  <code style={{ color: C.text, fontSize: 11 }}>head.next.prev = node</code><br />
                  <code style={{ color: C.text, fontSize: 11 }}>head.next = node</code>
                </div>
              </div>
            </div>
          </Card>

          <Card title="🔄 get() and put() Decomposed">
            {[
              { op: "get(key) — hit", steps: ["1. map.get(key) → node (O(1))", "2. remove(node) from current position", "3. insertFront(node) → now MRU", "4. return node.val"], color: C.green },
              { op: "get(key) — miss", steps: ["1. map.containsKey → false", "2. return -1"], color: C.red },
              { op: "put(key, val) — new key, not full", steps: ["1. Create new node", "2. insertFront(node)", "3. map.put(key, node)"], color: C.accent },
              { op: "put(key, val) — cache full", steps: ["1. Create + insertFront new node", "2. map.put(key, node)", "3. lru = tail.prev", "4. remove(lru)", "5. map.remove(lru.key)  ← why node needs key!"], color: C.amber },
            ].map(({ op, steps, color }) => (
              <div key={op} style={{ background: C.heap, borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ color, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{op}</div>
                {steps.map((s, i) => <div key={i} style={{ color: C.muted, fontSize: 12, lineHeight: 1.8, paddingLeft: 8 }}>• {s}</div>)}
              </div>
            ))}
          </Card>

          <Card title="⚡ Complexity">
            <div style={{ display: "flex", gap: 12 }}>
              {[{ l: "get TIME", v: "O(1)", s: "HashMap lookup + DLL rewire" }, { l: "put TIME", v: "O(1)", s: "HashMap insert + DLL rewire" }, { l: "SPACE", v: "O(n)", s: "n = capacity" }].map(({ l, v, s }) => (
                <div key={l} style={{ flex: 1, background: C.heap, borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 10, marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 18 }}>{v}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
          </Card>
        </>)}

        {/* ── VISUALIZER ── */}
        {tab === "Visualizer" && (<>
          <Card title="Configure">
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.muted }}>Capacity</span>
                <input type="number" min={1} max={8} value={capacity} onChange={e => setCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: 80, background: C.heap, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "8px 12px", fontSize: 14, fontFamily: "inherit" }} />
              </label>
              <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.muted }}>Operations (comma-separated, e.g. put(1,1),get(1),put(2,2))</span>
                <input value={opsStr} onChange={e => setOpsStr(e.target.value)}
                  style={{ background: C.heap, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, padding: "8px 12px", fontSize: 13, fontFamily: "inherit" }} />
              </label>
            </div>
          </Card>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { color: C.green, label: "get hit / new insert" },
              { color: C.red, label: "get miss / evicted" },
              { color: C.amber, label: "LRU position" },
              { color: C.accent, label: "active node" },
              { color: C.purple, label: "updated key" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                <span style={{ color: C.muted, fontSize: 11 }}>{label}</span>
              </div>
            ))}
          </div>

          {step && steps.length > 0 && (
            <Card title="Step-by-Step Simulation">
              {/* Step pills */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 16 }}>
                {steps.map((s, i) => (
                  <button key={i} onClick={() => setSi(i)} style={{
                    padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    background: i === si ? C.accent : C.heap, border: `1px solid ${i === si ? C.accent : C.border}`,
                    color: i === si ? "#0d0b1a" : C.muted, fontWeight: i === si ? 700 : 400,
                  }}>
                    {i === 0 ? "init" : s.op ? `${s.op.type}(${s.op.key}${s.op.type === "put" ? "," + s.op.val : ""})` : "?"}
                  </button>
                ))}
              </div>

              {/* Banner */}
              {(() => {
                const { bg, border } = bannerColor(step.action);
                return (
                  <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>STEP {si + 1} / {steps.length}</div>
                    <div style={{ fontSize: 14, color: C.text }}>{step.desc}</div>
                    {step.result !== undefined && step.result !== null && (
                      <div style={{ marginTop: 6, fontSize: 13, color: step.result === -1 ? C.red : C.green, fontWeight: 700 }}>
                        → returns {step.result}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Linked List */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Doubly Linked List</div>
                <LinkedListViz list={step.list} highlight={step.highlight} evicted={step.evicted} capacity={capacity} />
              </div>

              {/* HashMap */}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>HashMap (key → val)</div>
                <HashMapViz mapSnap={step.mapSnap} highlight={step.highlight} />
              </div>

              {/* Nav */}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
                  style={{ flex: 1, padding: 9, background: C.heap, border: `1px solid ${C.border}`, color: si === 0 ? C.muted : C.text, borderRadius: 6, cursor: si === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13 }}>← Prev</button>
                <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
                  style={{ flex: 1, padding: 9, background: si === steps.length - 1 ? C.heap : C.accent, border: `1px solid ${si === steps.length - 1 ? C.border : C.accent}`, color: si === steps.length - 1 ? C.muted : "#0d0b1a", borderRadius: 6, cursor: si === steps.length - 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700 }}>Next →</button>
              </div>
            </Card>
          )}
        </>)}

        {/* ── CODE ── */}
        {tab === "Code" && (<>
          <Card title="Java Solution — HashMap + Doubly Linked List">
            <pre style={{ background: C.heap, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.9, margin: 0, overflowX: "auto", whiteSpace: "pre-wrap" }}>
              <span style={{ color: C.accent }}>{"class "}</span><span style={{ color: C.amber }}>LRUCache</span>{" {\n\n"}
              {"    "}<span style={{ color: C.muted }}>{"// Node stores key too — needed for HashMap removal on eviction\n"}</span>
              {"    "}<span style={{ color: C.accent }}>class </span><span style={{ color: C.amber }}>Node</span>{" {\n"}
              {"        "}<span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>key, val;{"\n"}</span>
              {"        "}<span style={{ color: C.amber }}>Node </span><span style={{ color: C.text }}>prev, next;{"\n"}</span>
              {"        "}<span style={{ color: C.amber }}>Node</span>(<span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>k, </span><span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>v) {"{ key=k; val=v; }\n"}</span>
              {"    }\n\n"}
              {"    "}<span style={{ color: C.accent }}>private </span><span style={{ color: C.amber }}>Map</span>{"<"}<span style={{ color: C.accent }}>Integer</span>, <span style={{ color: C.amber }}>Node</span>{"> map = new "}<span style={{ color: C.amber }}>HashMap</span>{"<>();\n"}
              {"    "}<span style={{ color: C.accent }}>private int </span><span style={{ color: C.text }}>capacity;{"\n"}</span>
              {"    "}<span style={{ color: C.muted }}>{"// dummy sentinels — eliminates all null checks\n"}</span>
              {"    "}<span style={{ color: C.accent }}>private </span><span style={{ color: C.amber }}>Node </span><span style={{ color: C.text }}>head = </span><span style={{ color: C.accent }}>new </span><span style={{ color: C.amber }}>Node</span>(0,0), tail = <span style={{ color: C.accent }}>new </span><span style={{ color: C.amber }}>Node</span>(0,0);{"\n\n"}
              {"    "}<span style={{ color: C.accent }}>public </span><span style={{ color: C.green }}>LRUCache</span>(<span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>capacity) {"{\n"}</span>
              {"        "}<span style={{ color: C.accent }}>this</span>.capacity = capacity;{"\n"}
              {"        "}head.next = tail; tail.prev = head; <span style={{ color: C.muted }}>// link sentinels{"\n"}</span>
              {"    }\n\n"}
              {"    "}<span style={{ color: C.accent }}>public int </span><span style={{ color: C.green }}>get</span>(<span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>key) {"{\n"}</span>
              {"        "}<span style={{ color: C.accent }}>if </span>(!map.containsKey(key)) <span style={{ color: C.accent }}>return </span>-1;{"\n"}
              {"        "}<span style={{ color: C.amber }}>Node </span>node = map.get(key);{"\n"}
              {"        "}remove(node); insertFront(node); <span style={{ color: C.muted }}>// move to MRU{"\n"}</span>
              {"        "}<span style={{ color: C.accent }}>return </span>node.val;{"\n"}
              {"    }\n\n"}
              {"    "}<span style={{ color: C.accent }}>public void </span><span style={{ color: C.green }}>put</span>(<span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>key, </span><span style={{ color: C.accent }}>int </span><span style={{ color: C.text }}>val) {"{\n"}</span>
              {"        "}<span style={{ color: C.accent }}>if </span>(map.containsKey(key)) remove(map.get(key)); <span style={{ color: C.muted }}>// remove old{"\n"}</span>
              {"        "}<span style={{ color: C.amber }}>Node </span>node = <span style={{ color: C.accent }}>new </span><span style={{ color: C.amber }}>Node</span>(key, val);{"\n"}
              {"        "}insertFront(node); map.put(key, node);{"\n"}
              {"        "}<span style={{ color: C.accent }}>if </span>(map.size() {">"} capacity) {"{\n"}
              {"            "}<span style={{ color: C.amber }}>Node </span>lru = tail.prev;{"\n"}
              {"            "}remove(lru); map.remove(lru.key); <span style={{ color: C.muted }}>{"// ← why Node stores key\n"}</span>
              {"        }\n    }\n\n"}
              {"    "}<span style={{ color: C.accent }}>private void </span><span style={{ color: C.green }}>remove</span>(<span style={{ color: C.amber }}>Node </span>n) {"{\n"}
              {"        "}n.prev.next = n.next; n.next.prev = n.prev;{"\n"}
              {"    }\n\n"}
              {"    "}<span style={{ color: C.accent }}>private void </span><span style={{ color: C.green }}>insertFront</span>(<span style={{ color: C.amber }}>Node </span>n) {"{\n"}
              {"        "}n.next = head.next; n.prev = head;{"\n"}
              {"        "}head.next.prev = n; head.next = n;{"\n"}
              {"    }\n}"}
            </pre>
          </Card>

          <Card title="Line-by-line Breakdown">
            {[
              { line: "Node { key, val, prev, next }", exp: "Node must store its own key — when evicting tail.prev you need the key to call map.remove(key)." },
              { line: "head, tail (dummy sentinels)", exp: "Two empty boundary nodes. Every real node sits between them. Eliminates null checks in remove() and insertFront()." },
              { line: "head.next = tail; tail.prev = head", exp: "Initial empty list. All inserts go between these two sentinels." },
              { line: "remove(node); insertFront(node) in get()", exp: "Detach the node from wherever it is, then reattach at the MRU (head) position. Two pointer rewires each." },
              { line: "if (map.containsKey) remove(map.get) in put()", exp: "Deduplication: if key exists, remove the old node first so we don't have two nodes for the same key." },
              { line: "if (map.size() > capacity)", exp: "Check AFTER insertion. If we've exceeded capacity, tail.prev is the LRU — remove it from both list and map." },
              { line: "n.prev.next = n.next; n.next.prev = n.prev", exp: "Classic DLL detach: bridge the gap left by n. Dummy sentinels mean prev/next are never null." },
              { line: "head.next.prev = n; head.next = n", exp: "Splice n right after dummy head. Four pointer assignments total — order matters to avoid losing references." },
            ].map(({ line, exp }) => (
              <div key={line} style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <code style={{ background: C.heap, padding: "3px 8px", borderRadius: 4, fontSize: 11, color: C.accent, whiteSpace: "nowrap", flexShrink: 0 }}>{line}</code>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{exp}</span>
              </div>
            ))}
          </Card>

          <Card title="🧩 Pattern Recognition Cheatsheet">
            {[
              { icon: "🗺️", text: 'HashMap + DLL = the classic "O(1) ordered structure" combo. Anytime you need O(1) access AND O(1) ordered eviction, reach for this.' },
              { icon: "🪆", text: "Dummy head/tail sentinels: always use them in DLL problems. They remove all edge cases (empty list, single node, insert at boundary)." },
              { icon: "🔑", text: "Node must store its key — the eviction step needs to clean up the HashMap. Easy to forget during an interview." },
              { icon: "🔧", text: "Build remove() and insertFront() first, then compose all operations from them. Never inline pointer logic." },
              { icon: "🔗", text: "Java cheat: LinkedHashMap has LRU behavior built-in via accessOrder=true. Know it exists but code from scratch in interviews." },
            ].map(({ icon, text }) => (
              <div key={icon} style={{ display: "flex", gap: 10, background: C.heap, borderRadius: 6, padding: "10px 12px", marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </Card>

          <Card title="⚡ Complexity">
            <div style={{ display: "flex", gap: 12 }}>
              {[{ l: "get / put TIME", v: "O(1)", s: "HashMap + constant DLL rewires" }, { l: "SPACE", v: "O(capacity)", s: "map + list hold ≤ capacity nodes" }].map(({ l, v, s }) => (
                <div key={l} style={{ flex: 1, background: C.heap, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 10, marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ color: C.green, fontWeight: 700, fontSize: 18 }}>{v}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
          </Card>
        </>)}

      </div>
    </div>
  );
}
