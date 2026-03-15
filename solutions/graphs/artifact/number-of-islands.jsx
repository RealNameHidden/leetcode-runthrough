export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

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

function parseGrid(input) {
  const lines = input.trim().split('\n').filter(l => l.trim());
  return lines.map(line => line.trim().split('').filter(c => c === '0' || c === '1'));
}

function simulate(gridStr) {
  const grid = parseGrid(gridStr);
  if (grid.length === 0) return [];

  const steps = [];
  const visited = Array(grid.length).fill(null).map(() => Array(grid[0].length).fill(false));
  let islandCount = 0;

  function dfs(i, j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === '0' || visited[i][j]) return;
    visited[i][j] = true;
    steps.push({
      i, j,
      action: 'mark',
      visited: visited.map(r => [...r]),
      islands: islandCount,
      desc: `Mark (${i},${j}) as visited — part of island #${islandCount}`
    });
    dfs(i - 1, j);
    dfs(i + 1, j);
    dfs(i, j - 1);
    dfs(i, j + 1);
  }

  steps.push({
    action: 'start',
    visited: visited.map(r => [...r]),
    islands: 0,
    i: -1, j: -1,
    desc: 'Initialize: begin scanning grid from top-left'
  });

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      steps.push({
        i, j,
        action: 'check',
        visited: visited.map(r => [...r]),
        islands: islandCount,
        desc: `Check (${i},${j}): cell='${grid[i][j]}', visited=${visited[i][j]}`
      });

      if (grid[i][j] === '1' && !visited[i][j]) {
        islandCount++;
        steps.push({
          i, j,
          action: 'found_land',
          visited: visited.map(r => [...r]),
          islands: islandCount,
          desc: `Found unvisited land at (${i},${j}) → island #${islandCount}. Starting DFS...`
        });
        dfs(i, j);
        steps.push({
          action: 'dfs_done',
          visited: visited.map(r => [...r]),
          islands: islandCount,
          i, j,
          desc: `DFS complete for island #${islandCount}`
        });
      }
    }
  }

  steps.push({
    action: 'done',
    visited: visited.map(r => [...r]),
    islands: islandCount,
    i: -1, j: -1,
    desc: `Scan complete. Total islands: ${islandCount}`
  });

  return steps;
}

function GridViz({ grid, visited, currentI, currentJ }) {
  const CELL_SIZE = 32;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block p-2">
        {grid.map((row, i) => (
          <div key={i} className="flex gap-1 mb-1">
            {row.map((cell, j) => {
              const isWater = cell === '0';
              const isVis = visited?.[i]?.[j];
              const isCurrent = i === currentI && j === currentJ;
              let bg = isWater ? `${BLUE}33` : "var(--viz-surface)";
              if (isVis) bg = `${TEAL}44`;
              if (isCurrent) bg = GOLD + "cc";
              let border = isWater ? `1px solid ${BLUE}44` : `1px solid var(--viz-border)`;
              if (isVis) border = `1px solid ${TEAL}88`;
              if (isCurrent) border = `2px solid ${GOLD}`;
              return (
                <div key={`${i}-${j}`} className="flex items-center justify-center font-bold rounded text-xs transition-all"
                  style={{
                    width: CELL_SIZE, height: CELL_SIZE,
                    background: bg, border,
                    color: isCurrent ? "#0b0f0e" : isVis ? TEAL : isWater ? BLUE : "var(--viz-text)",
                    boxShadow: isCurrent ? `0 0 8px ${GOLD}88` : isVis ? `0 0 4px ${TEAL}44` : 'none'
                  }}>
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const PRESETS = [
  {
    label: "LC Example 1",
    val: `11110\n11010\n11000\n00000`
  },
  {
    label: "LC Example 2",
    val: `11000\n11000\n00100\n00011`
  },
  {
    label: "Single Island",
    val: `111\n101\n111`
  },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState(`11110\n11010\n11000\n00000`);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const grid = parseGrid(input);
  const finalStep = steps[steps.length - 1];

  const actionColor = step?.action === 'done' ? TEAL
    : step?.action === 'found_land' ? GOLD
    : step?.action === 'mark' ? TEAL
    : BLUE;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🗺️</span>
        <h1 className="font-semibold text-base">Number of Islands</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Graph · DFS</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an <code>m × n</code> 2D binary grid of <code>'1'</code> (land) and <code>'0'</code> (water),
                  return the number of islands. An island is surrounded by water and is formed by connecting
                  adjacent lands horizontally or vertically.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int numIslands(char[][] grid)", desc: "Count connected components of '1' cells. Constraints: 1 ≤ m, n ≤ 300; grid[i][j] is '0' or '1'" },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Two separate islands</p>
                <CodeBlock language="text">{`Input grid:
  1 1 0 0 0
  1 1 0 0 0
  0 0 1 0 0
  0 0 0 1 1

Step 1: Scan (0,0) → '1', unvisited → island #1
Step 2: DFS marks (0,0),(0,1),(1,0),(1,1) all as visited
Step 3: Scan continues... (2,2) → '1', unvisited → island #2
Step 4: DFS marks (2,2) as visited
Step 5: Scan continues... (3,3) → '1', unvisited → island #3
Step 6: DFS marks (3,3),(3,4) as visited

Output: 3`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Scan for Unvisited Land</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Iterate every cell. When we find an unvisited <code>'1'</code>, we've found a new island — increment count.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">O(m×n) outer scan</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>DFS Marks the Whole Island</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      From each new land cell, DFS floods all 4 directions, marking every connected cell as visited so they won't be counted again.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">One DFS = one island</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                <CodeBlock>{`int numIslands(char[][] grid) {
  int count = 0;
  for (int i = 0; i < grid.length; i++) {
    for (int j = 0; j < grid[0].length; j++) {
      if (grid[i][j] == '1') {
        count++;        // new island found
        dfs(i, j, grid);
      }
    }
  }
  return count;
}

void dfs(int i, int j, char[][] grid) {
  if (i < 0 || i >= grid.length ||
      j < 0 || j >= grid[0].length ||
      grid[i][j] != '1') return;

  grid[i][j] = '0'; // mark visited
  dfs(i-1,j,grid); dfs(i+1,j,grid);
  dfs(i,j-1,grid); dfs(i,j+1,grid);
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  The trick is mutating grid[i][j]='0' to mark visited — avoids a separate visited array. Each cell is visited at most once, so total work is O(m×n).
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(m×n)", s: "Visit each cell once" },
                    { l: "SPACE", v: "O(m×n)", s: "DFS recursion stack" }
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
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map(p => (
                    <Button key={p.label} size="sm"
                      variant={input === p.val ? "flat" : "bordered"}
                      color={input === p.val ? "primary" : "default"}
                      onPress={() => setInput(p.val)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <textarea
                  className="w-full p-2 rounded border text-xs font-mono"
                  style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", color: "var(--viz-text)" }}
                  rows="4"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Grid rows, no spaces (e.g. 11110)"
                />
              </CardBody></Card>

              {steps.length > 0 && grid.length > 0 && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>

                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-xs font-mono text-default-500"><strong style={{ color: TEAL }}>{si + 1}</strong> / {steps.length}</span>
                  </div>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    Action: <V color={actionColor}>{step?.action}</V> ·
                    Cell: <V color={TEAL}>{step?.i >= 0 ? `(${step.i},${step.j})` : '—'}</V> ·
                    Islands: <V color={GOLD}>{step?.islands ?? 0}</V>
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step?.action === 'check'}
                      annotation={step?.action === 'check' ? `cell='${step.i >= 0 && grid[step.i]?.[step.j]}', visited=${step?.visited?.[step.i]?.[step.j]}` : undefined}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>if (grid[i][j] == '1' &amp;&amp; !visited)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'found_land'}
                      annotation={step?.action === 'found_land' ? `count = ${step.islands}` : undefined}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}count++</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'found_land'}
                      annotation={step?.action === 'found_land' ? `dfs(${step.i}, ${step.j})` : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}dfs(i, j, grid)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'mark'}
                      annotation={step?.action === 'mark' ? `mark (${step.i},${step.j}) visited` : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"    "}grid[i][j] = '0'</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'mark'}
                      annotation={step?.action === 'mark' ? "explore 4 dirs" : undefined}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>{"    "}dfs(i±1,j); dfs(i,j±1)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'done'}
                      annotation={step?.action === 'done' ? `return ${step.islands}` : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>return count</span>
                    </CodeLine>
                  </div>

                  {/* Grid Viz */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">
                      <span style={{ color: GOLD }}>■</span> current &nbsp;
                      <span style={{ color: TEAL }}>■</span> visited &nbsp;
                      <span style={{ color: BLUE }}>■</span> water &nbsp;
                      <span style={{ color: "var(--viz-muted)" }}>■</span> unvisited land
                    </p>
                    <GridViz grid={grid} visited={step?.visited} currentI={step?.i} currentJ={step?.j} />
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 text-sm font-mono mb-4" style={{ borderLeft: `3px solid ${actionColor}`, background: "var(--viz-surface)" }}>
                    {step?.desc}
                  </div>

                  {/* Prev / Next */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <span className="text-xs self-center whitespace-nowrap">{si + 1} / {steps.length}</span>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State */}
              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                  <div className="rounded-xl p-6 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-2">Number of Islands</p>
                    <p className="text-5xl font-bold mb-2" style={{ color: TEAL }}>{finalStep.islands}</p>
                    <GridViz grid={grid} visited={finalStep.visited} currentI={-1} currentJ={-1} />
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          {/* CODE */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                <CodeBlock>{`class Solution {
  public int numIslands(char[][] grid) {
    if (grid == null || grid.length == 0) return 0;

    int count = 0;
    for (int i = 0; i < grid.length; i++) {
      for (int j = 0; j < grid[0].length; j++) {
        if (grid[i][j] == '1') {
          count++;          // new connected component
          dfs(grid, i, j); // mark all connected land
        }
      }
    }
    return count;
  }

  private void dfs(char[][] grid, int i, int j) {
    // Boundary + water check
    if (i < 0 || i >= grid.length ||
        j < 0 || j >= grid[0].length ||
        grid[i][j] != '1') return;

    grid[i][j] = '0'; // mark as visited (sink the land)

    // Explore all 4 directions
    dfs(grid, i - 1, j);
    dfs(grid, i + 1, j);
    dfs(grid, i, j - 1);
    dfs(grid, i, j + 1);
  }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (grid[i][j] == '1')", exp: "Only trigger DFS on unvisited land. Water ('0') and already-sunk cells are skipped." },
                    { line: "count++", exp: "Every time we find a new unvisited land cell from the outer scan, it's the start of a new island." },
                    { line: "dfs(grid, i, j)", exp: "Flood-fill the entire connected component, sinking all cells to '0' so they won't be counted again." },
                    { line: "if (...grid[i][j] != '1') return", exp: "Base case handles out-of-bounds, water, and already-visited cells in one check." },
                    { line: "grid[i][j] = '0'", exp: "Mutate the grid to mark visited — avoids a separate boolean[][] visited array. Safe since the problem doesn't need the original grid preserved." },
                    { line: "dfs(i±1,j) × 4", exp: "Recursively explore all 4-directional neighbors. This ensures the entire connected island is marked." },
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
                    { icon: "📍", color: TEAL, tip: "This is the classic \"count connected components\" pattern. The DFS/BFS floods one component per trigger." },
                    { icon: "⚠️", color: GOLD, tip: "Common mistake: forgetting to mark visited before recursing, causing infinite loops on cycles. Mark FIRST." },
                    { icon: "🔄", color: BLUE, tip: "Same pattern applies to: Max Area of Island, Pacific Atlantic Water Flow, Surrounded Regions, Clone Graph." },
                    { icon: "💡", color: TEAL, tip: "Can also solve with BFS (queue) or Union-Find. DFS is simplest for interview. Union-Find is best for dynamic connectivity." },
                    { icon: "🎯", color: GOLD, tip: "If you can't mutate the grid, use a boolean[][] visited array initialized to false. Same O(m×n) complexity." },
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
