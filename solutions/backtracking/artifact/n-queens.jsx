export const difficulty = 'Hard'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

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

// ── Simulation ────────────────────────────────────────────────────────────────
function simulate(n) {
  const steps = [];
  const solutions = [];
  const queens = new Array(n).fill(-1);
  const cols = new Set();
  const diag = new Set();
  const antiDiag = new Set();

  function backtrack(row) {
    if (row === n) {
      const sol = queens.slice();
      solutions.push(sol);
      steps.push({
        phase: 'solution',
        row,
        col: -1,
        queens: queens.slice(),
        solutions: solutions.map(s => s.slice()),
        conflictType: null,
        desc: `Solution #${solutions.length} found! Queens at cols [${sol.join(', ')}]`,
      });
      return;
    }

    for (let col = 0; col < n; col++) {
      const colConflict  = cols.has(col);
      const diagConflict = diag.has(row - col);
      const aConflict    = antiDiag.has(row + col);
      const isConflict   = colConflict || diagConflict || aConflict;

      if (isConflict) {
        steps.push({
          phase: 'conflict',
          row, col,
          queens: queens.slice(),
          solutions: solutions.map(s => s.slice()),
          conflictType: colConflict ? 'col' : diagConflict ? 'diag' : 'antiDiag',
          desc: `Row ${row}, Col ${col}: conflict (${colConflict ? 'same column' : diagConflict ? 'same \\ diagonal' : 'same / diagonal'}) — skip`,
        });
        continue;
      }

      // Place
      queens[row] = col;
      cols.add(col);
      diag.add(row - col);
      antiDiag.add(row + col);

      steps.push({
        phase: 'place',
        row, col,
        queens: queens.slice(),
        solutions: solutions.map(s => s.slice()),
        conflictType: null,
        desc: `Row ${row}, Col ${col}: safe! Place queen → recurse to row ${row + 1}`,
      });

      backtrack(row + 1);

      // Undo
      queens[row] = -1;
      cols.delete(col);
      diag.delete(row - col);
      antiDiag.delete(row + col);

      steps.push({
        phase: 'backtrack',
        row, col,
        queens: queens.slice(),
        solutions: solutions.map(s => s.slice()),
        conflictType: null,
        desc: `Backtrack: remove queen from row ${row}, col ${col} → try next column`,
      });
    }
  }

  backtrack(0);
  return steps;
}

// ── Board component ───────────────────────────────────────────────────────────
function Board({ n, step }) {
  if (!step) return null;
  const { row: curRow, col: curCol, queens, phase } = step;

  // Compute attacked cells from all placed queens (for highlight)
  const attackedCols = new Set();
  const attackedDiag = new Set();
  const attackedAnti = new Set();
  for (let r = 0; r < n; r++) {
    if (queens[r] >= 0) {
      attackedCols.add(queens[r]);
      attackedDiag.add(r - queens[r]);
      attackedAnti.add(r + queens[r]);
    }
  }

  const cellSize = n <= 4 ? 52 : n <= 6 ? 44 : 36;

  return (
    <div style={{
      display: "inline-grid",
      gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
      gap: 2,
    }}>
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const hasQueen   = queens[r] === c;
          const isCurrent  = r === curRow && c === curCol;
          const isLight    = (r + c) % 2 === 0;

          // Is this cell attacked by any placed queen?
          const attacked = !hasQueen && (
            attackedCols.has(c) ||
            attackedDiag.has(r - c) ||
            attackedAnti.has(r + c)
          );

          let bg, border, textColor;

          if (hasQueen && phase === 'solution') {
            bg = `${GOLD}33`;
            border = `2px solid ${GOLD}`;
            textColor = GOLD;
          } else if (hasQueen) {
            bg = `${TEAL}28`;
            border = `2px solid ${TEAL}`;
            textColor = TEAL;
          } else if (isCurrent && phase === 'conflict') {
            bg = `${RED}22`;
            border = `2px solid ${RED}`;
            textColor = RED;
          } else if (isCurrent && phase === 'place') {
            bg = `${TEAL}18`;
            border = `2px solid ${TEAL}`;
            textColor = TEAL;
          } else if (attacked && (phase === 'conflict' || phase === 'place')) {
            bg = `${RED}0a`;
            border = `1px solid ${RED}22`;
            textColor = "var(--viz-muted)";
          } else {
            bg = isLight ? "var(--viz-surface)" : "var(--viz-node-bg)";
            border = "1px solid var(--viz-border)";
            textColor = "var(--viz-muted)";
          }

          return (
            <div key={`${r}-${c}`} style={{
              width: cellSize, height: cellSize,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: bg,
              border,
              borderRadius: 4,
              fontSize: hasQueen ? (cellSize > 44 ? 22 : 18) : 11,
              color: textColor,
              fontWeight: 600,
              transition: "all 0.15s",
              userSelect: "none",
            }}>
              {hasQueen ? "♛" : (isCurrent && phase !== 'backtrack' && phase !== 'solution') ? "·" : ""}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Mini solution board ───────────────────────────────────────────────────────
function MiniBoard({ n, queens }) {
  const cellSize = 20;
  return (
    <div style={{
      display: "inline-grid",
      gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
      gap: 1,
    }}>
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => (
          <div key={`${r}-${c}`} style={{
            width: cellSize, height: cellSize,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: queens[r] === c ? `${GOLD}33` : (r + c) % 2 === 0 ? "var(--viz-surface)" : "var(--viz-node-bg)",
            border: queens[r] === c ? `1px solid ${GOLD}` : "1px solid var(--viz-border)",
            borderRadius: 2,
            fontSize: 10,
            color: GOLD,
          }}>
            {queens[r] === c ? "♛" : ""}
          </div>
        ))
      )}
    </div>
  );
}

const PRESETS = [
  { label: "N = 4", n: 4 },
  { label: "N = 5", n: 5 },
  { label: "N = 6", n: 6 },
];

export default function App() {
  const [n, setN] = useState(4);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(n));
    setSi(0);
  }, [n]);

  const step = steps[si] || null;
  const solutionSteps = steps.filter(s => s.phase === 'solution');

  const phaseColor = {
    place:     TEAL,
    conflict:  RED,
    backtrack: GOLD,
    solution:  GOLD,
  }[step?.phase] ?? BLUE;

  const phaseLabel = {
    place:     "PLACE",
    conflict:  "CONFLICT",
    backtrack: "BACKTRACK",
    solution:  "SOLUTION",
  }[step?.phase] ?? "–";

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">♛</span>
        <h1 className="font-semibold text-base">N-Queens</h1>
        <Chip size="sm" color="danger" variant="flat">Hard</Chip>
        <Chip size="sm" color="primary" variant="flat">Backtracking</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs variant="underlined" color="primary" size="sm">

          {/* ── PROBLEM ── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Place <strong>N queens</strong> on an N×N chessboard such that no two queens attack each other.
                  Queens attack along the same <em>row</em>, <em>column</em>, or either <em>diagonal</em>.
                  Return all distinct solutions — each solution is the board as a list of strings, where <code>'Q'</code> marks a queen and <code>'.'</code> marks an empty cell.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "List<List<String>> solveNQueens(int n)", desc: "Return all distinct N-queens solutions. Each inner list has N strings of length N." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — N = 4 (2 solutions)</p>
                <CodeBlock language="text">{`Input: n = 4
Output: [[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]

Solution 1:        Solution 2:
. Q . .            . . Q .
. . . Q            Q . . .
Q . . .            . . . Q
. . Q .            . Q . .

Attack rules — queens attack if they share:
  ● same column    → cols set tracks col numbers used
  ● "\\" diagonal  → diag set tracks (row - col) — constant on "\\" lines
  ● "/" diagonal   → antiDiag set tracks (row + col) — constant on "/" lines

One queen per row is guaranteed by iterating row by row.`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Why r−c and r+c Work as Diagonal IDs</p>
                <CodeBlock language="text">{`Place a queen at row=1, col=1.
It adds one value to each set:
  cols     ← 1          (column 1 is taken)
  diag     ← 1−1 = 0   (its "\\" diagonal ID)
  antiDiag ← 1+1 = 2   (its "/" diagonal ID)

Now try to place in row=2 — three O(1) checks per column:

  col=0 → cols: 0≠1 ✓  diag: 2−0=2≠0 ✓  antiDiag: 2+0=2=2 ✗  BLOCKED ("/")
  col=1 → cols: 1=1 ✗  BLOCKED (same column)
  col=2 → cols: 2≠1 ✓  diag: 2−2=0=0 ✗  BLOCKED ("\\")
  col=3 → cols: 3≠1 ✓  diag: 2−3=−1≠0 ✓  antiDiag: 2+3=5≠2 ✓  SAFE ✓

The math: any two cells on the same "\\" diagonal always share the
same (row−col) value. Any two on the same "/" share the same (row+col).
So three integer sets replace scanning an entire attacked[][] board.`}</CodeBlock>
              </CardBody></Card>

            </div>
          </Tab>

          {/* ── INTUITION ── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Row-by-Row Backtracking</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Place exactly one queen per row. For each row, try every column.
                      If no conflict, place and recurse to the next row. When all N rows are filled, record a solution.
                      If stuck, backtrack (undo the last placement) and try the next column.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">place → recurse → undo</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Three O(1) Conflict Checks</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Instead of scanning the whole board, maintain three sets of integers.
                      A queen at <code>(r, c)</code> adds <code>c</code> to <code>cols</code>,{" "}
                      <code>r−c</code> to <code>diag</code>, and <code>r+c</code> to <code>antiDiag</code>.
                      A cell is safe only if none of those three values are already in their sets.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">e.g. queen at (1,1) → adds 1, 0, 2</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`Set<Integer> cols = new HashSet<>();
Set<Integer> diag = new HashSet<>();     // r - c
Set<Integer> antiDiag = new HashSet<>(); // r + c

void backtrack(int row) {
    if (row == n) { addSolution(); return; }

    for (int col = 0; col < n; col++) {
        if (cols.contains(col)
            || diag.contains(row - col)
            || antiDiag.contains(row + col)) continue;

        // Place
        queens[row] = col;
        cols.add(col); diag.add(row-col); antiDiag.add(row+col);

        backtrack(row + 1);

        // Undo
        queens[row] = -1;
        cols.remove(col); diag.remove(row-col); antiDiag.remove(row+col);
    }
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  <code>(0,0)</code>, <code>(1,1)</code>, <code>(2,2)</code> are all on the same <code>\</code> diagonal — their <code>row−col</code> is always 0.{" "}
                  <code>(0,2)</code>, <code>(1,1)</code>, <code>(2,0)</code> are all on the same <code>/</code> diagonal — their <code>row+col</code> is always 2.{" "}
                  Store those integers in a set: one lookup replaces an entire diagonal scan.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(N!)", s: "N choices for row 0, N−1 for row 1… worst-case full permutation tree" },
                    { l: "SPACE", v: "O(N)", s: "Three sets + recursion stack depth N + queens[] array" },
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

          {/* ── VISUALIZER ── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {PRESETS.map(p => (
                    <Button key={p.n} size="sm"
                      variant={n === p.n ? "flat" : "bordered"}
                      color={n === p.n ? "primary" : "default"}
                      onPress={() => setN(p.n)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-4 flex-wrap text-xs text-default-400">
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${TEAL}28`, border: `1px solid ${TEAL}`, marginRight: 4 }} />Queen placed</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${RED}22`, border: `1px solid ${RED}`, marginRight: 4 }} />Conflict cell</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${RED}0a`, border: `1px solid ${RED}22`, marginRight: 4 }} />Under attack</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${GOLD}33`, border: `1px solid ${GOLD}`, marginRight: 4 }} />Solution queen</span>
                </div>
              </CardBody></Card>

              {/* Debugger */}
              {step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>

                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>{si + 1}/{steps.length}</p>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    Phase: <span style={{ color: phaseColor }} className="font-bold">{phaseLabel}</span>
                    {step.row >= 0 && step.col >= 0 && step.phase !== 'solution' && (
                      <> · Row <V color={BLUE}>{step.row}</V> Col <V color={BLUE}>{step.col}</V></>
                    )}
                    {step.phase === 'place' && <> · <span style={{ color: TEAL }}>♛ safe</span></>}
                    {step.phase === 'conflict' && <> · <span style={{ color: RED }}>✗ {step.conflictType === 'col' ? 'column' : step.conflictType === 'diag' ? '\\ diagonal' : '/ diagonal'} conflict</span></>}
                    {step.phase === 'solution' && <> · <span style={{ color: GOLD }}>Solution #{step.solutions.length}</span></>}
                    {step.queens.filter(q => q >= 0).length > 0 && (
                      <> · queens at cols [<span style={{ color: TEAL }}>{step.queens.map((q, i) => q >= 0 ? q : '–').join(', ')}</span>]</>
                    )}
                  </p>

                  {/* Live code */}
                  <div className="rounded-xl overflow-hidden mb-4"
                    style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'solution'}
                      annotation={step.phase === 'solution' ? `solution #${step.solutions.length}` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>if (row == n) addSolution()</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'conflict'}
                      annotation={step.phase === 'conflict' ? step.conflictType + ' conflict' : ''}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>if (cols/diag/antiDiag conflict) continue</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'place'}
                      annotation={step.phase === 'place' ? `queens[${step.row}] = ${step.col}` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>place queen → add to sets → recurse</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'backtrack'}
                      annotation={step.phase === 'backtrack' ? `undo row ${step.row}, col ${step.col}` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>undo placement → remove from sets</span>
                    </CodeLine>
                  </div>

                  {/* Board */}
                  <div className="rounded-xl p-4 mb-4 overflow-x-auto text-center"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-4">
                      {n}×{n} board · {step.queens.filter(q => q >= 0).length} queen{step.queens.filter(q => q >= 0).length !== 1 ? 's' : ''} placed
                      {step.phase === 'conflict' && <span style={{ color: RED }}> · ✗ can't place here</span>}
                      {step.phase === 'solution' && <span style={{ color: GOLD }}> · ✓ complete solution!</span>}
                    </p>
                    <Board n={n} step={step} />
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono"
                    style={{ background: "var(--viz-surface)", borderLeft: `3px solid ${phaseColor}`, border: `1px solid var(--viz-border)` }}>
                    {step.desc}
                  </div>

                  {/* Prev / Next */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Solutions found so far */}
              {step && step.solutions.length > 0 && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">
                    Solutions Found So Far — <span style={{ color: GOLD }}>{step.solutions.length}</span>
                    <span className="text-default-400 ml-1">of {solutionSteps.length} total</span>
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    {step.solutions.map((sol, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <MiniBoard n={n} queens={sol} />
                        <p className="text-xs text-default-400">#{idx + 1}</p>
                      </div>
                    ))}
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* ── CODE ── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.*;

class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> results = new ArrayList<>();
        Set<Integer> cols     = new HashSet<>();
        Set<Integer> diag     = new HashSet<>();     // r - c
        Set<Integer> antiDiag = new HashSet<>();     // r + c
        int[] queens = new int[n];
        Arrays.fill(queens, -1);
        backtrack(0, n, queens, cols, diag, antiDiag, results);
        return results;
    }

    private void backtrack(int row, int n, int[] queens,
                           Set<Integer> cols, Set<Integer> diag,
                           Set<Integer> antiDiag,
                           List<List<String>> results) {
        if (row == n) {
            results.add(buildBoard(queens, n));
            return;
        }
        for (int col = 0; col < n; col++) {
            if (cols.contains(col)
                    || diag.contains(row - col)
                    || antiDiag.contains(row + col)) continue;

            // Place
            queens[row] = col;
            cols.add(col);
            diag.add(row - col);
            antiDiag.add(row + col);

            backtrack(row + 1, n, queens, cols, diag, antiDiag, results);

            // Undo
            queens[row] = -1;
            cols.remove(col);
            diag.remove(row - col);
            antiDiag.remove(row + col);
        }
    }

    private List<String> buildBoard(int[] queens, int n) {
        List<String> board = new ArrayList<>();
        for (int r = 0; r < n; r++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[queens[r]] = 'Q';
            board.add(new String(row));
        }
        return board;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (row == n)", exp: "Base case: all N rows filled successfully — every row has exactly one safe queen." },
                    { line: "results.add(buildBoard(...))", exp: "Reconstruct the board from the queens[] column array, then add to results." },
                    { line: "cols.contains(col)", exp: "Another queen is already in this column. All queens in the same column attack each other vertically." },
                    { line: "diag.contains(row - col)", exp: "Every cell on the same \\ diagonal has an identical (row−col) value — e.g. (0,0), (1,1), (2,2) all give 0. If that value is in the set, this cell shares a \\ diagonal with an existing queen." },
                    { line: "antiDiag.contains(row + col)", exp: "Every cell on the same / diagonal has an identical (row+col) value — e.g. (0,2), (1,1), (2,0) all give 2. If that value is in the set, this cell shares a / diagonal with an existing queen." },
                    { line: "cols.add(col); diag.add(row-col); antiDiag.add(row+col)", exp: "Claim this queen's column, \\ diagonal ID, and / diagonal ID — so future rows know these are off-limits." },
                    { line: "cols.remove(col); ...", exp: "Backtrack: undo all three claims so the next column in this loop gets a clean slate to test." },
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
                    { icon: "📍", color: TEAL, tip: "Three sets replace the whole board: cols tracks used columns; diag tracks (r−c) — equal for cells on the same \\ diagonal; antiDiag tracks (r+c) — equal for cells on the same / diagonal. One add + one remove per queen, three O(1) lookups per cell." },
                    { icon: "⚠️", color: GOLD, tip: "Backtrack must undo ALL three entries — cols.remove, diag.remove, antiDiag.remove. Skip one and future rows see phantom attacks that never existed." },
                    { icon: "🔄", color: BLUE, tip: "The universal backtracking template: place → recurse → undo. N-Queens is the textbook example. The key is that undo mirrors place exactly." },
                    { icon: "💡", color: TEAL, tip: "queens[r] = col is a compact representation — just one int per row. The board strings (.Q.. etc.) are only built when row == n, not on every step." },
                    { icon: "🎯", color: BLUE, tip: "Related: N-Queens II (count only, LC 52), Sudoku Solver (same 3-set constraint idea per row/col/box), Word Search (4-directional DFS + visited set)." },
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
