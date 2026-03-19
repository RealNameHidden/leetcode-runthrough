export const difficulty = 'Medium'
import { useState } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";
const PURPLE = "#a78bfa";

function V({ children, color }) {
  return <span style={{ display: "inline-block", padding: "1px 6px", marginLeft: 3, borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 11, fontFamily: "monospace" }}>{children}</span>;
}

function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
      padding: "6px 16px",
      background: highlight ? "rgba(78,204,163,0.08)" : "transparent",
      borderLeft: `3px solid ${highlight ? TEAL : "transparent"}`,
      transition: "background 0.2s",
    }}>
      <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.5, flexShrink: 0, color: "var(--code-text)" }}>
        {children}
      </div>
      {annotation && (
        <div style={{ fontSize: 11, color: annotationColor, whiteSpace: "nowrap", fontFamily: "monospace", opacity: 0.85 }}>
          // {annotation}
        </div>
      )}
    </div>
  );
}

const PRESETS = {
  "4-Cycle (LC)": {
    nodes: [1, 2, 3, 4],
    adj: { 1: [2, 4], 2: [1, 3], 3: [2, 4], 4: [3, 1] },
    positions: { 1: { x: 110, y: 95 }, 2: { x: 210, y: 95 }, 3: { x: 210, y: 195 }, 4: { x: 110, y: 195 } },
  },
  "Triangle": {
    nodes: [1, 2, 3],
    adj: { 1: [2, 3], 2: [1, 3], 3: [1, 2] },
    positions: { 1: { x: 160, y: 80 }, 2: { x: 80, y: 210 }, 3: { x: 240, y: 210 } },
  },
  "Path 1–2–3–4": {
    nodes: [1, 2, 3, 4],
    adj: { 1: [2], 2: [1, 3], 3: [2, 4], 4: [3] },
    positions: { 1: { x: 55, y: 150 }, 2: { x: 130, y: 150 }, 3: { x: 205, y: 150 }, 4: { x: 280, y: 150 } },
  },
};

function getUndirectedEdges(adj, nodes) {
  const seen = new Set();
  const edges = [];
  for (const n of nodes) {
    for (const nb of adj[n]) {
      const key = n < nb ? `${n}-${nb}` : `${nb}-${n}`;
      if (!seen.has(key)) { seen.add(key); edges.push([n, nb]); }
    }
  }
  return edges;
}

function simulate(presetName) {
  const { nodes, adj } = PRESETS[presetName];
  const steps = [];
  const visited = new Set();
  const clonedEdges = new Set();
  const queue = [];
  const start = nodes[0];

  const snap = (phase, currentNode, processingNeighbor, desc) => ({
    phase, currentNode, processingNeighbor, desc,
    visited: new Set(visited),
    clonedEdges: new Set(clonedEdges),
    queue: [...queue],
  });

  steps.push(snap("start", null, null, `Check if node is null → it's not. Begin BFS from node ${start}.`));
  visited.add(start);
  queue.push(start);
  steps.push(snap("clone_start", start, null, `Clone node ${start} → map[${start}] = new Node(${start}). Add ${start} to queue.`));

  while (queue.length > 0) {
    const curr = queue.shift();
    steps.push(snap("dequeue", curr, null, `Dequeue node ${curr}. Neighbors to process: [${adj[curr].join(", ")}].`));
    for (const nbr of adj[curr]) {
      if (!visited.has(nbr)) {
        visited.add(nbr);
        queue.push(nbr);
        steps.push(snap("clone_neighbor", curr, nbr, `Node ${nbr} not in map → clone it. map[${nbr}] = new Node(${nbr}). Enqueue ${nbr}.`));
      }
      clonedEdges.add(`${curr}-${nbr}`);
      steps.push(snap("add_edge", curr, nbr, `map[${curr}].neighbors.add(map[${nbr}])  →  edge ${curr}'→${nbr}' wired in clone.`));
    }
  }

  steps.push(snap("done", null, null, `BFS complete! All ${nodes.length} nodes cloned with correct edges. Return map[${start}].`));
  return steps;
}

function GraphSVG({ presetName, step, isClone }) {
  const { nodes, adj, positions } = PRESETS[presetName];
  const edges = getUndirectedEdges(adj, nodes);
  const W = 320, H = 280;

  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block", minWidth: 200 }}>
        {edges.map(([a, b]) => {
          const pa = positions[a], pb = positions[b];
          if (isClone) {
            const has = step.clonedEdges.has(`${a}-${b}`) || step.clonedEdges.has(`${b}-${a}`);
            if (!has) return null;
            const isCurrEdge = (a === step.currentNode || b === step.currentNode);
            return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={isCurrEdge ? BLUE : TEAL} strokeWidth={2.5} opacity={isCurrEdge ? 0.9 : 0.5} />;
          }
          const isCurr = a === step.currentNode || b === step.currentNode;
          return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={isCurr ? GOLD : "var(--viz-border)"} strokeWidth={isCurr ? 2.5 : 2} opacity={isCurr ? 0.8 : 0.5} />;
        })}
        {nodes.map(node => {
          const pos = positions[node];
          if (isClone && !step.visited.has(node)) return null;
          const isCurr = step.currentNode === node;
          const isNbr = step.processingNeighbor === node;
          const inQueue = step.queue.includes(node);
          const isVisited = step.visited.has(node);
          const color = isCurr ? GOLD : isNbr ? BLUE : inQueue ? PURPLE : isVisited ? TEAL : "var(--viz-muted)";
          return (
            <g key={node}>
              {(isCurr || isNbr) && <circle cx={pos.x} cy={pos.y} r={30} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />}
              <circle cx={pos.x} cy={pos.y} r={22} fill={`${color}22`} stroke={color} strokeWidth={2.5} />
              <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={14} fontWeight="bold" fontFamily="monospace">{node}</text>
              {isClone && <text x={pos.x} y={pos.y + 34} textAnchor="middle" fill={color} fontSize={9} fontFamily="monospace" opacity={0.7}>node{node}'</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [preset, setPreset] = useState("4-Cycle (LC)");
  const [steps, setSteps] = useState(() => simulate("4-Cycle (LC)"));
  const [si, setSi] = useState(0);

  const handlePreset = (name) => { setPreset(name); setSteps(simulate(name)); setSi(0); };
  const step = steps[si];

  const phaseColor = { start: TEAL, clone_start: TEAL, dequeue: GOLD, clone_neighbor: BLUE, add_edge: TEAL, done: TEAL }[step?.phase] || TEAL;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔗</span>
        <h1 className="font-semibold text-base">Clone Graph</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">BFS · HashMap</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given a reference to a node in a connected undirected graph, return a <strong>deep copy</strong> (clone) of the graph.
                  Each node contains an integer <code>val</code> and a list of its <code>neighbors</code>.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "Node cloneGraph(Node node)", desc: "Return deep copy of graph. Return null if node is null. Number of nodes: 0–100, values are unique 1–100." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — 4-cycle graph</p>
                <CodeBlock language="text">{`Input:   1 ── 2
         |         |
         4 ── 3

adjList: node 1 → [2, 4]
         node 2 → [1, 3]
         node 3 → [2, 4]
         node 4 → [3, 1]

Output: A new graph with the same structure.
        clone(1) ≠ original(1)   ← different memory addresses
        clone(1).val == 1         ← same values
        clone(1).neighbors are also NEW node objects`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Deep Copy vs Shallow Copy</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { color: TEAL, title: "✅ Deep Copy (what we want)", desc: "Every node is a brand-new object. Modifying the clone does not affect the original graph." },
                    { color: RED, title: "❌ Shallow Copy (wrong)", desc: "Nodes are shared between original and clone. Mutating one changes the other — breaks independence." },
                  ].map(({ color, title, desc }) => (
                    <div key={title} className="flex-1 min-w-40 rounded-lg p-3 border" style={{ background: `${color}0d`, borderColor: `${color}33` }}>
                      <p className="text-xs font-bold mb-2" style={{ color }}>{title}</p>
                      <p className="text-xs text-default-500 leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>HashMap: Dual Purpose</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Maps each original node → its clone. Acts as both a <strong>visited set</strong> (prevents infinite cycles) and a <strong>clone registry</strong> for wiring edges.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">original → clone</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>BFS Traversal</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Visit every node exactly once. For each: clone unseen neighbors, then <strong>always</strong> wire edges in the clone graph (even for already-seen neighbors).
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">Clone conditional · Wire unconditional</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                <CodeBlock>{`Node cloneGraph(Node node) {
  if (node == null) return null;

  Map<Node, Node> map = new HashMap<>();
  Queue<Node> queue = new LinkedList<>();

  map.put(node, new Node(node.val)); // clone start
  queue.offer(node);                 // enqueue original

  while (!queue.isEmpty()) {
    Node curr = queue.poll();

    for (Node neighbor : curr.neighbors) {
      if (!map.containsKey(neighbor)) {  // new node?
        map.put(neighbor, new Node(neighbor.val));
        queue.offer(neighbor);
      }
      // Always wire — even for already-seen neighbors
      map.get(curr).neighbors.add(map.get(neighbor));
    }
  }
  return map.get(node);
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Cloning is conditional (only if new). Edge-wiring is unconditional (every neighbor, every time). Mixing these up is the #1 bug.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(V+E)", s: "Each node and edge visited once" },
                    { l: "SPACE", v: "O(V)", s: "HashMap + BFS queue" }
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          {/* VISUALIZER */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(PRESETS).map(name => (
                    <Button key={name} size="sm"
                      variant={preset === name ? "flat" : "bordered"}
                      color={preset === name ? "primary" : "default"}
                      onPress={() => handlePreset(name)}>
                      {name}
                    </Button>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>
                <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                  {si + 1}/{steps.length}
                </p>

                {/* Status line */}
                <p className="text-xs text-default-500 mb-4">
                  {step.currentNode !== null && <>Current: <V color={GOLD}>{step.currentNode}</V></>}
                  {step.processingNeighbor !== null && <> · Neighbor: <V color={BLUE}>{step.processingNeighbor}</V></>}
                  {step.queue.length > 0 && <> · Queue: <V color={PURPLE}>[{step.queue.join(", ")}]</V></>}
                  {step.visited.size > 0 && <> · Cloned: <V color={TEAL}>{step.visited.size}/{PRESETS[preset].nodes.length}</V></>}
                </p>

                {/* Live code */}
                <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                  <CodeLine highlight={step.phase === "start"} annotation={step.phase === "start" ? "node exists, continue" : undefined} annotationColor={TEAL}>
                    if (node == null) return null
                  </CodeLine>
                  <CodeLine highlight={step.phase === "clone_start"} annotation={step.phase === "clone_start" ? `cloned node ${step.currentNode}` : undefined} annotationColor={TEAL}>
                    {"  "}map.put(node, new Node(node.val)); queue.offer(node)
                  </CodeLine>
                  <CodeLine highlight={step.phase === "dequeue"} annotation={step.phase === "dequeue" ? `curr = ${step.currentNode}` : undefined} annotationColor={GOLD}>
                    {"  "}Node curr = queue.poll()
                  </CodeLine>
                  <CodeLine highlight={step.phase === "clone_neighbor"} annotation={step.phase === "clone_neighbor" ? `cloned node ${step.processingNeighbor}` : undefined} annotationColor={BLUE}>
                    {"    "}if (!map.containsKey(nbr)) {"{ clone & enqueue }"}
                  </CodeLine>
                  <CodeLine highlight={step.phase === "add_edge"} annotation={step.phase === "add_edge" ? `edge ${step.currentNode}'→${step.processingNeighbor}'` : undefined} annotationColor={TEAL}>
                    {"    "}map.get(curr).neighbors.add(map.get(nbr))
                  </CodeLine>
                  <CodeLine highlight={step.phase === "done"} annotation={step.phase === "done" ? "deep copy complete!" : undefined} annotationColor={GOLD}>
                    return map.get(node)
                  </CodeLine>
                </div>

                {/* Dual graph viz */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  <div className="flex-1 rounded-xl p-3" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", minWidth: 200 }}>
                    <p className="text-xs text-default-400 text-center mb-2 uppercase tracking-wider font-bold">Original Graph</p>
                    <GraphSVG presetName={preset} step={step} isClone={false} />
                  </div>
                  <div className="flex-1 rounded-xl p-3" style={{ background: "var(--viz-surface)", border: `1px solid ${TEAL}44`, minWidth: 200 }}>
                    <p className="text-xs text-center mb-2 uppercase tracking-wider font-bold" style={{ color: TEAL }}>Clone Graph (Building…)</p>
                    <GraphSVG presetName={preset} step={step} isClone={true} />
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-3 flex-wrap mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                  {[
                    { color: GOLD, label: "Current node" },
                    { color: BLUE, label: "Processing neighbor" },
                    { color: PURPLE, label: "In BFS queue" },
                    { color: TEAL, label: "Cloned / visited" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-default-500">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      {label}
                    </div>
                  ))}
                </div>

                {/* HashMap state */}
                <div className="rounded-lg p-3 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                  <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">HashMap State</p>
                  {step.visited.size === 0
                    ? <span className="text-xs font-mono text-default-300">— empty —</span>
                    : <div className="flex gap-2 flex-wrap">
                      {[...step.visited].sort((a, b) => a - b).map(n => (
                        <div key={n} className="px-2 py-1 rounded text-xs font-mono" style={{ background: `${TEAL}18`, border: `1px solid ${TEAL}44`, color: TEAL }}>
                          {n} → node{n}'
                        </div>
                      ))}
                    </div>
                  }
                </div>

                {/* Step desc */}
                <div className="rounded-lg px-4 py-3 text-sm font-mono mb-4" style={{ borderLeft: `3px solid ${phaseColor}`, background: "var(--viz-surface)" }}>
                  {step.desc}
                </div>

                {/* Nav */}
                <div className="flex gap-2">
                  <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                  <span className="text-xs self-center whitespace-nowrap">{si + 1} / {steps.length}</span>
                  <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                </div>
              </CardBody></Card>

              {/* Final state */}
              {step.phase === "done" && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Deep Copy Complete</p>
                  <div className="rounded-xl p-6 text-center" style={{ background: "var(--viz-surface)", border: `1px solid ${TEAL}44` }}>
                    <p className="text-4xl font-bold mb-1" style={{ color: TEAL }}>✓</p>
                    <p className="text-lg font-bold mb-1" style={{ color: TEAL }}>
                      {PRESETS[preset].nodes.length} nodes · {[...step.clonedEdges].length} directed edges
                    </p>
                    <p className="text-xs text-default-400">Original and clone are fully independent in memory</p>
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          {/* CODE */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution (BFS)</p>
                <CodeBlock>{`class Solution {
  public Node cloneGraph(Node node) {
    if (node == null) return null;

    // Map: original node → cloned node
    Map<Node, Node> map = new HashMap<>();
    Queue<Node> queue = new LinkedList<>();

    // Seed BFS with start node
    map.put(node, new Node(node.val));
    queue.offer(node);

    while (!queue.isEmpty()) {
      Node curr = queue.poll();

      for (Node neighbor : curr.neighbors) {
        // Clone only if not yet visited
        if (!map.containsKey(neighbor)) {
          map.put(neighbor, new Node(neighbor.val));
          queue.offer(neighbor);
        }
        // Always wire edge in clone graph
        map.get(curr).neighbors.add(map.get(neighbor));
      }
    }
    return map.get(node);
  }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">DFS Recursive Alternative</p>
                <CodeBlock>{`Map<Node, Node> map = new HashMap<>();

public Node cloneGraph(Node node) {
  if (node == null) return null;
  if (map.containsKey(node)) return map.get(node); // cycle guard

  Node clone = new Node(node.val);
  map.put(node, clone);          // ← BEFORE recursing (critical!)

  for (Node n : node.neighbors)
    clone.neighbors.add(cloneGraph(n));

  return clone;
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${RED}0d`, borderColor: `${RED}33` }}>
                  <span style={{ color: RED }} className="font-bold">⚠️ DFS trap: </span>
                  You MUST add the node to the map before recursing into neighbors — otherwise a cycle causes infinite recursion.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (node == null) return null", exp: "Handle the empty graph case — always the first check." },
                    { line: "Map<Node, Node> map", exp: "Dual-purpose: visited set (cycle detection) + lookup table for building neighbor lists in the clone." },
                    { line: "map.put(node, new Node(...))", exp: "Seed BFS. We enqueue the ORIGINAL — traversal is over originals, clones are built via map." },
                    { line: "if (!map.containsKey(neighbor))", exp: "Conditional clone: only create a new clone if unseen. Prevents revisiting and infinite cycles." },
                    { line: "map.get(curr).neighbors.add(...)", exp: "Unconditional edge wiring — runs for EVERY neighbor, new or not. Most common bug location." },
                    { line: "return map.get(node)", exp: "Return the clone of the input node (root of cloned graph)." },
                  ].map(({ line, exp }) => (
                    <div key={line} className="py-3 flex gap-3 items-start">
                      <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono"
                        style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
                        {line}
                      </code>
                      <span className="text-sm text-default-500 leading-relaxed">{exp}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📍", color: TEAL, tip: "HashMap plays a dual role — cycle detection AND clone lookup. Without it, you'd loop infinitely on cycles." },
                    { icon: "⚠️", color: GOLD, tip: "Edge-wiring is always unconditional. Cloning a node is conditional (only if new). Never mix these up." },
                    { icon: "🔄", color: BLUE, tip: "DFS: add to map BEFORE recursing. BFS: add to map BEFORE enqueueing. Both stop cycles." },
                    { icon: "💡", color: TEAL, tip: "You traverse ORIGINAL nodes but build CLONE nodes via map.get(). Two parallel graphs being built side-by-side." },
                    { icon: "🎯", color: GOLD, tip: "Related: Copy List with Random Pointer (exact same pattern), Number of Islands (BFS/DFS flood-fill)." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                      <span className="text-base">{icon}</span>
                      <span className="text-sm text-default-500 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
