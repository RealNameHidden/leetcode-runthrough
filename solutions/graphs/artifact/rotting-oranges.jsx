export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

// ── Colors (CLAUDE.md standard) ─────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

// ── V badge ──────────────────────────────────────────────────────────
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

// ── CodeLine ─────────────────────────────────────────────────────────
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
function GridCell({ value, isProcessing, isRotting, minute }) {
  // value: 0=empty, 1=fresh, >=2=rotten (2+elapsed minutes)
  const isEmpty  = value === 0;
  const isFresh  = value === 1;
  const isRotten = value >= 2;
  const elapsedMin = isRotten ? value - 2 : 0;

  let bg, border, textColor, label, glow;

  if (isEmpty) {
    bg = "transparent"; border = "var(--viz-border)";
    textColor = "var(--viz-muted)"; label = "";
  } else if (isFresh) {
    bg = `rgba(78,204,163,0.10)`; border = `${TEAL}55`;
    textColor = TEAL; label = "🍊";
  } else {
    // rotten: shade by how recently it rotted
    const age = elapsedMin;
    const intensity = Math.min(age / 6, 1);
    bg = `rgba(255,107,107,${0.08 + intensity * 0.18})`;
    border = `rgba(255,107,107,${0.35 + intensity * 0.5})`;
    textColor = RED; label = "🤢";
    if (elapsedMin === 0) { label = "💀"; } // original rotten
  }

  if (isProcessing) {
    border = RED; glow = `0 0 14px ${RED}99`;
    bg = `${RED}22`;
  } else if (isRotting) {
    border = GOLD; glow = `0 0 12px ${GOLD}aa`;
    bg = `${GOLD}18`;
  }

  return (
    <div style={{
      width: 48, height: 48, borderRadius: 8, flexShrink: 0,
      background: bg,
      border: `2px solid ${border}`,
      boxShadow: glow || "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 1,
      transition: "all 0.2s ease",
      position: "relative",
    }}>
      <span style={{ fontSize: isRotten || isFresh ? 18 : 12 }}>{label}</span>
      {isRotten && elapsedMin > 0 && (
        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: RED, lineHeight: 1 }}>
          t={elapsedMin}
        </span>
      )}
      {isProcessing && (
        <div style={{
          position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)",
          fontSize: 8, fontWeight: 700, color: RED, background: `${RED}22`,
          padding: "1px 4px", borderRadius: 3, border: `1px solid ${RED}44`,
          whiteSpace: "nowrap",
        }}>PROC</div>
      )}
      {isRotting && (
        <div style={{
          position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)",
          fontSize: 8, fontWeight: 700, color: GOLD, background: `${GOLD}22`,
          padding: "1px 4px", borderRadius: 3, border: `1px solid ${GOLD}44`,
          whiteSpace: "nowrap",
        }}>ROT!</div>
      )}
    </div>
  );
}

function GridViz({ grid, processing, rotting }) {
  if (!grid || grid.length === 0) return null;
  const procSet   = new Set((processing ? [[...processing]] : []).map(([r,c]) => `${r},${c}`));
  const rottingSet = new Set((rotting || []).map(([r,c]) => `${r},${c}`));

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
                isRotting={rottingSet.has(`${r},${c}`)}
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

  const queue = [];
  let freshCount = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (g[r][c] === 2) queue.push([r, c]);
      if (g[r][c] === 1) freshCount++;
    }

  steps.push({
    grid: g.map(r => [...r]),
    processing: null, rotting: [],
    freshCount,
    minute: 0,
    phase: 'init',
    queueLen: queue.length,
    desc: `Seed: found ${queue.length} rotten orange(s) and ${freshCount} fresh orange(s). Enqueue all rotten at t=0.`,
  });

  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let head = 0;
  let currentFresh = freshCount;

  while (head < queue.length) {
    const [r, c] = queue[head++];
    const minute = g[r][c] - 2; // stored as 2+elapsed
    const rotting = [];

    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc] === 1) {
        g[nr][nc] = g[r][c] + 1;
        queue.push([nr, nc]);
        rotting.push([nr, nc]);
        currentFresh--;
      }
    }

    steps.push({
      grid: g.map(row => [...row]),
      processing: [r, c],
      rotting,
      freshCount: currentFresh,
      minute,
      phase: 'bfs',
      queueLen: queue.length - head,
      desc: rotting.length > 0
        ? `t=${minute}: Dequeue (${r},${c}). Rot spreads to: ${rotting.map(([r,c])=>`(${r},${c})`).join(', ')} → now t=${minute+1}.`
        : `t=${minute}: Dequeue (${r},${c}). No adjacent fresh oranges to infect.`,
    });
  }

  // Compute answer
  let maxMinute = 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (g[r][c] > 2) maxMinute = Math.max(maxMinute, g[r][c] - 2);

  const answer = currentFresh === 0 ? maxMinute : -1;

  steps.push({
    grid: g.map(r => [...r]),
    processing: null, rotting: [],
    freshCount: currentFresh,
    minute: maxMinute,
    answer,
    phase: 'done',
    queueLen: 0,
    desc: currentFresh === 0
      ? `All oranges rotted! Maximum time = ${maxMinute} minute(s).`
      : `${currentFresh} fresh orange(s) unreachable. Return -1.`,
  });

  return steps;
}

// ── Presets ──────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: "LC Example 1",
    grid: [[2,1,1],[1,1,0],[0,1,1]],
  },
  {
    label: "LC Example 2",
    grid: [[2,1,1],[0,1,1],[1,0,1]],
  },
  {
    label: "All Already Rotten",
    grid: [[0,2]],
  },
  {
    label: "Two Sources",
    grid: [
      [1,1,1,1,1],
      [1,1,1,1,1],
      [1,1,2,1,1],
      [1,1,1,1,1],
      [2,1,1,1,1],
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

  const step     = steps[si]              || null;
  const lastStep = steps[steps.length-1] || null;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🍊</span>
        <h1 className="font-semibold text-base">Rotting Oranges</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Multi-Source BFS · Grid</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined" color="primary" size="sm"
        >

          {/* ── PROBLEM ─────────────────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  You are given an <strong>m × n</strong> grid. Each cell contains one of three values:
                  <br /><br />
                  &nbsp;&nbsp;<strong style={{ color: "var(--viz-muted)" }}>0</strong> = Empty cell<br />
                  &nbsp;&nbsp;<strong style={{ color: TEAL }}>1</strong> = Fresh orange 🍊<br />
                  &nbsp;&nbsp;<strong style={{ color: RED }}>2</strong> = Rotten orange 🤢<br />
                  <br />
                  Every minute, a rotten orange infects all <strong>4-directionally adjacent</strong> fresh oranges.
                  Return the <strong>minimum number of minutes</strong> before no fresh oranges remain.
                  If it's impossible, return <strong>-1</strong>.
                </p>
                <div className="flex flex-col gap-2">
                  {[{
                    sig: "int orangesRotting(int[][] grid)",
                    desc: "Return minimum minutes for all fresh oranges to rot, or -1 if unreachable fresh oranges exist.",
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
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 1 — grid = [[2,1,1],[1,1,0],[0,1,1]]</p>
                <CodeBlock language="text">{`Initial:        Minute 1:       Minute 2:       Minute 3:       Minute 4:
  2  1  1          2  2  1          2  2  2          2  2  2          2  2  2
  1  1  0          2  1  0          2  2  0          2  2  0          2  2  0
  0  1  1          0  1  1          0  1  1          0  2  1          0  2  2

Answer = 4

Spread pattern: the rot radiates outward from (0,0).
The bottom-right corner (2,2) is last to be reached.`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — Impossible Case: [[2,1,1],[0,1,1],[1,0,1]]</p>
                <CodeBlock language="text">{`Initial:
  2  1  1
  0  1  1
  1  0  1

The fresh orange at (2,0) is surrounded by empty cells (0s).
Rot can never reach it → answer = -1

Key check: count fresh oranges before BFS,
           decrement as each one rots.
           If freshCount > 0 after BFS → return -1.`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* ── INTUITION ───────────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${RED}0a`, borderColor: `${RED}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: RED }}>🌊 Multi-Source BFS = Simultaneous Spread</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      All rotten oranges infect neighbors at the same time each minute. Model this by seeding BFS with <strong>all rotten oranges simultaneously</strong> — they all start at minute 0.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">queue ← all cells where grid[r][c] == 2</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>⏱️ Level Batching = 1 Minute</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Snapshot <strong>size = queue.size()</strong> before each wave, then process exactly that many oranges. After the inner loop, one full minute has elapsed — increment <strong>minutes++</strong> once per wave, not once per cell.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">minutes++ once per BFS level, not per poll()</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`// 1. Count fresh, seed all rotten into queue
for each cell: if fresh → freshOranges++; if rotten → queue

// 2. Early exit — nothing to rot
if freshOranges == 0: return 0

// 3. Multi-source BFS — process one full level per minute
int minutes = 0
while queue not empty AND freshOranges > 0:
  minutes++
  int size = queue.size()          // snapshot current level
  for p in 0..size:
    [r, c] = queue.poll()
    for each 4-neighbor [nr, nc]:
      if grid[nr][nc] == 1:        // fresh only
        grid[nr][nc] = 2           // mark rotten
        freshOranges--
        queue.offer([nr, nc])

// 4. Check completeness
return freshOranges == 0 ? minutes : -1`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Snapshot <code>size = queue.size()</code> before the inner loop. This ensures only oranges that were already rotten at the <em>start</em> of the minute spread — newly-queued neighbors are deferred to the next level, so <code>minutes++</code> fires exactly once per BFS layer.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME",  v: "O(m · n)", s: "Each cell enqueued and dequeued at most once" },
                    { l: "SPACE", v: "O(m · n)", s: "BFS queue holds at most all cells" },
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

          {/* ── VISUALIZER ──────────────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {PRESETS.map((p, i) => (
                    <Button key={p.label} size="sm"
                      variant={presetIdx === i ? "flat" : "bordered"}
                      color={presetIdx === i ? "primary" : "default"}
                      onPress={() => setPresetIdx(i)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 flex-wrap text-xs text-default-500">
                  {[
                    { color: RED,    emoji: "💀", label: "Original rotten (t=0)" },
                    { color: RED,    emoji: "🤢", label: "Newly rotten (t=n)" },
                    { color: TEAL,   emoji: "🍊", label: "Fresh orange" },
                    { color: "var(--viz-muted)", emoji: "□", label: "Empty cell" },
                  ].map(({ color, emoji, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span>{emoji}</span>
                      <span style={{ color }}>{label}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              {/* Debugger */}
              {steps.length > 0 && step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step BFS</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4 font-mono">
                    {step.phase === 'init' && (
                      <>Phase: <V color={RED}>Seeding</V> · Rotten: <V color={RED}>{step.queueLen}</V> · Fresh: <V color={TEAL}>{step.freshCount}</V></>
                    )}
                    {step.phase === 'bfs' && (
                      <>
                        Minute: <V color={GOLD}>{step.minute}</V> ·
                        Dequeue: <V color={RED}>({step.processing?.[0]},{step.processing?.[1]})</V> ·
                        Infected: <V color={RED}>{step.rotting.length}</V> ·
                        Remaining fresh: <V color={TEAL}>{step.freshCount}</V>
                      </>
                    )}
                    {step.phase === 'done' && (
                      <>Result: <V color={step.answer === -1 ? RED : TEAL}>{step.answer === -1 ? "IMPOSSIBLE (-1)" : `${step.answer} minute(s)`}</V></>
                    )}
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'init'}
                      annotation={step.phase === 'init' ? `${step.queueLen} rotten orange(s) enqueued` : "seed all rotten"}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>if (grid[r][c] == 2) queue.offer([r,c])</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'bfs'}
                      annotation={step.phase === 'bfs' ? `dequeue (${step.processing?.[0]},${step.processing?.[1]}) t=${step.minute}` : "poll next rotten orange"}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>int[] cell = queue.poll()</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.rotting?.length > 0}
                      annotation={step.rotting?.length > 0 ? `set ${step.rotting.length} neighbor(s) = ${(step.minute) + 2 + 1} (t=${step.minute + 1})` : "check fresh neighbors"}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>if (grid[nr][nc] == 1) grid[nr][nc] = grid[r][c] + 1</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'done'}
                      annotation={step.phase === 'done'
                        ? (step.answer === -1 ? `freshCount=${step.freshCount} → -1` : `answer = ${step.answer}`)
                        : "check isolation"}
                      annotationColor={step.answer === -1 ? RED : TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>return freshCount == 0 ? maxMinutes : -1</span>
                    </CodeLine>
                  </div>

                  {/* Grid */}
                  <div className="rounded-xl p-4 mb-4"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <div className="flex gap-4 justify-center mb-2 text-[10px] font-mono flex-wrap">
                      {step.processing && (
                        <span style={{ color: RED }}>■ Processing: ({step.processing[0]},{step.processing[1]})</span>
                      )}
                      {step.rotting?.length > 0 && (
                        <span style={{ color: GOLD }}>■ Rotting now: {step.rotting.map(([r,c]) => `(${r},${c})`).join(' ')}</span>
                      )}
                      <span style={{ color: TEAL }}>🍊 Fresh left: {step.freshCount}</span>
                    </div>
                    <GridViz
                      grid={step.grid}
                      processing={step.processing}
                      rotting={step.rotting}
                    />
                  </div>

                  {/* Description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step.phase === 'done' ? (step.answer === -1 ? RED : TEAL) : step.phase === 'init' ? GOLD : RED}` }}>
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

              {/* Final */}
              {lastStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final State</p>
                  <div className="rounded-xl p-6 text-center mb-4"
                    style={{
                      background: lastStep.answer === -1 ? `${RED}0d` : `${TEAL}0d`,
                      border: `1px solid ${lastStep.answer === -1 ? RED : TEAL}33`,
                    }}>
                    <p className="text-xs text-default-500 mb-2">
                      {lastStep.answer === -1 ? "Impossible — isolated fresh oranges remain" : "All oranges rotted!"}
                    </p>
                    <p className="text-4xl font-bold" style={{ color: lastStep.answer === -1 ? RED : TEAL }}>
                      {lastStep.answer === -1 ? "-1" : `${lastStep.answer} min`}
                    </p>
                  </div>
                  <div className="rounded-xl p-4"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Final grid — numbers show minute each orange rotted</p>
                    <GridViz grid={lastStep.grid} processing={null} rotting={[]} />
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* ── CODE ────────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.LinkedList;
import java.util.Queue;

public class RottenOranges {
    public int orangesRotting(int[][] grid) {

        Queue<int[]> queue = new LinkedList<>();
        int freshOranges = 0;
        int rows = grid.length, col = grid[0].length;

        // 1. Seed all rotten oranges; count fresh ones
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < col; j++) {
                if (grid[i][j] == 1) freshOranges++;
                else if (grid[i][j] == 2) queue.offer(new int[]{i, j});
            }
        }

        // 2. Early exit: no fresh oranges to rot
        if (freshOranges == 0) {
            return 0;
        }

        // 3. Multi-source BFS — process one full level (= 1 minute) per iteration
        int minutes = 0;
        while (!queue.isEmpty() && freshOranges > 0) {
            minutes++;
            int size = queue.size();          // snapshot current level size
            for (int p = 0; p < size; p++) {
                int[] curr = queue.poll();
                int r = curr[0], c = curr[1];
                int[][] directions = {
                    {r+1, c}, {r-1, c}, {r, c+1}, {r, c-1}
                };
                for (int[] direction : directions) {
                    int nr = direction[0], nc = direction[1];
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < col
                            && grid[nr][nc] == 1) {
                        grid[nr][nc] = 2;     // mark as rotten
                        freshOranges--;
                        queue.offer(new int[]{nr, nc});
                    }
                }
            }
        }

        // freshOranges > 0 means isolated oranges remain
        return (freshOranges == 0) ? minutes : -1;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    {
                      line: "if (grid[i][j] == 1) freshOranges++\nelse if (grid[i][j] == 2) queue.offer(...)",
                      exp: "Two jobs in one pass: count fresh oranges so we can detect isolation at the end, and seed all rotten oranges as BFS sources at minute 0.",
                    },
                    {
                      line: "if (freshOranges == 0) return 0",
                      exp: "Early exit: if the grid has no fresh oranges at all, there is nothing to rot — answer is always 0 regardless of rotten orange count.",
                    },
                    {
                      line: "int size = queue.size()",
                      exp: "Snapshot the current queue size before processing. This batches all oranges at the same BFS level so we can increment minutes exactly once per level (= 1 minute).",
                    },
                    {
                      line: "for (int p = 0; p < size; p++)",
                      exp: "Process only the oranges that were rotten at the START of this minute. Newly-queued neighbors belong to the next level and must not be processed in this round.",
                    },
                    {
                      line: "grid[nr][nc] == 1",
                      exp: "Only infect fresh (1) cells. Skips empty (0) and already-rotten (2) cells — no separate visited array needed because marking as 2 prevents re-infection.",
                    },
                    {
                      line: "grid[nr][nc] = 2; freshOranges--",
                      exp: "Mark the neighbor as rotten and decrement the fresh counter. Using a flat counter is simpler than re-scanning the grid at the end.",
                    },
                    {
                      line: "return (freshOranges == 0) ? minutes : -1",
                      exp: "If all fresh oranges were infected (counter reached 0), return the elapsed minutes. Otherwise some were unreachable — return -1.",
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
                    { icon: "📍", color: TEAL, tip: "Multi-source BFS: enqueue ALL rotten oranges before the loop. They expand in perfect lockstep, which correctly models simultaneous spread." },
                    { icon: "⚠️", color: GOLD, tip: "Always count fresh oranges BEFORE BFS and decrement as they rot. The final freshCount check is the only way to detect unreachable oranges." },
                    { icon: "🔄", color: BLUE, tip: "Store time directly in the grid cell (value = 2 + minutes_elapsed). Checking grid[nr][nc] == 1 doubles as both a 'fresh' check and a 'not yet visited' check." },
                    { icon: "💡", color: TEAL, tip: "Relation to Islands & Treasure: nearly identical template. Difference: here we track time (levels) and must detect -1. Swap '0' for '2' and 'INF' for '1'." },
                    { icon: "🎯", color: RED, tip: "Common mistake: forgetting that rotten oranges start at value 2. If you initialize BFS with value 0 instead, your time calculation is off by 2. Stay consistent." },
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
