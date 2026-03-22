export const difficulty = 'Medium'
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

// Preset boards as 81-char strings
const PRESET_BOARDS = {
  valid: [
    ['5','3','.','.','7','.','.','.','.'],
    ['6','.','.','1','9','5','.','.','.'],
    ['.','9','8','.','.','.','.','6','.'],
    ['8','.','.','.','6','.','.','.','3'],
    ['4','.','.','8','.','3','.','.','1'],
    ['7','.','.','.','2','.','.','.','6'],
    ['.','6','.','.','.','.','2','8','.'],
    ['.','.','.','4','1','9','.','.','5'],
    ['.','.','.','.','8','.','.','7','9'],
  ],
  invalidRow: [
    ['5','3','.','.','7','.','.','.','.'],
    ['6','.','.','1','9','5','.','.','.'],
    ['.','9','8','.','.','.','.','6','.'],
    ['8','.','.','.','6','.','.','.','3'],
    ['4','.','.','8','.','3','.','.','1'],
    ['7','.','.','.','2','.','.','.','6'],
    ['.','6','.','.','.','.','2','8','.'],
    ['.','.','.','4','1','9','1','.','5'], // two 1s in row 7
    ['.','.','.','.','8','.','.','7','9'],
  ],
  invalidCol: [
    ['5','3','.','.','7','.','.','.','.'],
    ['6','.','.','1','9','5','.','.','.'],
    ['.','9','8','.','.','.','.','6','.'],
    ['8','.','.','.','6','.','.','.','3'],
    ['4','.','.','8','.','3','.','.','1'],
    ['7','.','.','.','2','.','.','.','6'],
    ['.','6','.','.','.','.','2','8','.'],
    ['.','.','.','4','1','9','.','.','5'],
    ['5','.','.','.','8','.','.','7','9'], // 5 in col 0 — same as row 0
  ],
  invalidBox: [
    ['5','3','.','.','7','.','.','.','.'],
    ['5','.','.','1','9','5','.','.','.'], // second 5 in top-left box
    ['.','9','8','.','.','.','.','6','.'],
    ['8','.','.','.','6','.','.','.','3'],
    ['4','.','.','8','.','3','.','.','1'],
    ['7','.','.','.','2','.','.','.','6'],
    ['.','6','.','.','.','.','2','8','.'],
    ['.','.','.','4','1','9','.','.','5'],
    ['.','.','.','.','8','.','.','7','9'],
  ],
};

function simulate(board) {
  const steps = [];
  const seen = new Set();
  const processedCells = new Set();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];

      if (val === '.') {
        steps.push({
          r, c, val,
          phase: 'skip',
          valid: true,
          processedCells: new Set(processedCells),
          seen: new Set(seen),
          boxIdx: Math.floor(r / 3) * 3 + Math.floor(c / 3),
          rowDup: false, colDup: false, boxDup: false,
          desc: `Cell [${r},${c}] is empty ('.') — skip`,
        });
        continue;
      }

      const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      const rowKey = `r${r}${val}`;
      const colKey = `c${c}${val}`;
      const boxKey = `b${boxIdx}${val}`;

      const rowDup = seen.has(rowKey);
      const colDup = seen.has(colKey);
      const boxDup = seen.has(boxKey);
      const isDup = rowDup || colDup || boxDup;

      if (!isDup) {
        seen.add(rowKey);
        seen.add(colKey);
        seen.add(boxKey);
        processedCells.add(`${r},${c}`);
      }

      steps.push({
        r, c, val,
        phase: isDup ? 'invalid' : 'check',
        valid: !isDup,
        processedCells: new Set(processedCells),
        seen: new Set(seen),
        boxIdx,
        rowDup, colDup, boxDup,
        desc: isDup
          ? `DUPLICATE! '${val}' at [${r},${c}] already in ${rowDup ? 'row ' + r : ''}${colDup ? (rowDup ? ' & ' : '') + 'col ' + c : ''}${boxDup ? ((rowDup || colDup) ? ' & ' : '') + 'box ' + boxIdx : ''} → INVALID`
          : `'${val}' at [${r},${c}] — row ${r} ✓, col ${c} ✓, box ${boxIdx} ✓`,
      });

      if (isDup) {
        steps.push({
          r, c, val,
          phase: 'result',
          valid: false, result: false,
          processedCells: new Set(processedCells),
          seen: new Set(seen),
          boxIdx, rowDup, colDup, boxDup,
          desc: `Board is INVALID — duplicate '${val}' found!`,
        });
        return steps;
      }
    }
  }

  steps.push({
    r: -1, c: -1, val: null,
    phase: 'result',
    valid: true, result: true,
    processedCells: new Set(processedCells),
    seen: new Set(seen),
    boxIdx: -1, rowDup: false, colDup: false, boxDup: false,
    desc: 'Board is VALID — no duplicates in any row, column, or 3×3 box!',
  });

  return steps;
}

function SudokuGrid({ board, step }) {
  if (!board || !step) return null;

  const { r: cr, c: cc, boxIdx: curBox, phase, processedCells } = step;

  return (
    <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 2, maxWidth: 360, margin: "0 auto" }}>
      {board.map((row, r) =>
        row.map((val, c) => {
          const isCurrentCell = r === cr && c === cc;
          const sameRow = cr >= 0 && r === cr && c !== cc;
          const sameCol = cc >= 0 && c === cc && r !== cr;
          const cellBox = Math.floor(r / 3) * 3 + Math.floor(c / 3);
          const sameBox = curBox >= 0 && cellBox === curBox && !isCurrentCell;
          const isDone = processedCells?.has(`${r},${c}`);

          let bg = "var(--viz-node-bg)";
          let border = "1px solid var(--viz-border)";
          let color = "var(--viz-muted)";
          let shadow = "none";

          if (isCurrentCell) {
            const cellColor = phase === 'invalid' ? RED : TEAL;
            bg = `${cellColor}22`;
            border = `2px solid ${cellColor}`;
            color = cellColor;
            shadow = `0 0 8px ${cellColor}55`;
          } else if (sameRow && phase !== 'skip') {
            bg = `${TEAL}0a`;
            border = `1px solid ${TEAL}44`;
          } else if (sameCol && phase !== 'skip') {
            bg = `${BLUE}0a`;
            border = `1px solid ${BLUE}44`;
          } else if (sameBox && phase !== 'skip') {
            bg = `${GOLD}0a`;
            border = `1px solid ${GOLD}33`;
          } else if (isDone) {
            bg = `${TEAL}08`;
            color = `${TEAL}aa`;
          }

          // Bold box dividers
          const borderTop = r % 3 === 0 && r !== 0 ? `2px solid var(--viz-border)` : border;
          const borderLeft = c % 3 === 0 && c !== 0 ? `2px solid var(--viz-border)` : border;

          return (
            <div
              key={`${r}-${c}`}
              style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: bg,
                border,
                borderTop, borderLeft,
                color,
                fontFamily: "monospace",
                fontSize: 13,
                fontWeight: isCurrentCell ? 700 : val !== '.' ? 600 : 400,
                boxShadow: shadow,
                transition: "all 0.15s",
                borderRadius: 3,
              }}
            >
              {val !== '.' ? val : ''}
            </div>
          );
        })
      )}
    </div>
  );
}

const PRESETS = [
  { label: "Valid Board", key: "valid" },
  { label: "Invalid Row", key: "invalidRow" },
  { label: "Invalid Col", key: "invalidCol" },
  { label: "Invalid Box", key: "invalidBox" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [presetKey, setPresetKey] = useState("valid");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  const board = PRESET_BOARDS[presetKey];

  useEffect(() => {
    setSteps(simulate(board));
    setSi(0);
  }, [presetKey]);

  const step = steps[si] || null;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔢</span>
        <h1 className="font-semibold text-base">Valid Sudoku</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Arrays · HashSet</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM TAB */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Determine if a 9×9 Sudoku board is valid. Only the filled cells need to be validated.
                  A valid board requires: each <strong>row</strong>, each <strong>column</strong>, and each of
                  the nine <strong>3×3 sub-boxes</strong> contains digits 1–9 with no repetition.
                  The board may be partially filled — empty cells are marked as <code>'.'</code>.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      sig: "boolean isValidSudoku(char[][] board)",
                      desc: "Return true if the board is valid. O(1) time/space since the grid is always 9×9.",
                    },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — Board Validation Rules</p>
                <CodeBlock language="text">{`Check each non-'.' cell (r, c) with value v:

  Row check:  Has 'v' appeared before in row r?
  Col check:  Has 'v' appeared before in col c?
  Box check:  Has 'v' appeared before in the 3×3 box?

Box index formula: (r / 3) * 3 + (c / 3)
  Boxes are numbered 0–8 left-to-right, top-to-bottom:
  [ 0 | 1 | 2 ]
  [ 3 | 4 | 5 ]
  [ 6 | 7 | 8 ]

If any check fails → return false
If all 81 cells pass   → return true`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Strategy — Encoding with a Single HashSet</p>
                <CodeBlock language="text">{`For cell [r=0, c=1, val='3']:
  Row key:  "r0 3"   → unique for (row 0, value 3)
  Col key:  "c1 3"   → unique for (col 1, value 3)
  Box key:  "b0 3"   → unique for (box 0, value 3)

If any key already exists in the set → DUPLICATE!
Otherwise add all three keys and continue.

One HashSet replaces 27 separate row/col/box sets.`}</CodeBlock>
              </CardBody></Card>

            </div>
          </Tab>

          {/* INTUITION TAB */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Three Constraints at Once</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Each cell must be valid in its <em>row</em>, <em>column</em>, and <em>3×3 box</em>.
                      Track all three simultaneously using a single HashSet with prefixed keys to avoid collisions.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">"r[r][v]" · "c[c][v]" · "b[box][v]"</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Box Index Formula</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Map any cell <code>(r, c)</code> to its 3×3 box index:
                      <strong> (r/3)×3 + (c/3)</strong>. Integer division groups rows/cols into blocks of 3.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">boxIdx = (r/3)*3 + (c/3) → 0..8</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`HashSet<String> seen = new HashSet<>();

for (int r = 0; r < 9; r++) {
    for (int c = 0; c < 9; c++) {
        char val = board[r][c];
        if (val == '.') continue;  // skip empty

        int box = (r / 3) * 3 + (c / 3);

        // Encode: prefix prevents cross-type collisions
        String rowKey = "r" + r + val;
        String colKey = "c" + c + val;
        String boxKey = "b" + box + val;

        // add() returns false if already present
        if (!seen.add(rowKey) || !seen.add(colKey)
                               || !seen.add(boxKey)) {
            return false;  // duplicate found
        }
    }
}
return true;`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  <code>HashSet.add()</code> returns <code>false</code> if the element already existed —
                  a single short-circuit condition handles all three duplicate checks. The prefix characters
                  ('r', 'c', 'b') ensure no accidental key collisions between row/col/box checks.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(1)", s: "Fixed 9×9 = 81 cells maximum regardless of input" },
                    { l: "SPACE", v: "O(1)", s: "At most 243 entries in the set (81 cells × 3 keys each)" },
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

          {/* VISUALIZER TAB */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map(p => (
                    <Button key={p.key} size="sm"
                      variant={presetKey === p.key ? "flat" : "bordered"}
                      color={presetKey === p.key ? "primary" : "default"}
                      onPress={() => setPresetKey(p.key)}>
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-3 flex gap-4 flex-wrap text-xs text-default-400">
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${TEAL}22`, border: `1px solid ${TEAL}` }} /> current cell</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${TEAL}0a`, border: `1px solid ${TEAL}44` }} /> same row</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${BLUE}0a`, border: `1px solid ${BLUE}44` }} /> same col</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: `${GOLD}0a`, border: `1px solid ${GOLD}33` }} /> same box</span>
                </div>
              </CardBody></Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>

                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>{si + 1}/{steps.length}</p>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    {step.phase === 'skip' && <>Cell <V color={BLUE}>[{step.r},{step.c}]</V> = <V color={BLUE}>'.'</V> — <span style={{ color: BLUE }}>skip</span></>}
                    {step.phase === 'check' && <>Cell <V color={TEAL}>[{step.r},{step.c}]</V> = <V color={TEAL}>'{step.val}'</V> · Row <V color={TEAL}>{step.r}</V> · Col <V color={BLUE}>{step.c}</V> · Box <V color={GOLD}>{step.boxIdx}</V> · <span style={{ color: TEAL }} className="font-bold">✓ Valid</span></>}
                    {step.phase === 'invalid' && <>Cell <V color={RED}>[{step.r},{step.c}]</V> = <V color={RED}>'{step.val}'</V> · <span style={{ color: RED }} className="font-bold">✗ DUPLICATE!</span>{step.rowDup && <> in row <V color={RED}>{step.r}</V></>}{step.colDup && <> in col <V color={RED}>{step.c}</V></>}{step.boxDup && <> in box <V color={RED}>{step.boxIdx}</V></>}</>}
                    {step.phase === 'result' && <><span style={{ color: step.result ? TEAL : RED }} className="font-bold">{step.result ? '✓ VALID BOARD' : '✗ INVALID BOARD'}</span></>}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4"
                    style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step.phase === 'skip'}
                      annotation={step.phase === 'skip' ? `cell = '.'` : ''}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>if (val == '.') continue</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'check' || step.phase === 'invalid'}
                      annotation={step.phase === 'check' || step.phase === 'invalid' ? `box = ${step.boxIdx}` : ''}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>int box = (r/3)*3 + (c/3)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'check'}
                      annotation={step.phase === 'check' ? `add r${step.r}${step.val}, c${step.c}${step.val}, b${step.boxIdx}${step.val}` : ''}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>seen.add(rowKey, colKey, boxKey)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step.phase === 'invalid'}
                      annotation={step.phase === 'invalid' ? `duplicate '${step.val}' found!` : ''}
                      annotationColor={RED}>
                      <span style={{ color: "var(--code-muted)" }}>if (!seen.add(...)) return false</span>
                    </CodeLine>
                  </div>

                  {/* Grid visualization */}
                  <div className="rounded-xl p-4 mb-4 overflow-x-auto text-center"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-4">
                      Checking cell {step.r >= 0 ? `[${step.r},${step.c}]` : '—'}
                      {step.val && step.val !== '.' ? ` = '${step.val}'` : ''}
                    </p>
                    <SudokuGrid board={board} step={step} />
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 mb-4 text-xs font-mono bg-content2"
                    style={{ borderLeft: `3px solid ${step.phase === 'invalid' || (!step.result && step.phase === 'result') ? RED : TEAL}` }}>
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

              {/* Final State Card */}
              {step?.phase === 'result' && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Result</p>
                  <div className="py-6 text-center rounded-xl"
                    style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-4xl mb-3">{step.result ? '✅' : '❌'}</p>
                    <p className="font-bold text-2xl" style={{ color: step.result ? TEAL : RED }}>
                      {step.result ? 'VALID' : 'INVALID'}
                    </p>
                    <p className="text-xs text-default-400 mt-3">{step.desc}</p>
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* CODE TAB */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.HashSet;

class Solution {
    public boolean isValidSudoku(char[][] board) {
        HashSet<String> seen = new HashSet<>();

        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                char val = board[r][c];
                if (val == '.') continue;

                int boxIdx = (r / 3) * 3 + (c / 3);

                // Prefixed keys prevent cross-type key collisions
                String rowKey = "r" + r + val;
                String colKey = "c" + c + val;
                String boxKey = "b" + boxIdx + val;

                // add() returns false if already present
                if (!seen.add(rowKey) || !seen.add(colKey) || !seen.add(boxKey)) {
                    return false;
                }
            }
        }

        return true;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (val == '.') continue", exp: "Skip empty cells — they don't participate in any duplicate check." },
                    { line: "int boxIdx = (r/3)*3 + (c/3)", exp: "Map cell (r,c) to its 3×3 box (0–8). Integer division groups rows/cols into blocks of 3." },
                    { line: "String rowKey = \"r\" + r + val", exp: "Encode row membership. Prefix 'r' ensures \"r15\" (row 1, val 5) doesn't collide with \"c15\" (col 1, val 5)." },
                    { line: "String boxKey = \"b\" + boxIdx + val", exp: "Encode box membership. Uses box index 0–8 so all 9 boxes have unique keys." },
                    { line: "if (!seen.add(rowKey) || ...)", exp: "HashSet.add() returns false if already present. Short-circuit: if ANY check fails, return false immediately." },
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
                    { icon: "📍", color: TEAL, tip: "Box index = (r/3)*3 + (c/3). Memorize this formula — it's the key to flattening 3D (row, col, box) into a 1D index." },
                    { icon: "⚠️", color: GOLD, tip: "Always prefix keys with 'r', 'c', 'b'. Without prefixes, 'r05' (row 0, val 5) and 'c05' (col 0, val 5) would look the same!" },
                    { icon: "🔄", color: BLUE, tip: "HashSet.add() returns false if the element was already there — use it directly in an if condition to detect duplicates." },
                    { icon: "💡", color: TEAL, tip: "The full 9×9 board is always constant-size, so time and space are both O(1) technically — no asymptotic scaling." },
                    { icon: "🎯", color: BLUE, tip: "Related: Sudoku Solver (backtracking on top of this validation), N-Queens, Set Matrix Zeroes." },
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
    </div>
  );
}
