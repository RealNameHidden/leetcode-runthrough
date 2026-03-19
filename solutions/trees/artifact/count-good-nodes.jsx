export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

// ── Algorithm accent colors ───────────────────────────────────────────
const TEAL   = "#4ecca3";
const GOLD   = "#f6c90e";
const BLUE   = "#5dade2";
const RED    = "#ff6b6b";

// ── Build tree from array & record steps ──────────────────────────────
function buildAndWalk(arr) {
  if (!arr || arr.length === 0) return { tree: null, steps: [] };

  const nodes = arr.map((val, i) => ({ val, idx: i }));
  const tree = buildBST(nodes, 0, nodes.length - 1);
  const steps = [];

  function dfs(node, maxSoFar, depth, parentVal, side) {
    if (!node) return 0;

    const isGood = node.val >= maxSoFar;
    const newMax = Math.max(maxSoFar, node.val);

    steps.push({
      nodeVal: node.val,
      maxSoFar,
      isGood,
      newMax,
      depth,
      parentVal,
      side
    });

    const leftCount = dfs(node.left, newMax, depth + 1, node.val, "left");
    const rightCount = dfs(node.right, newMax, depth + 1, node.val, "right");

    return (isGood ? 1 : 0) + leftCount + rightCount;
  }

  const goodCount = dfs(tree, -Infinity, 0, null, null);
  return { tree, steps, goodCount };
}

function buildBST(arr, start, end) {
  if (start > end) return null;
  const mid = Math.floor((start + end) / 2);
  const node = { val: arr[mid].val, left: null, right: null };
  node.left = buildBST(arr, start, mid - 1);
  node.right = buildBST(arr, mid + 1, end);
  return node;
}

// ── Tree layout ───────────────────────────────────────────────────────
function layoutTree(root) {
  if (!root) return { nodes: [], edges: [], width: 0, height: 0 };
  const nodes = [], edges = [];

  function countDepth(n) {
    return n ? 1 + Math.max(countDepth(n.left), countDepth(n.right)) : 0;
  }

  const d = countDepth(root);
  const spread = Math.pow(2, Math.max(d - 2, 1)) * 38;

  function assign(node, depth, x, s) {
    if (!node) return;
    const y = depth * 64 + 32;
    nodes.push({ val: node.val, x, y });
    if (node.left)  {
      edges.push({ x1: x, y1: y, x2: x - s, y2: (depth + 1) * 64 + 32 });
      assign(node.left, depth + 1, x - s, s / 2);
    }
    if (node.right) {
      edges.push({ x1: x, y1: y, x2: x + s, y2: (depth + 1) * 64 + 32 });
      assign(node.right, depth + 1, x + s, s / 2);
    }
  }

  assign(root, 0, Math.max(spread, 100), spread / 2);
  const minX = Math.min(...nodes.map(n => n.x));
  nodes.forEach(n => (n.x -= minX - 36));
  edges.forEach(e => { e.x1 -= minX - 36; e.x2 -= minX - 36; });
  return {
    nodes,
    edges,
    width: Math.max(...nodes.map(n => n.x)) + 36,
    height: Math.max(...nodes.map(n => n.y)) + 36
  };
}

// ── Tree SVG ──────────────────────────────────────────────────────────
function TreeSVG({ tree, highlightVal, goodVals }) {
  if (!tree) return <p className="text-center text-default-400 py-8">—</p>;

  const { nodes, edges, width, height } = layoutTree(tree);
  const goodSet = new Set(goodVals || []);

  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block", margin: "0 auto" }}>
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="var(--viz-border)" strokeWidth={1.5} />
      ))}
      {nodes.map((n, i) => {
        const isHL = n.val === highlightVal;
        const isGood = goodSet.has(n.val);
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={19}
              fill={isHL ? TEAL : isGood ? `${TEAL}2a` : "var(--viz-node-bg)"}
              stroke={isHL ? TEAL : isGood ? TEAL : "var(--viz-border)"}
              strokeWidth={isHL ? 2.5 : isGood ? 1.5 : 1.5}
              style={{
                filter: isHL ? `drop-shadow(0 0 8px ${TEAL}88)` : "none",
                transition: "all 0.3s"
              }} />
            <text x={n.x} y={n.y + 5} textAnchor="middle"
              fill={isHL ? "#0b0f0e" : isGood ? TEAL : "var(--viz-muted)"}
              fontSize={12} fontWeight={isHL || isGood ? 800 : 500}
              fontFamily="monospace">
              {n.val}
            </text>
            {isGood && !isHL && (
              <text x={n.x} y={n.y - 28} textAnchor="middle"
                fontSize={10} fill={TEAL} fontWeight={700}>✓</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Presets ───────────────────────────────────────────────────────────
const PRESETS = [
  { label: "Simple", arr: [3, 1, 4, 1, 5] },
  { label: "Ascending", arr: [1, 2, 3, 4, 5] },
  { label: "Descending", arr: [5, 4, 3, 2, 1] },
  { label: "Mixed", arr: [9, 1, 4, 6, 3, 7] },
];

// ── Value badge ───────────────────────────────────────────────────────
function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 5px",
      marginLeft: 2,
      borderRadius: 4,
      background: `${color}28`,
      color,
      fontWeight: 700,
      fontSize: 12
    }}>
      {children}
    </span>
  );
}

// ── Code line ──────────────────────────────────────────────────────────
function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
      padding: "6px 16px",
      background: highlight ? "rgba(78,204,163,0.08)" : "transparent",
      borderLeft: `3px solid ${highlight ? TEAL : "transparent"}`,
      transition: "background 0.2s"
    }}>
      <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.5, flexShrink: 0 }}>
        {children}
      </div>
      {annotation && (
        <div style={{
          fontSize: 11,
          color: annotationColor,
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          opacity: 0.85
        }}>
          // {annotation}
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Visualizer");
  const [arrStr, setArrStr] = useState("3,1,4,1,5");
  const [tree, setTree] = useState(null);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [error, setError] = useState("");
  const [goodCount, setGoodCount] = useState(0);

  useEffect(() => {
    try {
      const arr = arrStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (arr.length === 0) {
        setError("Array must be non-empty");
        return;
      }
      setError("");
      const { tree: t, steps: s, goodCount: gc } = buildAndWalk(arr);
      setTree(t);
      setSteps(s);
      setGoodCount(gc);
      setSi(0);
    } catch {
      setError("Invalid input");
    }
  }, [arrStr]);

  const step = steps[si] || null;
  const goodVals = steps.slice(0, si + 1).filter(s => s.isGood).map(s => s.nodeVal);

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">✨</span>
        <h1 className="font-semibold text-base">Count Good Nodes in Binary Tree</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Tree · DFS</Chip>
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

          {/* ── INTUITION ─────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>What's a "good" node?</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        A node is <strong>good</strong> if its value is <strong>≥ the max value from root to it</strong>.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">
                        Root is always good (no parent max yet)
                      </p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>How to track it</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Pass down the <strong>max value seen so far</strong> on the current path from root.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">
                        Update max = Math.max(max, node.val)
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Recursive Template</p>
                  <CodeBlock>{`int dfs(TreeNode root, int maxVal) {
  if (root == null) return 0;

  // Update max on current path
  maxVal = Math.max(maxVal, root.val);

  // Count this node if it's good
  int count = (root.val >= maxVal) ? 1 : 0;

  // Add counts from left and right
  count += dfs(root.left, maxVal);
  count += dfs(root.right, maxVal);

  return count;
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    Determine if current node is good <strong>before</strong> recursing to children — once you update maxVal, all descendants will use the new maximum.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[{ l: "TIME", v: "O(n)", s: "Visit each node once" }, { l: "SPACE", v: "O(h)", s: "Recursion stack height" }].map(({ l, v, s }) => (
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

          {/* ── VISUALIZER ────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map(p => (
                      <Button
                        key={p.label}
                        size="sm"
                        variant={arrStr === p.arr.join(",") ? "flat" : "bordered"}
                        color={arrStr === p.arr.join(",") ? "primary" : "default"}
                        onPress={() => setArrStr(p.arr.join(","))}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Input
                    label="Tree values (comma-separated)"
                    value={arrStr}
                    onValueChange={setArrStr}
                    variant="bordered"
                    size="sm"
                    classNames={{ label: "!text-[#4ecca3]" }}
                  />
                  {error && (
                    <div className="mt-3 px-3 py-2 rounded-lg text-xs text-danger bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800">
                      {error}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Result */}
              {!error && tree && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Result</p>
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: TEAL }}>{goodCount}</p>
                      <p className="text-sm text-default-400 mt-2">good nodes found</p>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Debugger */}
              {!error && steps.length > 0 && step && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>
                    <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                      {si + 1}/{steps.length}
                    </p>

                    {/* Info */}
                    <p className="text-xs text-default-500 mb-4">
                      Node: <span className="font-semibold" style={{ color: TEAL }}>{step.nodeVal}</span>
                      {" "} · Max from root: <span className="font-semibold" style={{ color: GOLD }}>{step.maxSoFar === -Infinity ? "−∞" : step.maxSoFar}</span>
                      {" "} · <span className="font-semibold" style={{ color: step.isGood ? TEAL : RED }}>
                        {step.isGood ? "✓ GOOD" : "✗ Not good"}
                      </span>
                    </p>

                    {/* Code */}
                    <div className="rounded-xl overflow-hidden mb-4 font-mono text-xs" style={{ background: "var(--code-bg)", color: "var(--code-text)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight annotation={`${step.nodeVal} >= ${step.maxSoFar === -Infinity ? "−∞" : step.maxSoFar}`} annotationColor={TEAL}>
                        <span style={{ color: BLUE }}>if </span>
                        <span style={{ color: "var(--code-muted)" }}>node.val</span>
                        <V color={TEAL}>{step.nodeVal}</V>
                        <span style={{ color: "var(--code-muted)" }}>{" >= maxVal"}</span>
                        <V color={GOLD}>{step.maxSoFar === -Infinity ? "−∞" : step.maxSoFar}</V>
                      </CodeLine>

                      <CodeLine annotation={`Will become ${step.newMax}`} annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>maxVal = Math.max(maxVal, node.val) → </span>
                        <V color={GOLD}>{step.newMax}</V>
                      </CodeLine>

                      <CodeLine annotation={step.isGood ? "count++" : "no change"} annotationColor={step.isGood ? TEAL : RED}>
                        <span style={{ color: "var(--code-muted)" }}>count += </span>
                        <span style={{ color: step.isGood ? TEAL : RED, fontWeight: 800 }}>
                          {step.isGood ? "1" : "0"}
                        </span>
                      </CodeLine>
                    </div>

                    {/* Tree */}
                    <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">bright = current · teal = good</p>
                      <TreeSVG tree={tree} highlightVal={step.nodeVal} goodVals={goodVals} />
                    </div>

                    <div className="flex gap-2">
                      <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                        onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                      <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                        onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Final tree */}
              {!error && tree && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Tree</p>
                    <div className="rounded-xl p-6 flex flex-col items-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <TreeSVG tree={tree} goodVals={steps.filter(s => s.isGood).map(s => s.nodeVal)} />
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          {/* ── CODE ──────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java — DFS Solution</p>
                  <CodeBlock>{`class Solution {
    public int goodNodes(TreeNode root) {
        if (root == null) return 0;
        return dfs(root, Integer.MIN_VALUE);
    }

    private int dfs(TreeNode root, int maxVal) {
        if (root == null) return 0;

        // Update max value on current path
        maxVal = Math.max(maxVal, root.val);

        // Count this node if it's good
        int count = (root.val >= maxVal) ? 1 : 0;

        // Recurse left and right with updated max
        count += dfs(root.left, maxVal);
        count += dfs(root.right, maxVal);

        return count;
    }
}`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "goodNodes(TreeNode root)", exp: "Entry point. Start DFS from root with initial max of -∞ (or MIN_VALUE)." },
                      { line: "if (root == null) return 0", exp: "Base case: empty subtree contributes 0 good nodes." },
                      { line: "maxVal = Math.max(maxVal, root.val)", exp: "Update the max value seen so far on this path." },
                      { line: "root.val >= maxVal", exp: "Check if current node is good. Note: uses old maxVal before update, so ≥ is correct." },
                      { line: "dfs(root.left, maxVal)", exp: "Recurse left with the updated max. Left subtree will use new max." },
                      { line: "dfs(root.right, maxVal)", exp: "Recurse right with the updated max. Right subtree uses same max as left." },
                    ].map(({ line, exp }) => (
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono" style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>{line}</code>
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
                      { icon: "📍", color: TEAL, tip: "Pass state DOWN. Each level updates maxVal for its children." },
                      { icon: "⚖️", color: GOLD, tip: "Compare BEFORE you update. Use >= to include nodes equal to max." },
                      { icon: "🔄", color: BLUE, tip: "Accumulate counts from both subtrees. Left + right + current." },
                      { icon: "🚀", color: TEAL, tip: "Simple DFS = one pass through tree = O(n) time, O(h) space." },
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
    </div>
  );
}
