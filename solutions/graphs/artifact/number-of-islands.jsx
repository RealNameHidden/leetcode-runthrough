export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";

const ACCENT = "#06b6d4";
const GOLD = "#fbbf24";
const GREEN = "#10b981";
const RED = "#ef4444";
const LAND = "#1f2937";
const VISITED = "#9333ea";

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

  function dfs(i, j, dfsSteps) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === '0' || visited[i][j]) return;
    visited[i][j] = true;
    dfsSteps.push({
      i, j,
      action: 'mark',
      visited: visited.map(r => [...r]),
      desc: `Mark (${i},${j}) as visited`
    });
    dfs(i - 1, j, dfsSteps);
    dfs(i + 1, j, dfsSteps);
    dfs(i, j - 1, dfsSteps);
    dfs(i, j + 1, dfsSteps);
  }

  steps.push({
    action: 'start',
    visited: visited.map(r => [...r]),
    islands: 0,
    desc: 'Initialize grid'
  });

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === '1' && !visited[i][j]) {
        islandCount++;
        steps.push({
          i, j,
          action: 'start_dfs',
          visited: visited.map(r => [...r]),
          islands: islandCount,
          desc: `Found land at (${i},${j}), island #${islandCount}. Starting DFS...`
        });
        const dfsSteps = [];
        dfs(i, j, dfsSteps);
        steps.push(...dfsSteps);
        steps.push({
          action: 'dfs_done',
          visited: visited.map(r => [...r]),
          islands: islandCount,
          desc: `DFS complete for island #${islandCount}`
        });
      }
    }
  }

  steps.push({
    action: 'done',
    visited: visited.map(r => [...r]),
    islands: islandCount,
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
          <div key={i} className="flex gap-1">
            {row.map((cell, j) => {
              const isWater = cell === '0';
              const isVis = visited?.[i]?.[j];
              const isCurrent = i === currentI && j === currentJ;
              let bg = isWater ? ACCENT : LAND;
              if (isVis) bg = VISITED;
              if (isCurrent) bg = GOLD;
              return (
                <div key={`${i}-${j}`} className="flex items-center justify-center font-bold rounded text-xs transition-all"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: bg,
                    color: isWater ? 'var(--viz-text)' : 'white',
                    border: isCurrent ? `2px solid ${GOLD}` : '1px solid rgba(0,0,0,0.1)',
                    boxShadow: isCurrent ? `0 0 8px ${GOLD}88` : 'none'
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
    val: `1 1 1 1 0
1 1 0 1 0
1 1 0 0 0
0 0 0 0 0`
  },
  {
    label: "LC Example 2",
    val: `1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1`
  },
];

export default function App() {
  const [tab, setTab] = useState("Visualizer");
  const [input, setInput] = useState(`1 1 1 1 0
1 1 0 1 0
1 1 0 0 0
0 0 0 0 0`);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const grid = parseGrid(input);
  const stepColor = step?.action === 'done' ? GREEN : step?.action === 'start_dfs' ? GOLD : ACCENT;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🗺️</span>
        <h1 className="font-semibold text-base">Number of Islands</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Graph · DFS</Chip>
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

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${ACCENT}0d`, borderColor: `${ACCENT}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: ACCENT }}>Scan the Grid</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Look for unvisited land cells ('1'). When found, increment island count.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">O(rows × cols) scan</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>DFS to Mark</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        For each land cell, DFS to mark all connected land as visited.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">All connected cells = 1 island</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                  <CodeBlock>{`int numIslands(char[][] grid) {
  if (grid == null) return 0;

  int count = 0;
  for (int i = 0; i < grid.length; i++) {
    for (int j = 0; j < grid[0].length; j++) {
      if (grid[i][j] == '1') {
        count++;  // Found new island
        dfs(i, j, grid);  // Mark all connected land
      }
    }
  }
  return count;
}

void dfs(int i, int j, char[][] grid) {
  if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length
      || grid[i][j] == '0') return;

  grid[i][j] = '0';  // Mark as visited

  // Explore 4 directions
  dfs(i - 1, j, grid);
  dfs(i + 1, j, grid);
  dfs(i, j - 1, grid);
  dfs(i, j + 1, grid);
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">💡 Key insight: </span>
                    When we find a land cell, DFS marks all connected land as visited in one pass. This connected component = 1 island.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(m×n)", s: "Visit each cell once" },
                      { l: "SPACE", v: "O(m×n)", s: "DFS recursion stack" }
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-1">{l}</p>
                        <p className="font-bold text-base" style={{ color: ACCENT }}>{v}</p>
                        <p className="text-xs text-default-400 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* VISUALIZER */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map(p => (
                      <Button key={p.label} size="sm" variant={input === p.val ? "flat" : "bordered"} color={input === p.val ? "primary" : "default"} onPress={() => setInput(p.val)}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <textarea className="w-full p-2 rounded border border-divider bg-content2 text-xs font-mono" rows="4" value={input} onChange={e => setInput(e.target.value)} placeholder="Grid (space-separated, newline rows)" />
                </CardBody>
              </Card>

              {steps.length > 0 && grid.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Grid Visualization</p>
                    <GridViz grid={grid} visited={step?.visited} currentI={step?.i} currentJ={step?.j} />

                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                      <div className="rounded-lg p-4 text-center" style={{ background: `${ACCENT}0d`, border: `1px solid ${ACCENT}33` }}>
                        <p className="text-xs text-default-500 mb-2">Islands Found</p>
                        <p className="text-2xl font-bold" style={{ color: ACCENT }}>{step?.islands || 0}</p>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-2">Grid Size</p>
                        <p className="text-sm font-mono">{grid.length} × {grid[0]?.length}</p>
                      </div>
                    </div>

                    <div className="bg-content2 rounded-lg px-4 py-3 text-sm font-mono" style={{ borderLeft: `3px solid ${stepColor}` }}>
                      {step?.desc}
                    </div>

                    <div className="flex gap-2 justify-between mt-6">
                      <Button size="sm" onPress={() => setSi(Math.max(0, si - 1))} isDisabled={si === 0}>← Prev</Button>
                      <span className="text-xs self-center">{si + 1} / {steps.length}</span>
                      <Button size="sm" onPress={() => setSi(Math.min(steps.length - 1, si + 1))} isDisabled={si === steps.length - 1}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
