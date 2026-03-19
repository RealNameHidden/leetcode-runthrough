export const difficulty = 'Medium';
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

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

function parseBoard(text) {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const rows = lines.map(line => line.replace(/\s/g, "").split(""));
  const w = rows[0].length;
  if (rows.some(r => r.length !== w)) return null;
  return rows;
}

function cloneBoard(b) {
  return b.map(row => [...row]);
}

/** Mirrors WordSearch.exist / search; records steps for the visualizer. */
function simulate(board, word) {
  const steps = [];
  const rows = board.length;
  const cols = board[0].length;
  const w = word.trim();
  if (!w.length) return { steps: [], error: "Word is empty." };

  const b = cloneBoard(board);

  function push(step) {
    steps.push({ ...step, board: cloneBoard(b), word: w });
  }

  function search(r, c, idx) {
    if (idx === w.length) {
      push({ phase: "win", r, c, idx, line: 0, note: "matched all letters" });
      return true;
    }
    if (r < 0 || c < 0 || r >= rows || c >= cols || b[r][c] !== w[idx]) {
      push({
        phase: "reject",
        r, c, idx,
        line: 1,
        note: r < 0 || c < 0 || r >= rows || c >= cols ? "out of bounds" : `need '${w[idx]}' saw '${b[r][c]}'`,
      });
      return false;
    }

    push({ phase: "enter", r, c, idx, line: 1, note: `match '${w[idx]}' at (${r},${c})` });

    const temp = b[r][c];
    b[r][c] = "#";
    push({ phase: "mark", r, c, idx, line: 2, note: `visited (${r},${c})` });

    const dirs = [[-1, 0], [0, -1], [1, 0], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      push({
        phase: "recurse",
        r, c, idx, nr, nc,
        line: 3,
        note: `try (${nr},${nc}) for '${idx + 1 < w.length ? w[idx + 1] : "∅"}'`,
      });
      if (search(nr, nc, idx + 1)) {
        push({ phase: "success_return", r, c, idx, line: 3, note: "child returned true" });
        return true;
      }
    }

    b[r][c] = temp;
    push({ phase: "restore", r, c, idx, line: 4, note: `unmark (${r},${c})` });
    return false;
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (w[0] === b[i][j]) {
        push({ phase: "outer", r: i, c: j, idx: 0, line: -1, note: `start DFS from (${i},${j})` });
        if (search(i, j, 0)) {
          push({ phase: "done", ok: true, line: -1, note: "exist → true" });
          return { steps, error: null };
        }
      }
    }
  }

  push({ phase: "done", ok: false, line: -1, note: "exist → false" });
  return { steps, error: null };
}

function lineAnnotations(step) {
  const ann = Array(5).fill("");
  if (!step) return ann;
  if (step.phase === "outer") {
    ann[0] = step.note || "";
    return ann;
  }
  const i = step.line;
  if (i === 0) ann[0] = step.note || "";
  if (i === 1) ann[1] = step.note || "";
  if (i === 2) ann[2] = step.note || "";
  if (i === 3) ann[3] = step.note || "";
  if (i === 4) ann[4] = step.note || "";
  return ann;
}

function GridViz({ board, focusR, focusC }) {
  if (!board?.length) return null;
  const rows = board.length;
  const cols = board[0].length;
  const cs = 44;
  const pad = 10;
  const vw = cols * cs + pad * 2;
  const vh = rows * cs + pad * 2;
  const cells = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const ch = board[i][j];
      const x = pad + j * cs;
      const y = pad + i * cs;
      const isFocus = i === focusR && j === focusC;
      const isVisited = ch === "#";
      cells.push(
        <g key={`${i}-${j}`}>
          <rect
            x={x}
            y={y}
            width={cs - 4}
            height={cs - 4}
            rx={6}
            fill={isVisited ? `${TEAL}22` : "var(--viz-node-bg)"}
            stroke={isFocus ? TEAL : "var(--viz-border)"}
            strokeWidth={isFocus ? 2.5 : 1}
          />
          <text
            x={x + (cs - 4) / 2}
            y={y + (cs - 4) / 2 + 5}
            textAnchor="middle"
            fontSize={14}
            fill="var(--code-text)"
          >
            {isVisited ? "·" : ch}
          </text>
        </g>
      );
    }
  }
  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${vh}`} style={{ maxHeight: 280 }}>
      {cells}
    </svg>
  );
}

const PRESETS = [
  { label: "LC — ABCCED", board: "ABCE\nSFCS\nADEE", word: "ABCCED" },
  { label: "LC — ABCB ✗", board: "ABCE\nSFCS\nADEE", word: "ABCB" },
  { label: "Tiny ✓", board: "AB\nCD", word: "ABD" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [boardStr, setBoardStr] = useState(PRESETS[0].board);
  const [wordStr, setWordStr] = useState(PRESETS[0].word);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    const parsed = parseBoard(boardStr);
    if (!parsed) {
      setSteps([]);
      setParseError("Each row must have the same length (use letters only per row).");
      return;
    }
    setParseError(null);
    const { steps: s, error } = simulate(parsed, wordStr);
    if (error) {
      setParseError(error);
      setSteps([]);
      return;
    }
    setSteps(s);
    setSi(0);
  }, [boardStr, wordStr]);

  const step = steps[si] ?? null;
  const last = steps.length ? steps[steps.length - 1] : null;
  const finalOk = last?.phase === "done" && last.ok;
  const ann = lineAnnotations(step);
  const focusR = step?.phase === "recurse" ? step.nr : step?.r;
  const focusC = step?.phase === "recurse" ? step.nc : step?.c;

  const hl = (i) => step && step.line === i;
  const hlOuter = step && step.line === -1 && step.phase === "outer";

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1 flex-wrap">
        <span className="text-xl">🔤</span>
        <h1 className="font-semibold text-base">Word Search</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Backtracking · Grid DFS</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-4">
                    Given an <strong>m × n</strong> character grid <strong>board</strong> and a string <strong>word</strong>, return <strong>true</strong> if you can trace <strong>word</strong> through <strong>sequentially adjacent</strong> cells (up, down, left, right). The <strong>same cell may not be reused</strong> in one path (no diagonal moves).
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { sig: "boolean exist(char[][] board, String word)", desc: "Return whether word exists as a path on the grid using each cell at most once per path." },
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
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — classic board</p>
                  <CodeBlock language="text">{`Board:
  A B C E
  S F C S
  A D E E

word = "ABCCED"  →  true   (e.g. A→B→C→C→E→D along a valid path)
word = "ABCB"    →  false  (would need to reuse 'B' or 'C")

Idea: DFS from every cell that matches word[0]; mark cells with '#' while exploring; backtrack by restoring the letter when a branch fails.`}</CodeBlock>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>DFS + choose / unchoose</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        From a cell that matches the current letter, try four neighbors for the next index. Treat “using” a cell as a choice you undo if no neighbor completes the word.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">mark → recurse → restore</p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>In-place visited marking</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Temporarily set <code>board[r][c] = '#'</code> so you do not revisit the cell on this path. Restore the original character when backtracking so other paths or start positions see the real letter.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">O(1) space per layer vs extra visited[][]</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`boolean search(r, c, board, word, index) {
  if (index == word.length()) return true;
  if (outOfBounds || board[r][c] != word.charAt(index)) return false;

  char temp = board[r][c];
  board[r][c] = '#';                    // choose (mark visited)
  for (each neighbor (nr, nc))
    if (search(nr, nc, board, word, index + 1)) return true;
  board[r][c] = temp;                 // unchoose
  return false;
}

// exist: for each cell, if board[i][j] == word.charAt(0) && search(i, j, ...)
//         return true;`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    On success, you can return immediately without restoring along the winning branch—LeetCode only needs a boolean. Failed branches must restore so the grid stays valid for other DFS paths.
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(m·n·3^L)", s: "L = word length; from each cell, ≤3 new directions (no backstep)" },
                      { l: "SPACE", v: "O(L)", s: "Recursion depth equals word length" },
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
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

          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map(p => (
                      <Button
                        key={p.label}
                        size="sm"
                        variant={boardStr === p.board && wordStr === p.word ? "flat" : "bordered"}
                        color={boardStr === p.board && wordStr === p.word ? "primary" : "default"}
                        onPress={() => { setBoardStr(p.board); setWordStr(p.word); }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Input label="word" value={wordStr} onValueChange={setWordStr} placeholder="ABCCED" variant="bordered" size="sm" className="mb-3" />
                  <p className="text-xs text-default-500 mb-1">Board (one row per line, same width)</p>
                  <textarea
                    className="w-full min-h-[100px] text-sm font-mono rounded-lg px-3 py-2 border border-default-200 bg-content1"
                    value={boardStr}
                    onChange={e => setBoardStr(e.target.value)}
                    spellCheck={false}
                  />
                  {parseError && (
                    <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: `${RED}18`, border: `1px solid ${RED}55`, color: RED }}>
                      {parseError}
                    </div>
                  )}
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Debugger</p>
                    <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                      {si + 1}/{steps.length}
                    </p>
                    <p className="text-xs text-default-500 mb-4">
                      Phase: <span style={{ color: TEAL }}>{step?.phase}</span>
                      {" · "}
                      {step?.phase === "done" ? (
                        <span style={{ color: finalOk ? TEAL : RED }}>{finalOk ? "✓ FOUND" : "✗ NO PATH"}</span>
                      ) : (
                        <>
                          Cell: <span style={{ color: GOLD }}>({focusR ?? "—"}, {focusC ?? "—"})</span>
                          {" · "}
                          Index: <span style={{ color: BLUE }}>{step?.idx ?? "—"}</span>
                          {" · "}
                          <span style={{ color: step?.phase === "reject" || step?.phase === "restore" ? GOLD : TEAL }}>{step?.note}</span>
                        </>
                      )}
                    </p>
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={hlOuter} annotation={hlOuter ? ann[0] : "scan for word.charAt(0)"} annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>if (word.charAt(0) == board[i][j] && search(i, j, board, word, 0))</span>
                      </CodeLine>
                      <CodeLine highlight={hl(0)} annotation={ann[0] || (step ? `index=${step.idx}, len=${step.word?.length}` : "")} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>if (index == word.length()) return true;</span>
                      </CodeLine>
                      <CodeLine highlight={hl(1)} annotation={ann[1] || "bounds + match current letter"} annotationColor={step?.phase === "reject" ? RED : BLUE}>
                        <span style={{ color: "var(--code-muted)" }}>if (invalid || board[r][c] != word.charAt(index)) return false;</span>
                      </CodeLine>
                      <CodeLine highlight={hl(2)} annotation={ann[2] || "save letter, mark '#'" } annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>char temp = board[r][c]; board[r][c] = '#';</span>
                      </CodeLine>
                      <CodeLine highlight={hl(3)} annotation={ann[3] || "explore 4 neighbors with index + 1"} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>for (d) if (search(r+d[0], c+d[1], ..., index + 1)) return true;</span>
                      </CodeLine>
                      <CodeLine highlight={hl(4)} annotation={ann[4] || "backtrack: restore letter"} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>board[r][c] = temp; return false;</span>
                      </CodeLine>
                    </div>
                    <div className="rounded-xl p-5 mb-4 overflow-x-auto" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">Grid ( · = cell marked visited on current path)</p>
                      <GridViz board={step?.board} focusR={focusR} focusC={focusC} />
                    </div>
                    <div className="flex gap-2">
                      <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                      <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                  <CodeBlock language="java">{`/*
 * LeetCode 79 — Word Search
 *
 * Given an m x n grid of characters board and a string word, return true if word
 * can be constructed from letters of sequentially adjacent cells (horizontally or
 * vertically). The same cell may not be used more than once.
 *
 * Approach: Backtracking DFS — try each cell as a start if it matches word[0];
 * mark visited in-place with '#', explore four directions, then restore.
 *
 * Complexity:
 *   Time:  O(m * n * 3^L) — L = word length; first step has up to 4 neighbors, then 3
 *   Space: O(L) — recursion depth
 */

public class WordSearch {
    public boolean exist(char[][] board, String word) {
        int m = board.length;
        int n = board[0].length;

        // Any cell matching the first letter can be the start of a path
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (word.charAt(0) == board[i][j] && search(i, j, board, word, 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean search(int r, int c, char[][] board, String word, int index) {
        // Matched every character
        if (index == word.length()) {
            return true;
        }

        // Out of bounds, already visited ('#'), or letter mismatch
        if (r < 0 || c < 0 || r >= board.length || c >= board[0].length
                || board[r][c] != word.charAt(index)) {
            return false;
        }

        // Mark visited so we cannot reuse this cell on the current path
        char temp = board[r][c];
        board[r][c] = '#';
        int[][] directions = new int[][] { { -1, 0 }, { 0, -1 }, { 1, 0 }, { 0, 1 } };

        for (int[] d : directions) {
            if (search(r + d[0], c + d[1], board, word, index + 1)) {
                return true; // success: leave markers (caller returns immediately)
            }
        }

        // Backtrack: restore cell for other paths / other start positions
        board[r][c] = temp;
        return false;
    }
}`}</CodeBlock>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "if (word.charAt(0) == board[i][j] && search(..., 0))", exp: "Only cells matching the first character can start a valid path; run DFS from index 0." },
                      { line: "if (index == word.length()) return true;", exp: "Base case: every character of word was matched in order along the path." },
                      { line: "if (r < 0 || ... || board[r][c] != word.charAt(index))", exp: "Reject: off the grid, hit a previously used cell ('#'), or wrong letter for this step." },
                      { line: "board[r][c] = '#'", exp: "Choose: mark the cell so deeper recursion cannot step on it again on this path." },
                      { line: "search(r + d[0], c + d[1], ..., index + 1)", exp: "Recurse to neighbors for the next character; if any branch returns true, propagate success." },
                      { line: "board[r][c] = temp", exp: "Unchoose: restore the letter so other branches or other starting cells can use this cell." },
                    ].map(({ line, exp }) => (
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono max-w-[48%] break-all" style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>{line}</code>
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
                      { icon: "📍", color: TEAL, tip: "Grid backtracking: mark → explore 4 dirs → unmark; same pattern as counting islands variants with path constraints." },
                      { icon: "⚠️", color: GOLD, tip: "Do not forget to restore on failure; otherwise the board is corrupted for the next start cell or sibling branch." },
                      { icon: "🔄", color: BLUE, tip: "Related: Word Search II (Trie + DFS), unique paths, rat in a maze." },
                      { icon: "💡", color: TEAL, tip: "Using '#' (or a bitmask) avoids a separate visited[][] while keeping O(1) extra state per cell on the stack." },
                      { icon: "🎯", color: BLUE, tip: "Pruning: bail out as soon as bounds or character mismatch — before allocating more recursion." },
                    ].map(({ icon, color, tip }) => (
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
    </div>
  );
}
