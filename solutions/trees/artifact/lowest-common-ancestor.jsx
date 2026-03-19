export const difficulty = 'Medium'
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

class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

function buildBST(values) {
  if (!values || values.length === 0) return null;
  const root = new TreeNode(values[0]);
  for (let i = 1; i < values.length; i++) {
    let node = root;
    while (true) {
      if (values[i] < node.val) {
        if (node.left) { node = node.left; } else { node.left = new TreeNode(values[i]); break; }
      } else {
        if (node.right) { node = node.right; } else { node.right = new TreeNode(values[i]); break; }
      }
    }
  }
  return root;
}

function simulate(treeStr, pVal, qVal) {
  const values = treeStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const root = buildBST(values);
  if (!root) return [];

  const steps = [];

  steps.push({ action: 'start', node: null, desc: `Find LCA of p=${pVal} and q=${qVal} in BST` });

  function dfs(node, depth = 0) {
    if (!node) return null;
    steps.push({ node: node.val, depth, action: 'visit', p: pVal, q: qVal, desc: `Visit node ${node.val}` });

    if (node.val > pVal && node.val > qVal) {
      steps.push({ node: node.val, depth, action: 'go_left', desc: `${node.val} > both p(${pVal}) and q(${qVal}) → go left` });
      return dfs(node.left, depth + 1);
    } else if (node.val < pVal && node.val < qVal) {
      steps.push({ node: node.val, depth, action: 'go_right', desc: `${node.val} < both p(${pVal}) and q(${qVal}) → go right` });
      return dfs(node.right, depth + 1);
    } else {
      steps.push({ node: node.val, depth, action: 'found', lca: node.val, desc: `p(${pVal}) and q(${qVal}) split here → LCA = ${node.val}` });
      return node;
    }
  }

  const lca = dfs(root);
  if (lca) steps.push({ action: 'done', lca: lca.val, node: lca.val, desc: `Lowest Common Ancestor: ${lca.val}` });
  return steps;
}

function layoutTree(root) {
  if (!root) return { nodes: [], edges: [], width: 0, height: 0 };
  const nodes = [], edges = [];
  function countDepth(n) { return n ? 1 + Math.max(countDepth(n.left), countDepth(n.right)) : 0; }
  const d = countDepth(root);
  const spread = Math.pow(2, Math.max(d - 2, 1)) * 38;
  function assign(node, depth, x, s) {
    if (!node) return;
    const y = depth * 64 + 32;
    nodes.push({ val: node.val, x, y });
    if (node.left) { edges.push({ x1: x, y1: y, x2: x - s, y2: (depth + 1) * 64 + 32 }); assign(node.left, depth + 1, x - s, s / 2); }
    if (node.right) { edges.push({ x1: x, y1: y, x2: x + s, y2: (depth + 1) * 64 + 32 }); assign(node.right, depth + 1, x + s, s / 2); }
  }
  assign(root, 0, Math.max(spread, 100), spread / 2);
  const minX = Math.min(...nodes.map(n => n.x));
  nodes.forEach(n => (n.x -= minX - 36));
  edges.forEach(e => { e.x1 -= minX - 36; e.x2 -= minX - 36; });
  return { nodes, edges, width: Math.max(...nodes.map(n => n.x)) + 36, height: Math.max(...nodes.map(n => n.y)) + 36 };
}

function TreeSVG({ tree, highlightNode, lcaNode, pVal, qVal }) {
  if (!tree) return <p className="text-center text-default-400 py-8">—</p>;
  const { nodes, edges, width, height } = layoutTree(tree);
  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", display: "block", minWidth: Math.min(width, 200) }}>
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="var(--viz-border)" strokeWidth={1.5} />
        ))}
        {nodes.map((n, i) => {
          const isHL = n.val === highlightNode;
          const isLCA = n.val === lcaNode;
          const isP = n.val === pVal;
          const isQ = n.val === qVal;
          const stroke = isLCA ? TEAL : isHL ? GOLD : isP || isQ ? BLUE : "var(--viz-border)";
          const fill = isLCA ? `${TEAL}2a` : isHL ? `${GOLD}2a` : isP || isQ ? `${BLUE}2a` : "var(--viz-node-bg)";
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={19} fill={fill} stroke={stroke} strokeWidth={(isLCA || isHL) ? 2.5 : 1.5}
                style={{ filter: isLCA ? `drop-shadow(0 0 8px ${TEAL}88)` : isHL ? `drop-shadow(0 0 8px ${GOLD}88)` : "none", transition: "all 0.3s" }} />
              <text x={n.x} y={n.y + 5} textAnchor="middle" fill={isLCA ? TEAL : isHL ? GOLD : isP || isQ ? BLUE : "var(--viz-muted)"}
                fontSize={12} fontWeight={(isLCA || isHL) ? 800 : 500} fontFamily="monospace">
                {n.val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const PRESETS = [
  { label: "LC Example 1", treeStr: "6,2,8,0,4,7,9", p: 2, q: 8 },
  { label: "LC Example 2", treeStr: "6,2,8,0,4,7,9", p: 2, q: 4 },
  { label: "Simple", treeStr: "3,2,4", p: 2, q: 4 },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [treeInput, setTreeInput] = useState("6,2,8,0,4,7,9");
  const [pInput, setPInput] = useState("2");
  const [qInput, setQInput] = useState("8");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const p = parseInt(pInput);
    const q = parseInt(qInput);
    if (!isNaN(p) && !isNaN(q)) { setSteps(simulate(treeInput, p, q)); setSi(0); }
  }, [treeInput, pInput, qInput]);

  const step = steps[si] || null;
  const finalStep = steps[steps.length - 1];
  const tree = buildBST(treeInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)));
  const p = parseInt(pInput), q = parseInt(qInput);

  const actionColor = step?.action === 'found' || step?.action === 'done' ? TEAL
    : step?.action === 'go_left' || step?.action === 'go_right' ? GOLD
    : BLUE;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🌳</span>
        <h1 className="font-semibold text-base">Lowest Common Ancestor of a BST</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Tree · BST</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          {/* PROBLEM */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given a Binary Search Tree (BST) and two nodes <code>p</code> and <code>q</code>,
                  find their Lowest Common Ancestor (LCA). The LCA is defined as the deepest node
                  that is an ancestor of both <code>p</code> and <code>q</code> (a node is its own ancestor).
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)", desc: "Return the LCA node. All values are unique. p and q always exist in the tree." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — BST with p=2, q=8</p>
                <CodeBlock language="text">{`BST:         6
           /   \\
          2     8
         / \\   / \\
        0   4 7   9

Find LCA(p=2, q=8):
  At node 6: p(2) < 6 < q(8) → they split here!
  → LCA = 6

Find LCA(p=2, q=4):
  At node 6: both p(2) and q(4) < 6 → go left
  At node 2: p(2) <= 2 <= q(4) → they split here!
  → LCA = 2  (a node can be its own ancestor)`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Use BST Property</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      In a BST, left subtree has smaller values, right has larger. If p and q are both on one side, the LCA is also on that side.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">Prune by value comparison</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Split Point = LCA</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      The first node where p and q go different directions (one left, one right — or node equals p or q) is the LCA.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">p ≤ node ≤ q → found LCA</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                <CodeBlock>{`TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
  // Both smaller? Go left.
  if (p.val < root.val && q.val < root.val)
    return lowestCommonAncestor(root.left, p, q);

  // Both larger? Go right.
  if (p.val > root.val && q.val > root.val)
    return lowestCommonAncestor(root.right, p, q);

  // p and q split here (or one IS root) → LCA found
  return root;
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  We don't need to recurse into both subtrees like in a general binary tree. BST ordering lets us prune greedily — O(h) vs O(n).
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(h)", s: "Height of tree" },
                    { l: "SPACE", v: "O(h)", s: "Recursion stack" }
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
                  {PRESETS.map(pr => (
                    <Button key={pr.label} size="sm"
                      variant={treeInput === pr.treeStr && pInput === String(pr.p) && qInput === String(pr.q) ? "flat" : "bordered"}
                      color={treeInput === pr.treeStr && pInput === String(pr.p) && qInput === String(pr.q) ? "primary" : "default"}
                      onPress={() => { setTreeInput(pr.treeStr); setPInput(String(pr.p)); setQInput(String(pr.q)); }}>
                      {pr.label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-xs font-bold block mb-1">Tree (BST insert order):</label>
                    <Input size="sm" placeholder="e.g., 6,2,8,0,4,7,9" value={treeInput} onValueChange={setTreeInput} variant="bordered" /></div>
                  <div><label className="text-xs font-bold block mb-1">P:</label>
                    <Input size="sm" placeholder="2" value={pInput} onValueChange={setPInput} variant="bordered" /></div>
                  <div><label className="text-xs font-bold block mb-1">Q:</label>
                    <Input size="sm" placeholder="8" value={qInput} onValueChange={setQInput} variant="bordered" /></div>
                </div>
              </CardBody></Card>

              {steps.length > 0 && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  {/* Status line */}
                  <p className="text-xs text-default-500 mb-4">
                    Node: <V color={GOLD}>{step?.node ?? '—'}</V> ·
                    p: <V color={BLUE}>{pInput}</V> ·
                    q: <V color={BLUE}>{qInput}</V> ·
                    {(step?.action === 'found' || step?.action === 'done') && <V color={TEAL}>LCA = {step.lca}</V>}
                  </p>

                  {/* Live code block */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step?.action === 'visit'}
                      annotation={step?.action === 'visit' ? `node=${step.node}, p=${pInput}, q=${qInput}` : undefined}
                      annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>lowestCommonAncestor(root, p, q)</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'go_left'}
                      annotation={step?.action === 'go_left' ? `${step.node} > max(${pInput},${qInput})` : undefined}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}if (p &lt; root &amp;&amp; q &lt; root) → recurse left</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'go_right'}
                      annotation={step?.action === 'go_right' ? `${step.node} < min(${pInput},${qInput})` : undefined}
                      annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}if (p &gt; root &amp;&amp; q &gt; root) → recurse right</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.action === 'found' || step?.action === 'done'}
                      annotation={(step?.action === 'found' || step?.action === 'done') ? `LCA = ${step.lca}` : undefined}
                      annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>{"  "}return root {"// split point found"}</span>
                    </CodeLine>
                  </div>

                  {/* Tree viz */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">
                      <span style={{ color: GOLD }}>●</span> current &nbsp;
                      <span style={{ color: TEAL }}>●</span> LCA &nbsp;
                      <span style={{ color: BLUE }}>●</span> p / q
                    </p>
                    <TreeSVG
                      tree={tree}
                      highlightNode={step?.action === 'visit' || step?.action === 'go_left' || step?.action === 'go_right' ? step?.node : null}
                      lcaNode={step?.action === 'found' || step?.action === 'done' ? step?.lca : null}
                      pVal={p} qVal={q}
                    />
                  </div>

                  {/* Step description */}
                  <div className="rounded-lg px-4 py-3 text-sm font-mono mb-4" style={{ borderLeft: `3px solid ${actionColor}`, background: "var(--viz-surface)" }}>
                    {step?.desc}
                  </div>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <span className="text-xs self-center whitespace-nowrap">{si + 1} / {steps.length}</span>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State */}
              {finalStep?.lca != null && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                  <div className="rounded-xl p-6 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-2">Lowest Common Ancestor</p>
                    <p className="text-5xl font-bold mb-2" style={{ color: TEAL }}>{finalStep.lca}</p>
                    <p className="text-sm text-default-500">LCA of p={pInput} and q={qInput}</p>
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          {/* CODE */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                <CodeBlock>{`class Solution {
  public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    // Both nodes are in the left subtree
    if (p.val < root.val && q.val < root.val)
      return lowestCommonAncestor(root.left, p, q);

    // Both nodes are in the right subtree
    if (p.val > root.val && q.val > root.val)
      return lowestCommonAncestor(root.right, p, q);

    // p and q split at this node, OR root == p or root == q
    // Either way, root is the LCA
    return root;
  }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (p.val < root.val && q.val < root.val)", exp: "Both targets are less than root — by BST property, both must be in the left subtree." },
                    { line: "return lowestCommonAncestor(root.left, p, q)", exp: "Recurse into the left subtree. The LCA cannot be at or right of root if both are smaller." },
                    { line: "if (p.val > root.val && q.val > root.val)", exp: "Both targets are greater than root — both must be in the right subtree." },
                    { line: "return root (final case)", exp: "p and q straddle root (p < root < q, or p == root, or q == root). The split point is by definition the LCA." },
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
                    { icon: "📍", color: TEAL, tip: "BST LCA is O(h). General binary tree LCA (LC 236) is O(n) — you must check both subtrees without BST ordering." },
                    { icon: "⚠️", color: GOLD, tip: "Don't confuse with general Binary Tree LCA (LC 236). That problem can't prune — must recurse both sides." },
                    { icon: "🔄", color: BLUE, tip: "Iterative version: replace recursion with a while loop. Same logic, O(1) space instead of O(h) stack." },
                    { icon: "💡", color: TEAL, tip: "Key: 'a node is its own ancestor' — if root.val == p.val or root.val == q.val, root IS the LCA. The split-point logic handles this automatically." },
                    { icon: "🎯", color: GOLD, tip: "Related: LC 236 (general tree LCA), LC 1650 (LCA with parent pointers), LC 1123 (deepest leaves LCA)." },
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
