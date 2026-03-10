export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";

// ── Colors (CLAUDE.md standard) ─────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";
const INF  = 2147483647;

// ── Reusable: V badge ────────────────────────────────────────────────
function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 5px", marginLeft: 2,
      borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 12,
    }}>
      {children}
    </span>
  );
}

// ── Reusable: CodeLine ───────────────────────────────────────────────
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

// ── Grid Cell ────────────────────────────────────────────────────────
function GridCell({ value, isProcessing, isUpdating, isQueued }) {
  const isWall     = value === -1;
  const isTreasure = value === 0;
  const isInf      = value === INF;

  let bg, border, textColor, label, glow;

  if (isWall) {
    bg = "rgba(80,80,90,0.55)"; border = "rgba(80,80,90,0.8)";
    textColor = "rgba(180,180,180,0.5)"; label = "▪";
  } else if (isTreasure) {
    bg = `${GOLD}22`; border = GOLD;
    textColor = GOLD; label = "💎";
    glow = `0 0 10px ${GOLD}88`;
  } else if (isInf) {
    bg = "var(--viz-surface)"; border = "var(--viz-border)";
    textColor = "var(--viz-muted)"; label = "∞";
  } else {
    const intensity = Math.min(value / 8, 1);
    bg = `rgba(78,204,163,${0.07 + intensity * 0.18})`;
    border = `rgba(78,204,163,${0.3 + intensity * 0.5})`;
    textColor = TEAL; label = String(value);
  }

  if (isProcessing) {
    border = TEAL; glow = `0 0 14px ${TEAL}aa`;
    bg = `${TEAL}22`;
  } else if (isUpdating) {
    border = GOLD; glow = `0 0 12px ${GOLD}aa`;
    bg = `${GOLD}18`;
  } else if (isQueued && isInf) {
    border = `${BLUE}99`; bg = `${BLUE}0d`;
  }

  return (
    <div style={{
      width: 48, height: 48, borderRadius: 8, flexShrink: 0,
      background: bg,
      border: `2px solid ${border}`,
      boxShadow: glow || "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: isInf ? 16 : isTreasure ? 20 : 14,
      fontWeight: 700, fontFamily: "monospace",
      color: textColor,
      transition: "all 0.2s ease",
      position: "relative",
    }}>
      {label}
      {isProcessing && (
        <div style={{
          position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
          fontSize: 8, fontWeight: 700, color: TEAL, background: `${TEAL}22`,
          padding: "1px 4px", borderRadius: 3, border: `1px solid ${TEAL}44`,
          whiteSpace: "nowrap",
        }}>
          PROC
        </div>
      )}
      {isUpdating && (
        <div style={{
          position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
          fontSize: 8, fontWeight: 700, color: GOLD, background: `${GOLD}22`,
          padding: "1px 4px", borderRadius: 3, border: `1px solid ${GOLD}44`,
          whiteSpace: "nowrap",
        }}>
          +{label}
        </div>
      )}
    </div>
  );
}

// ── Grid Visualization ───────────────────────────────────────────────
function GridViz({ grid, processing, updating, queued }) {
  if (!grid || grid.length === 0) return null;
  const procSet   = processing ? new Set([`${processing[0]},${processing[1]}`]) : new Set();
  const updateSet = new Set((updating || []).map(([r, c]) => `${r},${c}`));
  const queuedSet = new Set((queued  || []).map(([r, c]) => `${r},${c}`));

  return (
    <div style={{ overflowX: "auto", display: "flex", justifyContent: "center", padding: "8px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 6 }}>
            {row.map((val, c) => (
              <GridCell
                key={c}
                value={val}
                isProcessing={procSet.has(`${r},${c}`)}
                isUpdating={updateSet.has(`${r},${c}`)}
                isQueued={queuedSet.has(`${r},${c}`)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Simulation ───────────────────────────────────────────────────────
function simulate(grid) {
  const rows = grid.length, cols = grid[0].length;
  const g = grid.map(r => [...r]);
  const steps = [];

  // Seed BFS with all treasure chests
  const queue = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (g[r][c] === 0) queue.push([r, c]);

  const treasureCount = queue.length;
  steps.push({
    grid: g.map(r => [...r]),
    processing: null,
    updating: [],
    queuedCells: [...queue],
    desc: `Seed BFS: found ${treasureCount} treasure chest(s) → add all to queue at distance 0.`,
    phase: 'init',
    queueLen: queue.length,
  });

  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let head = 0;

  while (head < queue.length) {
    const [r, c] = queue[head++];
    const dist = g[r][c];
    const updating = [];

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc] === INF) {
        g[nr][nc] = dist + 1;
        queue.push([nr, nc]);
        updating.push([nr, nc]);
      }
    }

    const remaining = queue.slice(head);
    steps.push({
      grid: g.map(row => [...row]),
      processing: [r, c],
      updating,
      queuedCells: remaining,
      phase: 'bfs',
      dist,
      desc: updating.length > 0
        ? `Dequeue (${r},${c}) dist=${dist}. Spread to: ${updating.map(([r,c]) => `(${r},${c})→${dist+1}`).join(', ')}.`
        : `Dequeue (${r},${c}) dist=${dist}. No unvisited (INF) neighbors — skip.`,
      queueLen: remaining.length,
    });
  }

  steps.push({
    grid: g.map(r => [...r]),
    processing: null,
    updating: [],
    queuedCells: [],
    phase: 'done',
    desc: 'BFS complete! Every reachable room now holds its minimum distance to a treasure chest.',
    queueLen: 0,
  });

  return steps;
}

// ── Presets ──────────────────────────────────────────────────────────
const I = INF;
const PRESETS = [
  {
    label: "LC Example",
    grid: [
      [I, -1,  0,  I],
      [I,  I,  I, -1],
      [I, -1,  I, -1],
      [0, -1,  I,  I],
    ],
  },
  {
    label: "Two Chests",
    grid: [
      [I,  I,  I,  I,  I],
      [I, -1, -1, -1,  I],
      [I, -1,  0, -1,  I],
      [I, -1, -1, -1,  I],
      [I,  I,  I,  I,  0],
    ],
  },
  {
    label: "Open Field",
    grid: [
      [0,  I,  I,  I],
      [I,  I,  I,  I],
      [I,  I,  I,  I],
      [I,  I,  I,  0],
    ],
  },
  {
    label: "Walls Block",
    grid: [
      [I, -1,  I],
      [-1, -1, -1],
      [I, -1,  0],
    ],
  },
];

// ── Main Component ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState("Problem");
  const [presetIdx, setPresetIdx] = useState(0);
  const [steps, setSteps]     = useState([]);
  const [si, setSi]           = useState(0);

  useEffect(() => {
    setSteps(simulate(PRESETS[presetIdx].grid));
    setSi(0);
  }, [presetIdx]);

  const step     = steps[si] || null;
  const lastStep = steps[steps.length - 1] || null;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🏝️</span>
        <h1 className="font-semibold text-base">Islands and Treasure</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Multi-Source BFS · Grid</Chip>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined"
          color="primary"
          size="sm"
        >

          {/* ── PROBLEM TAB ─────────────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  You are given a <strong>m × n</strong> grid of integers. Each cell is one of three values:
                  <br /><br />
                  &nbsp;&nbsp;<strong style={{ color: RED }}>-1</strong> = Wall (impassable obstacle)<br />
                  &nbsp;&nbsp;<strong style={{ color: GOLD }}>0</strong> = Treasure chest<br />
                  &nbsp;&nbsp;<strong style={{ color: TEAL }}>INF</strong> (2147483647) = Empty room<br />
                  <br />
                  Fill each empty room with the <strong>distance to the nearest treasure chest</strong>.
                  If a room cannot reach any treasure, leave it as <strong>INF</strong>.
                </p>
                <div className="flex flex-col gap-2">
                  {[{
                    sig: "void islandsAndTreasure(int[][] grid)",
                    desc: "Modify grid in-place. Fill each INF cell with the shortest BFS distance to the nearest 0. Walls (-1) are impassable."
                  }].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">
                  Example — 4×4 grid
                </p>
                <CodeBlock language="text">{`Input (INF = ∞):
  ∞  -1   0   ∞
  ∞   ∞   ∞  -1
  ∞  -1   ∞  -1
  0  -1   ∞   ∞

Output (filled distances):
  3  -1   0   1
  2   2   1  -1
  1  -1   2  -1
  0  -1   3   4

Explanation:
  Bottom-left 0 → fills upward: (2,0)=1, (1,0)=2, (0,0)=3
  Top-right  0 → fills right:   (0,3)=1, (1,2)=1, (2,2)=2 ...
  (3,2) and (3,3) can only be reached from top-right chest.`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">
                  Why not BFS from every empty room?
                </p>
                <CodeBlock language="text">{`Naive approach: BFS from each INF cell to find nearest 0
  → O((m·n)²) — too slow for large grids

Multi-source BFS (the trick):
  → Start from ALL 0s simultaneously
  → BFS ripples outward; first visit = shortest path
  → O(m·n) — every cell visited exactly once

Key reversal: instead of "room → nearest chest"
              flip to  "chest → nearest rooms"
              Both give same distances, but the flip
              allows one unified BFS pass.`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* ── INTUITION TAB ───────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>🌊 Multi-Source BFS</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Seed the BFS queue with <strong>all treasure chests at once</strong>. They all start at distance 0 and expand outward in lockstep — like simultaneous ripples in water.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">queue ← all cells where grid[r][c] == 0</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>✅ INF as Visited Flag</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Only update cells still holding <strong>INF</strong>. Once a cell is updated to a distance, BFS will never reach it again — so INF doubles as the visited check.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">if (grid[nr][nc] == INF) → update &amp; enqueue</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`// 1. Seed queue with ALL sources (treasures at dist=0)
for each cell (i,j) in grid:
  if grid[i][j] == 0: queue.offer([i, j])

// 2. BFS — expand wave by wave
while queue not empty:
  curr = queue.poll()
  r = curr[0], c = curr[1]
  directions = [[-1,0],[1,0],[0,1],[0,-1]]  // inline
  for [dr,dc] in directions:
    nr = r+dr, nc = c+dc
    if in-bounds AND grid[nr][nc] == INF:
      grid[nr][nc] = grid[r][c] + 1  // set distance
      queue.offer([nr, nc])           // mark visited`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  No separate <code>visited[][]</code> array needed! The act of writing a distance into a cell (replacing INF) <em>is</em> the visited check. Walls (-1) are automatically skipped since -1 ≠ INF.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(m · n)", s: "Every cell enqueued and dequeued at most once" },
                    { l: "SPACE", v: "O(m · n)", s: "BFS queue can hold up to all cells in the grid" },
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

          {/* ── VISUALIZER TAB ──────────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map((p, i) => (
                    <Button key={p.label} size="sm"
                      variant={presetIdx === i ? "flat" : "bordered"}
                      color={presetIdx === i ? "primary" : "default"}
                      onPress={() => setPresetIdx(i)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 flex-wrap text-xs text-default-500">
                  {[
                    { color: GOLD, symbol: "💎", label: "Treasure (0)" },
                    { color: "rgba(80,80,90,0.8)", symbol: "▪", label: "Wall (-1)" },
                    { color: "var(--viz-muted)", symbol: "∞", label: "Unvisited (INF)" },
                    { color: TEAL, symbol: "n", label: "Filled distance" },
                  ].map(({ color, symbol, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color, fontWeight: 700 }}>{symbol}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              {/* Step debugger */}
              {steps.length > 0 && step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step BFS</p>

                  {/* Step pills */}
                  <div className="flex gap-1.5 mb-4 flex-wrap" style={{ maxHeight: 88, overflowY: "auto" }}>
                    {steps.map((s, i) => (
                      <button key={i} onClick={() => setSi(i)}
                        style={{
                          background: i === si ? TEAL : "var(--viz-surface)",
                          border: `1px solid ${i === si ? TEAL : "var(--viz-border)"}`,
                          color: i === si ? "#0b0f0e" : undefined,
                        }}
                        className="px-2.5 py-1 rounded text-xs cursor-pointer font-mono font-bold transition-all">
                        #{i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4 font-mono">
                    {step.phase === 'init' && <>Phase: <V color={TEAL}>Seeding</V> · Treasures found: <V color={GOLD}>{step.queuedCells.length}</V></>}
                    {step.phase === 'bfs' && (
                      <>
                        Dequeue: <V color={TEAL}>({step.processing?.[0]},{step.processing?.[1]})</V> ·
                        dist: <V color={GOLD}>{step.dist}</V> ·
                        neighbors updated: <V color={BLUE}>{step.updating.length}</V> ·
                        queue remaining: <V color={TEAL}>{step.queueLen}</V>
                      </>
                    )}
                    {step.phase === 'done' && <><V color={TEAL}>✓ Done</V> — all reachable rooms filled</>}
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'init'}
                      annotation={step.phase === 'init' ? `${step.queuedCells.length} chest(s) enqueued` : "seed all 0s"}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>if (grid[r][c] == 0) queue.offer([r,c])</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'bfs'}
                      annotation={step.phase === 'bfs' ? `dequeue (${step.processing?.[0]},${step.processing?.[1]}) dist=${step.dist}` : "poll next cell"}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>int[] cell = queue.poll()</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.updating?.length > 0}
                      annotation={step.updating?.length > 0 ? `set ${step.updating.length} neighbor(s) = ${(step.dist ?? 0) + 1}` : "check neighbors"}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>if (grid[nr][nc] == INF) grid[nr][nc] = dist + 1</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'done'}
                      annotation={step.phase === 'done' ? "queue empty → done" : "loop while queue not empty"}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"// while (!queue.isEmpty())"}</span>
                    </CodeLine>
                  </div>

                  {/* Grid visualization */}
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <div className="flex gap-4 justify-center mb-2 text-[10px] font-mono flex-wrap">
                      {step.processing && (
                        <span style={{ color: TEAL }}>■ Processing: ({step.processing[0]},{step.processing[1]})</span>
                      )}
                      {step.updating?.length > 0 && (
                        <span style={{ color: GOLD }}>■ Updating: {step.updating.map(([r,c]) => `(${r},${c})`).join(' ')}</span>
                      )}
                      {step.queuedCells?.length > 0 && (
                        <span style={{ color: BLUE }}>■ In queue: {step.queueLen}</span>
                      )}
                    </div>
                    <GridViz
                      grid={step.grid}
                      processing={step.processing}
                      updating={step.updating}
                      queued={step.queuedCells}
                    />
                  </div>

                  {/* Step description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step.phase === 'done' ? TEAL : step.phase === 'init' ? GOLD : BLUE}` }}>
                    {step.desc}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final state */}
              {lastStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Grid</p>
                  <div className="rounded-xl p-4 text-center"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">
                      Every reachable room filled · INF (∞) rooms have no path to a chest
                    </p>
                    <GridViz grid={lastStep.grid} processing={null} updating={[]} queued={[]} />
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* ── CODE TAB ────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.LinkedList;
import java.util.Queue;

class IslandsAndTreasure {
    public void islandsAndTreasure(int[][] grid) {
        Queue<int[]> queue = new LinkedList<>();
        int rows = grid.length;
        int col = grid[0].length;

        // 1. Multi-source: seed BFS with ALL treasure chests
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < col; j++) {
                if (grid[i][j] == 0) queue.offer(new int[]{i, j});
            }
        }

        // 2. BFS outward — first visit = shortest distance
        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int r = curr[0];
            int c = curr[1];

            int[][] directions = {
                {-1, 0},
                { 1, 0},
                { 0, 1},
                { 0,-1}
            };

            for (int[] dir : directions) {
                int nr = r + dir[0];
                int nc = c + dir[1];
                // INF check = "unvisited room" (walls are -1, not INF)
                if (nr >= 0 && nr < rows && nc >= 0 && nc < col
                        && grid[nr][nc] == Integer.MAX_VALUE) {
                    grid[nr][nc] = grid[r][c] + 1;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
        // grid is modified in-place; unreachable rooms stay INF
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    {
                      line: "if (grid[i][j] == 0) queue.offer(new int[]{i,j})",
                      exp: "Multi-source seed: all treasure chests start at distance 0. By adding ALL of them before BFS begins, they expand in perfect lockstep — no chest gets a head start.",
                    },
                    {
                      line: "int[] curr = queue.poll()\nint r = curr[0]; int c = curr[1]",
                      exp: "Dequeue the next cell and unpack its row/col. The cell's current value (grid[r][c]) already holds its distance from the nearest chest.",
                    },
                    {
                      line: "int[][] directions = {{-1,0},{1,0},{0,1},{0,-1}}",
                      exp: "4-directional movement defined inline per cell. Up/down/left/right — diagonals are not allowed in this grid problem.",
                    },
                    {
                      line: "grid[nr][nc] == Integer.MAX_VALUE",
                      exp: "This single check does double duty: (1) skips walls (they're -1, not INF), (2) skips already-filled rooms (they're 0..n). No separate visited[][] needed.",
                    },
                    {
                      line: "grid[nr][nc] = grid[r][c] + 1",
                      exp: "Distance propagates: parent's distance + 1. Because BFS processes level-by-level, the first time a cell is reached is always via the shortest path.",
                    },
                    {
                      line: "queue.offer(new int[]{nr, nc})",
                      exp: "Enqueue the newly-filled room so its neighbors get processed next. The cell won't be enqueued again because it's no longer INF.",
                    },
                  ].map(({ line, exp }) => (
                    <div key={line} className="py-3 flex gap-3 items-start">
                      <code className="text-[11px] px-2 py-1 rounded min-w-0 font-mono whitespace-pre-wrap break-all"
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
                    { icon: "📍", color: TEAL,  tip: "Multi-source BFS = enqueue ALL sources before starting the loop. The simultaneous expansion guarantees every cell gets the distance to its nearest source." },
                    { icon: "⚠️", color: GOLD,  tip: "Use INF as the visited flag. You never need a separate boolean[][] — any non-INF value means 'already processed'. Walls (-1) are automatically skipped." },
                    { icon: "🔄", color: BLUE,  tip: "Identical pattern: 01-Matrix (nearest 0), Rotting Oranges (multi-source time spread), Pacific Atlantic Waterflow (reverse flow), Nearest Exit from Maze." },
                    { icon: "💡", color: TEAL,  tip: "The 'reverse the search' trick: instead of asking each room 'where's the nearest chest?', ask each chest 'which rooms are nearest to me?' Both give identical answers, but the second is O(m·n) not O((m·n)²)." },
                    { icon: "🎯", color: RED,   tip: "Common mistake: starting BFS from INF cells instead of 0s. That gives O((m·n)²). Always seed from the destination, not the source, when there are multiple destinations." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
                      <span className="text-base flex-shrink-0">{icon}</span>
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
