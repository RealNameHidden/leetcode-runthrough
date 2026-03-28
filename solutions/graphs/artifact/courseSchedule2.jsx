export const difficulty = 'Medium';

import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Colors ──────────────────────────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

// ── Inline components ───────────────────────────────────────────────
function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 5px", marginLeft: 2,
      borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 12
    }}>
      {children}
    </span>
  );
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
      <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.5, flexShrink: 0 }}>
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

// ── Graph visualization ─────────────────────────────────────────────
function GraphViz({ numCourses, edges, nodeStates, currentCourse }) {
  const r = 20;
  const padding = 40;
  const width = 280;
  const height = 200;
  const cx = width / 2;
  const cy = height / 2;
  const circleR = Math.min(cx, cy) - padding;

  const positions = Array.from({ length: numCourses }, (_, i) => {
    const angle = (i / numCourses) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + circleR * Math.cos(angle), y: cy + circleR * Math.sin(angle) };
  });

  function arrowLine(from, to, idx, highlight) {
    const p1 = positions[from], p2 = positions[to];
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len, uy = dy / len;
    const x1 = p1.x + ux * r, y1 = p1.y + uy * r;
    const x2 = p2.x - ux * (r + 6), y2 = p2.y - uy * (r + 6);
    const col = highlight ? GOLD : "var(--viz-border)";
    return (
      <g key={`e-${idx}`}>
        <defs>
          <marker id={`ah-${idx}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={col} />
          </marker>
        </defs>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={col} strokeWidth={highlight ? 2 : 1.2}
          markerEnd={`url(#ah-${idx})`} />
      </g>
    );
  }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      {edges.map(([a, b], i) => arrowLine(b, a, i, currentCourse === b))}
      {Array.from({ length: numCourses }, (_, i) => {
        const { x, y } = positions[i];
        const st = nodeStates[i];
        const fill = st === 1 ? GOLD : st === 2 ? TEAL : "var(--viz-node-bg)";
        const stroke = st === 1 ? GOLD : st === 2 ? TEAL : "var(--viz-border)";
        const isCurrent = i === currentCourse;
        return (
          <g key={`n-${i}`}>
            {isCurrent && <circle cx={x} cy={y} r={r + 5} fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="4 3" />}
            <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 13, fontWeight: 700, fill: "#fff" }}>{i}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Algorithm simulation ────────────────────────────────────────────
function simulate(numCourses, prerequisites) {
  const steps = [];
  const state = new Array(numCourses).fill(0);
  const adj = Array.from({ length: numCourses }, () => []);
  const result = [];

  for (const [a, b] of prerequisites) adj[b].push(a);

  let cycleFound = false;

  function dfs(course) {
    if (state[course] === 1) {
      steps.push({
        course, state: [...state], result: [...result],
        line: "cycle", event: `Back edge! Course ${course} is already VISITING → cycle detected`,
        hasCycle: true
      });
      cycleFound = true;
      return true;
    }
    if (state[course] === 2) return false;

    state[course] = 1;
    steps.push({
      course, state: [...state], result: [...result],
      line: "visit", event: `Mark course ${course} as VISITING`,
      hasCycle: false
    });

    for (const nb of adj[course]) {
      if (dfs(nb)) return true;
    }

    state[course] = 2;
    result.push(course);
    steps.push({
      course, state: [...state], result: [...result],
      line: "done", event: `Course ${course} fully explored → add to result`,
      hasCycle: false
    });
    return false;
  }

  for (let i = 0; i < numCourses; i++) {
    if (state[i] === 0) {
      if (dfs(i)) break;
    }
  }

  if (steps.length === 0) {
    steps.push({
      course: -1, state: [...state], result: [...result],
      line: "none", event: "No prerequisites — any order is valid",
      hasCycle: false
    });
  }

  return { steps, hasCycle: cycleFound, finalOrder: cycleFound ? [] : [...result].reverse() };
}

// ── Presets ──────────────────────────────────────────────────────────
const PRESETS = [
  { label: "Linear (4)", numCourses: 4, prerequisites: [[1,0],[2,0],[3,1],[3,2]] },
  { label: "No Prereqs (3)", numCourses: 3, prerequisites: [] },
  { label: "Cycle (3)", numCourses: 3, prerequisites: [[0,1],[1,2],[2,0]] },
  { label: "Simple (2)", numCourses: 2, prerequisites: [[1,0]] },
];

export default function App() {
  const [si, setSi] = useState(0);
  const [sim, setSim] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (preset) => {
    const s = simulate(preset.numCourses, preset.prerequisites);
    setSim({ ...preset, ...s });
    setSi(0);
    setActivePreset(preset.label);
  };

  useEffect(() => { applyPreset(PRESETS[0]); }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📋</span>
        <h1 className="font-semibold text-base">Course Schedule II</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Graph · Topological Sort</Chip>
      </div>

      <Tabs className="flex-1 px-6 py-4" isVertical={false}>
        {/* ── TAB 0: PROBLEM ─────────────────────────────────────── */}
        <Tab key="problem" title="Problem">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
              <p className="text-sm text-default-600 leading-relaxed mb-4">
                There are <span style={{ color: TEAL, fontWeight: "bold" }}>numCourses</span> courses labeled <code>0</code> to <code>numCourses - 1</code>.
                You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a, b]</code> means
                you must take course <code>b</code> before course <code>a</code>.
              </p>
              <p className="text-sm text-default-600 leading-relaxed mb-4">
                Return <strong>the ordering of courses</strong> you should take to finish all courses.
                If there are many valid orderings, return <strong>any of them</strong>.
                If it is impossible to finish all courses (cycle exists), return an <strong>empty array</strong>.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { sig: "int[] findOrder(int numCourses, int[][] prerequisites)", desc: "Returns a valid topological ordering of all courses, or an empty array if a cycle exists." },
                ].map(({ sig, desc }) => (
                  <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                    <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                  </div>
                ))}
              </div>
            </CardBody></Card>

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Valid Ordering</p>
              <CodeBlock language="text">{`Input: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
Output: [0, 2, 1, 3]  (one valid ordering)

Graph:
  0 → 1 → 3
  0 → 2 → 3

Course 0 has no prereqs, so take it first.
Courses 1 and 2 both depend on 0.
Course 3 depends on both 1 and 2.
Valid orderings: [0,1,2,3] or [0,2,1,3]`}</CodeBlock>
            </CardBody></Card>

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Impossible (Cycle)</p>
              <CodeBlock language="text">{`Input: numCourses = 3, prerequisites = [[0,1],[1,2],[2,0]]
Output: []

Graph:
  0 → 1 → 2 → 0  (circular dependency)

Every course eventually depends on itself.
No valid ordering exists → return empty array.`}</CodeBlock>
            </CardBody></Card>
          </div>
        </Tab>

        {/* ── TAB 1: INTUITION ───────────────────────────────────── */}
        <Tab key="intuition" title="Intuition">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                  <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Topological Sort via DFS</p>
                  <p className="text-sm leading-relaxed text-default-500">
                    A valid course order is a <strong>topological ordering</strong> of the dependency graph.
                    DFS post-order (reversed) naturally produces this ordering — a node is added <em>after</em> all its dependents are processed.
                  </p>
                  <p className="text-xs text-default-400 mt-3 font-mono">post-order + reverse = topo sort</p>
                </div>
                <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                  <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Same Cycle Detection</p>
                  <p className="text-sm leading-relaxed text-default-500">
                    Uses the <strong>identical 3-state DFS</strong> from Course Schedule I. If a back edge is found (revisiting state 1), a cycle exists and no valid ordering is possible.
                  </p>
                  <p className="text-xs text-default-400 mt-3 font-mono">cycle? → return empty array</p>
                </div>
              </div>
            </CardBody></Card>

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template — Topological Sort (DFS)</p>
              <CodeBlock language="java">{`function findOrder(numCourses, prerequisites):
  state = array of size numCourses, all 0
  result = empty list
  build adjacency list from prerequisites

  for each course:
    if state[course] == 0:
      if hasCycle(course): return []   // impossible

  return reverse(result)               // topological order

function hasCycle(course):
  if state[course] == 1: return true   // back edge → cycle
  if state[course] == 2: return false  // already explored

  state[course] = 1                    // mark visiting
  for each neighbor:
    if hasCycle(neighbor): return true

  state[course] = 2                    // mark visited
  result.add(course)                   // ← post-order collection
  return false`}</CodeBlock>

              <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                <span style={{ color: GOLD }} className="font-bold">⚠️ Key Insight: </span>
                The <strong>only difference</strong> from Course Schedule I is <code>result.add(course)</code> at post-order.
                Courses are added <em>after</em> all their dependents finish, so reversing gives a valid prerequisite-first ordering.
              </div>
            </CardBody></Card>

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Why Post-Order Works</p>
              <div className="flex flex-col gap-3">
                <div className="rounded-lg p-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                  <p className="text-sm text-default-500 leading-relaxed">
                    In DFS, a node is finished <strong>after</strong> all nodes reachable from it are finished.
                    So in the result list, dependents appear <strong>before</strong> their prerequisites.
                    Reversing gives the correct order: prerequisites first.
                  </p>
                </div>
                <div className="flex gap-3 text-xs text-default-400 font-mono flex-wrap">
                  <span>DFS finish order: <V color={TEAL}>3</V> <V color={TEAL}>1</V> <V color={TEAL}>2</V> <V color={TEAL}>0</V></span>
                  <span>→ Reversed: <V color={GOLD}>0</V> <V color={GOLD}>2</V> <V color={GOLD}>1</V> <V color={GOLD}>3</V></span>
                </div>
              </div>
            </CardBody></Card>

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
              <div className="flex gap-3">
                {[
                  { l: "TIME", v: "O(V + E)", s: "Visit each course and edge once" },
                  { l: "SPACE", v: "O(V + E)", s: "Adjacency list + recursion stack + result array" }
                ].map(({ l, v, s }) => (
                  <div key={l} className="flex-1 rounded-lg p-4 text-center"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-500 mb-1">{l}</p>
                    <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                    <p className="text-xs text-default-400 mt-1">{s}</p>
                  </div>
                ))}
              </div>
            </CardBody></Card>
          </div>
        </Tab>

        {/* ── TAB 2: VISUALIZER ──────────────────────────────────── */}
        <Tab key="visualizer" title="Visualizer">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            {sim && (() => {
              const step = sim.steps[si];
              return (
                <>
                  <Card><CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {PRESETS.map((p) => (
                        <Button key={p.label} size="sm"
                          variant={activePreset === p.label ? "flat" : "bordered"}
                          color={activePreset === p.label ? "primary" : "default"}
                          onPress={() => applyPreset(p)}>
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </CardBody></Card>

                  <Card><CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Debugger</p>

                    <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                      {si + 1}/{sim.steps.length}
                    </p>

                    {/* Status */}
                    <p className="text-xs text-default-500 mb-2">
                      Course: <V color={TEAL}>{step.course}</V> ·
                      State: <V color={step.line === "visit" ? GOLD : step.line === "done" ? TEAL : RED}>
                        {step.line === "visit" ? "VISITING" : step.line === "done" ? "VISITED" : step.line === "cycle" ? "CYCLE" : "—"}
                      </V>
                      {step.hasCycle && <span style={{ color: RED, fontWeight: "bold", marginLeft: 8 }}>✗ CYCLE</span>}
                    </p>
                    <p className="text-xs text-default-500 mb-4">{step.event}</p>

                    {/* Live code block */}
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={step.line === "cycle"} annotation={step.line === "cycle" ? `state[${step.course}] == 1 → true` : ""} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>if (state[course] == 1) return true;</span>
                      </CodeLine>
                      <CodeLine highlight={step.line === "visit"} annotation={step.line === "visit" ? `state[${step.course}] = 1` : ""} annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>state[course] = 1;</span>
                      </CodeLine>
                      <CodeLine annotation="" annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>for (int nb : adj.get(course))</span>
                      </CodeLine>
                      <CodeLine highlight={step.line === "done"} annotation={step.line === "done" ? `state[${step.course}] = 2` : ""} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>state[course] = 2;</span>
                      </CodeLine>
                      <CodeLine highlight={step.line === "done"} annotation={step.line === "done" ? `result ← [${step.result.join(", ")}]` : `result = [${step.result.join(", ")}]`} annotationColor={step.line === "done" ? GOLD : TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>result.add(course);</span>
                      </CodeLine>
                    </div>

                    {/* Graph visualization */}
                    <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <GraphViz
                        numCourses={sim.numCourses}
                        edges={sim.prerequisites}
                        nodeStates={step.state}
                        currentCourse={step.course}
                      />
                      <p className="text-xs text-default-400 mt-2 font-mono">
                        <span style={{ color: "var(--viz-muted)" }}>●</span> Unvisited ·
                        <span style={{ color: GOLD }}> ●</span> Visiting ·
                        <span style={{ color: TEAL }}> ●</span> Visited
                      </p>
                    </div>

                    {/* Result so far */}
                    <div className="rounded-lg p-3 mb-4 flex items-center gap-2 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <span className="text-xs text-default-400">Post-order result:</span>
                      {step.result.length === 0
                        ? <span className="text-xs text-default-400 font-mono">[ ]</span>
                        : step.result.map((c, i) => <V key={i} color={TEAL}>{c}</V>)
                      }
                    </div>

                    <div className="flex gap-2">
                      <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                        onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                      <Button fullWidth color="primary" size="sm" isDisabled={si === sim.steps.length - 1}
                        onPress={() => setSi(i => Math.min(sim.steps.length - 1, i + 1))}>Next →</Button>
                    </div>
                  </CardBody></Card>

                  <Card><CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                    <div className="text-center py-6 rounded-lg" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      {sim.hasCycle ? (
                        <>
                          <p className="text-xs text-default-500 mb-2">Cycle Detected</p>
                          <p style={{ fontSize: 28, fontWeight: "bold", color: RED }}>[ ]</p>
                          <p className="text-xs text-default-400 mt-2">No valid ordering exists</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-default-500 mb-2">Topological Order</p>
                          <div className="flex justify-center gap-2 flex-wrap mt-2">
                            {sim.finalOrder.map((c, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <V color={TEAL}>{c}</V>
                                {i < sim.finalOrder.length - 1 && <span className="text-default-400">→</span>}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-default-400 mt-3">All courses can be completed in this order</p>
                        </>
                      )}
                    </div>
                  </CardBody></Card>
                </>
              );
            })()}
          </div>
        </Tab>

        {/* ── TAB 3: CODE ────────────────────────────────────────── */}
        <Tab key="code" title="Code">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <ArtifactRevisedButton />

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Solution</p>
              <CodeBlock language="java">{`import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

public class CourseSchedule2 {
    // 0 = unvisited, 1 = visiting, 2 = visited
    int[] state;
    List<List<Integer>> adj;
    List<Integer> result = new ArrayList<>();

    public int[] findOrder(int numCourses, int[][] prerequisites) {
        state = new int[numCourses];
        adj = new ArrayList<>();
        for (int i = 0; i < numCourses; i++)
            adj.add(new ArrayList<>());

        // Build graph: [a, b] means b → a
        for (int[] pre : prerequisites)
            adj.get(pre[1]).add(pre[0]);

        // DFS from each unvisited course
        for (int i = 0; i < numCourses; i++)
            if (state[i] == 0 && hasCycle(i))
                return new int[]{};

        // Reverse post-order = topological order
        Collections.reverse(result);
        return result.stream().mapToInt(i -> i).toArray();
    }

    boolean hasCycle(int course) {
        if (state[course] == 1) return true;   // back edge
        if (state[course] == 2) return false;  // already done

        state[course] = 1;                     // visiting
        for (int nb : adj.get(course))
            if (hasCycle(nb)) return true;

        state[course] = 2;                     // visited
        result.add(course);                    // post-order
        return false;
    }
}`}</CodeBlock>
            </CardBody></Card>

            <Card><CardBody>
              <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
              <div className="flex flex-col divide-y divide-divider">
                {[
                  { line: "state = new int[numCourses]", exp: "Track DFS state: 0 unvisited, 1 visiting (in path), 2 visited (done)." },
                  { line: "adj.get(pre[1]).add(pre[0])", exp: "Build directed edge: pre[1] → pre[0] (prerequisite points to dependent)." },
                  { line: "if (state[i] == 0 && hasCycle(i))", exp: "Start DFS from each unvisited course. If cycle found, return empty array." },
                  { line: "Collections.reverse(result)", exp: "Post-order is reversed topological order. Reverse to get correct ordering." },
                  { line: "if (state[course] == 1) return true", exp: "Re-encountering a visiting node = back edge = cycle. Ordering impossible." },
                  { line: "state[course] = 1", exp: "Mark course as currently being explored in this DFS path." },
                  { line: "result.add(course)", exp: "Add to result AFTER all dependents are processed (post-order). This is the key line." },
                  { line: "state[course] = 2", exp: "Mark as fully explored. Future DFS calls skip this node." },
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
                  { icon: "📍", color: TEAL, tip: "Topological sort = DFS post-order reversed. Add the node to result AFTER recursing into all neighbors, then reverse at the end." },
                  { icon: "⚠️", color: GOLD, tip: "Don't forget to reverse the result. Post-order collects dependents first, but we need prerequisites first." },
                  { icon: "🔗", color: BLUE, tip: "This is Course Schedule I + one extra line: result.add(course). The cycle detection is identical." },
                  { icon: "🔄", color: BLUE, tip: "Alternative: Kahn's algorithm (BFS) uses in-degree counting. Process nodes with in-degree 0 first. Iterative, no recursion stack." },
                  { icon: "💡", color: TEAL, tip: "Multiple valid orderings may exist. DFS order depends on iteration order of nodes and neighbors." },
                ].map(({ icon, color, tip }) => (
                  <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
  );
}
