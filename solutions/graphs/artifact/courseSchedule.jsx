export const difficulty = 'Medium';

import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Colors ──────────────────────────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

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

// ── Simple directed graph viz ───────────────────────────────────────
function GraphViz({ nodes, edges, nodeStates, highlightEdge }) {
  const radius = 25;
  const cx = 80, cy = 60;
  const circleRadius = 55;

  const positions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + circleRadius * Math.cos(angle),
      y: cy + circleRadius * Math.sin(angle)
    };
  });

  return (
    <svg width="100%" height="200" viewBox="0 0 160 140" style={{ display: "block" }}>
      {/* Edges */}
      {edges.map(([from, to], idx) => {
        const p1 = positions[from], p2 = positions[to];
        const isHighlight = highlightEdge && highlightEdge[0] === from && highlightEdge[1] === to;
        return (
          <g key={`edge-${idx}`}>
            <defs>
              <marker id={`arrow-${idx}`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill={isHighlight ? TEAL : "#999"} />
              </marker>
            </defs>
            <line
              x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={isHighlight ? TEAL : "#ddd"}
              strokeWidth={isHighlight ? 2 : 1}
              markerEnd={`url(#arrow-${idx})`}
            />
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const { x, y } = positions[i];
        const state = nodeStates[i]; // 0=unvisited, 1=visiting, 2=visited
        const nodeBg = state === 1 ? GOLD : state === 2 ? TEAL : "var(--viz-node-bg)";
        const nodeStroke = state === 1 ? GOLD : state === 2 ? TEAL : "var(--viz-border)";

        return (
          <g key={`node-${i}`}>
            <circle cx={x} cy={y} r={radius} fill={nodeBg} stroke={nodeStroke} strokeWidth="1.5" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 12, fontWeight: "bold", color: "#fff", fill: "#fff" }}>
              {node}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Algorithm simulation ────────────────────────────────────────────
function simulate(numCourses, prerequisites) {
  const steps = [];
  const state = new Array(numCourses).fill(0); // 0=unvisited, 1=visiting, 2=visited
  const adjList = Array.from({ length: numCourses }, () => []);

  for (let i = 0; i < numCourses; i++) {
    adjList[i] = [];
  }
  for (const [a, b] of prerequisites) {
    adjList[b].push(a);
  }

  let hasCycleFound = false;

  function dfs(course, path = []) {
    if (state[course] === 1) {
      steps.push({
        course,
        state: [...state],
        path: [...path, course],
        event: `Back edge detected: ${course} already VISITING!`,
        hasCycle: true
      });
      hasCycleFound = true;
      return true;
    }
    if (state[course] === 2) {
      return false;
    }

    state[course] = 1;
    steps.push({
      course,
      state: [...state],
      path: [...path, course],
      event: `Visit course ${course}`,
      hasCycle: false
    });

    const neighbours = adjList[course];
    for (const neighbor of neighbours) {
      if (dfs(neighbor, [...path, course])) {
        hasCycleFound = true;
      }
    }

    state[course] = 2;
    steps.push({
      course,
      state: [...state],
      path: [...path],
      event: `Backtrack: course ${course} fully explored`,
      hasCycle: false
    });
  }

  for (let i = 0; i < numCourses; i++) {
    if (state[i] === 0) {
      dfs(i);
      if (hasCycleFound) break;
    }
  }

  if (steps.length === 0) {
    steps.push({
      course: -1,
      state: [...state],
      path: [],
      event: "No prerequisites. All courses can be finished.",
      hasCycle: false
    });
  }

  return { steps, hasCycle: hasCycleFound };
}

export default function App() {
  const [si, setSi] = useState(0);
  const [sim, setSim] = useState(null);

  const PRESETS = [
    { label: "Cycle (2,0,1)", numCourses: 2, prerequisites: [[1, 0], [0, 1]] },
    { label: "No Cycle (2,0,1)", numCourses: 2, prerequisites: [[1, 0]] },
    { label: "Complex (3)", numCourses: 3, prerequisites: [[1, 0], [2, 1]] },
  ];

  const applyPreset = (preset) => {
    const s = simulate(preset.numCourses, preset.prerequisites);
    setSim({ ...preset, ...s });
    setSi(0);
  };

  useEffect(() => {
    applyPreset(PRESETS[1]);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🎓</span>
        <h1 className="font-semibold text-base">Course Schedule</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Graph · Cycle Detection</Chip>
      </div>

      {/* Tabs */}
      <Tabs className="flex-1 px-6 py-4" isVertical={false}>
        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 0: PROBLEM */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="problem" title="Problem">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  You are given a total of <span style={{ color: TEAL, fontWeight: "bold" }}>numCourses</span> courses labeled <code>0</code> to <code>numCourses - 1</code>, and a list of prerequisite pairs <span style={{ color: TEAL, fontWeight: "bold" }}>prerequisites</span> where <code>prerequisites[i] = [a, b]</code> means you must take course <code>b</code> before course <code>a</code>.
                </p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Return <code>true</code> if you can finish all courses. Otherwise, return <code>false</code>.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "boolean canFinish(int numCourses, int[][] prerequisites)", desc: "Check if all courses can be completed without circular dependencies." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Cycle Detected</p>
                <CodeBlock language="text">{`Input: numCourses = 2, prerequisites = [[1,0],[0,1]]
Expected output: false

Explanation:
  • Course 1 requires course 0 (0 → 1)
  • Course 0 requires course 1 (1 → 0)
  • This creates a cycle: 0 → 1 → 0
  • Cannot finish all courses`}</CodeBlock>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — No Cycle</p>
                <CodeBlock language="text">{`Input: numCourses = 2, prerequisites = [[1,0]]
Expected output: true

Explanation:
  • Course 1 requires course 0
  • Take course 0 first, then course 1
  • All courses can be finished`}</CodeBlock>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 1: INTUITION */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="intuition" title="Intuition">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Dependency Graph</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Model courses as <strong>nodes</strong> and prerequisite requirements as <strong>directed edges</strong>. An edge from A to B means A depends on B.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">prerequisite = dependency</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Cycle Detection</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      A <strong>cycle</strong> in the dependency graph means courses cannot be completed (circular prerequisite). Use <strong>3-state DFS</strong> to detect back edges.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">cycle = impossible</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template — 3-State DFS</p>
                <CodeBlock language="java">{`function canFinish(numCourses, prerequisites):
  state = array of size numCourses, all 0
  adjList = build adjacency list from prerequisites

  for each course:
    if state[course] == 0:  // unvisited
      if hasCycle(course):
        return false
  return true

function hasCycle(course):
  if state[course] == 1:   // currently visiting → back edge!
    return true
  if state[course] == 2:   // already explored
    return false

  state[course] = 1        // mark as visiting
  for each neighbor in adjList[course]:
    if hasCycle(neighbor):
      return true
  state[course] = 2        // mark as visited
  return false`}</CodeBlock>

                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key Insight: </span>
                  If we revisit a node that is <span style={{ color: GOLD, fontWeight: "bold" }}>currently in the recursion stack</span> (state 1), we've found a back edge and thus a cycle.
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">State Machine</p>
                <div className="flex gap-3 flex-col text-sm">
                  <div className="flex gap-2 items-center">
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 3, background: "var(--viz-node-bg)", border: "1px solid var(--viz-border)" }} />
                    <span className="text-default-500"><strong>State 0 (Unvisited):</strong> Not yet explored</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 3, background: GOLD }} />
                    <span className="text-default-500"><strong>State 1 (Visiting):</strong> In current DFS path; revisiting = cycle!</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 3, background: TEAL }} />
                    <span className="text-default-500"><strong>State 2 (Visited):</strong> Fully explored; no cycle in subtree</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3">
                  {[{ l: "TIME", v: "O(n + m)", s: "n courses, m prerequisites. Each visited once." }, { l: "SPACE", v: "O(n + m)", s: "Adjacency list + recursion stack (max depth = n)" }].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 2: VISUALIZER */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="visualizer" title="Visualizer">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            {sim ? (
              <>
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {PRESETS.map((p) => (
                        <Button
                          key={p.label}
                          size="sm"
                          variant={sim.label === p.label ? "flat" : "bordered"}
                          color={sim.label === p.label ? "primary" : "default"}
                          onPress={() => applyPreset(p)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Debugger</p>
                    {sim.steps.length > 0 && (
                      <>
                        <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                          {si + 1}/{sim.steps.length}
                        </p>

                        {(() => {
                          const step = sim.steps[si];
                          return (
                            <>
                              <p className="text-xs text-default-500 mb-4">
                                <span style={{ color: TEAL, fontWeight: "bold" }}>{step.event}</span>
                                {step.hasCycle && <span style={{ color: RED, fontWeight: "bold", marginLeft: 8 }}>✗ CYCLE FOUND</span>}
                              </p>

                              {/* Visualization */}
                              <div className="rounded-xl p-5 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                                <GraphViz
                                  nodes={Array.from({ length: sim.numCourses }, (_, i) => i)}
                                  edges={sim.prerequisites}
                                  nodeStates={step.state}
                                />
                                <p className="text-xs text-default-400 mt-3 text-center font-mono">Unvisited · <span style={{ color: GOLD }}>●</span> Visiting · <span style={{ color: TEAL }}>●</span> Visited</p>
                              </div>

                              <div className="flex gap-2">
                                <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                                  onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                                <Button fullWidth color="primary" size="sm" isDisabled={si === sim.steps.length - 1}
                                  onPress={() => setSi(i => Math.min(sim.steps.length - 1, i + 1))}>Next →</Button>
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                    <div className="text-center py-6 rounded-lg" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-2">Cycle Detected?</p>
                      <p style={{ fontSize: 32, fontWeight: "bold", color: sim.hasCycle ? RED : TEAL }}>
                        {sim.hasCycle ? "✗ NO" : "✓ YES"}
                      </p>
                      <p className="text-xs text-default-400 mt-2">{sim.hasCycle ? "Courses cannot be finished" : "All courses can be finished"}</p>
                    </div>
                  </CardBody>
                </Card>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </Tab>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 3: CODE */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Tab key="code" title="Code">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Solution</p>
                <CodeBlock language="java">{`import java.util.List;
import java.util.ArrayList;

public class CourseSchedule {
  // 0 = unvisited, 1 = visiting (in current recursion path), 2 = visited
  private int[] state;

  // Adjacency list: adjList[i] contains all courses that depend on course i
  private List<List<Integer>> adjList;

  public boolean canFinish(int numCourses, int[][] prerequisites) {
    state = new int[numCourses];
    adjList = new ArrayList<>();

    for(int i = 0; i < numCourses; i++){
      adjList.add(new ArrayList<>());
    }

    // Build graph: for each prerequisite [a, b], a depends on b
    for(int[] pre: prerequisites){
      adjList.get(pre[1]).add(pre[0]);
    }

    // Check each course for cycles using DFS
    for(int i = 0; i < adjList.size(); i++){
      if(state[i] == 0 && hasCycle(i)){
        return false;
      }
    }
    return true;
  }

  public boolean hasCycle(int course){
    // Currently visiting: back edge detected!
    if(state[course] == 1){
      return true;
    }
    // Already visited: no cycle in subtree
    if(state[course] == 2){
      return false;
    }

    // Mark as visiting (in current recursion path)
    state[course] = 1;

    // Recursively check all dependent courses
    List<Integer> neighbours = adjList.get(course);
    for(Integer neighbour: neighbours){
      if(hasCycle(neighbour)){
        return true;
      }
    }

    // Mark as visited (all descendants checked)
    state[course] = 2;
    return false;
  }
}`}</CodeBlock>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "state = new int[numCourses]", exp: "Initialize state array. 0=unvisited, 1=visiting, 2=visited." },
                    { line: "for(int i = 0; i < numCourses; i++) adjList.add(...)", exp: "Create empty adjacency list for each course." },
                    { line: "adjList.get(pre[1]).add(pre[0])", exp: "Add edge: pre[0] depends on pre[1]." },
                    { line: "if(state[i] == 0 && hasCycle(i))", exp: "Only visit unvisited courses. If cycle found, return false." },
                    { line: "if(state[course] == 1) return true", exp: "Revisiting a node in current path = cycle (back edge)." },
                    { line: "state[course] = 1", exp: "Mark as visiting to detect back edges in recursion." },
                    { line: "if(hasCycle(neighbour)) return true", exp: "Recursively check all dependent courses." },
                    { line: "state[course] = 2", exp: "Mark as visited: all descendants checked, safe." },
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
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📍", color: TEAL, tip: "3-state coloring: 0 (white/unvisited), 1 (gray/visiting), 2 (black/visited). Revisiting state 1 = cycle." },
                    { icon: "⚠️", color: GOLD, tip: "Common mistake: forgetting to mark state[course] = 2 after DFS. This breaks cycle detection." },
                    { icon: "🔄", color: BLUE, tip: "Related: Topological Sort uses similar DFS. Detect cycle first; if none, topological order is valid." },
                    { icon: "💡", color: TEAL, tip: "For large graphs, BFS with in-degree (Kahn's algorithm) is iterative alternative to DFS." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                      <span className="text-base">{icon}</span>
                      <span className="text-sm text-default-500 leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}