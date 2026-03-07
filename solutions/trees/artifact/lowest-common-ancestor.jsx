export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT = "#f97316";
const GOLD = "#fbbf24";
const GREEN = "#10b981";
const BLUE = "#3b82f6";
const RED = "#ef4444";

class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function buildBST(values) {
  if (!values || values.length === 0) return null;
  const root = new TreeNode(values[0]);
  for (let i = 1; i < values.length; i++) {
    let node = root;
    while (true) {
      if (values[i] < node.val) {
        if (node.left) {
          node = node.left;
        } else {
          node.left = new TreeNode(values[i]);
          break;
        }
      } else {
        if (node.right) {
          node = node.right;
        } else {
          node.right = new TreeNode(values[i]);
          break;
        }
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

  function dfs(node, depth = 0) {
    if (!node) return null;

    steps.push({
      node: node.val,
      depth,
      action: 'visit',
      p: pVal,
      q: qVal,
      desc: `Visit node ${node.val}`
    });

    if (node.val > pVal && node.val > qVal) {
      steps.push({
        node: node.val,
        depth,
        action: 'go_left',
        reason: `${node.val} > both ${pVal} and ${qVal}`,
        desc: `${node.val} > max(${pVal}, ${qVal}), both targets are in left subtree`
      });
      return dfs(node.left, depth + 1);
    } else if (node.val < pVal && node.val < qVal) {
      steps.push({
        node: node.val,
        depth,
        action: 'go_right',
        reason: `${node.val} < both ${pVal} and ${qVal}`,
        desc: `${node.val} < min(${pVal}, ${qVal}), both targets are in right subtree`
      });
      return dfs(node.right, depth + 1);
    } else {
      steps.push({
        node: node.val,
        depth,
        action: 'found',
        reason: `${pVal} ≤ ${node.val} ≤ ${qVal}`,
        desc: `Found LCA: ${node.val}`,
        lca: node.val
      });
      return node;
    }
  }

  steps.push({
    action: 'start',
    desc: `Find LCA of ${pVal} and ${qVal} in BST`
  });

  const lca = dfs(root);

  if (lca) {
    steps.push({
      action: 'done',
      lca: lca.val,
      desc: `Lowest Common Ancestor: ${lca.val}`
    });
  }

  return steps;
}

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
    if (node.left) {
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

function TreeSVG({ tree, highlightNode, lcaNode }) {
  if (!tree) return <p className="text-center text-default-400 py-8">—</p>;

  const { nodes, edges, width, height } = layoutTree(tree);

  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block", margin: "0 auto" }}>
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="var(--viz-border)" strokeWidth={1.5} />
      ))}
      {nodes.map((n, i) => {
        const isHL = n.val === highlightNode;
        const isLCA = n.val === lcaNode;
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={19}
              fill={isLCA ? `${GREEN}2a` : isHL ? `${ACCENT}2a` : "var(--viz-node-bg)"}
              stroke={isLCA ? GREEN : isHL ? ACCENT : "var(--viz-border)"}
              strokeWidth={isLCA ? 2.5 : isHL ? 2.5 : 1.5}
              style={{
                filter: isLCA ? `drop-shadow(0 0 8px ${GREEN}88)` : isHL ? `drop-shadow(0 0 8px ${ACCENT}88)` : "none",
                transition: "all 0.3s"
              }} />
            <text x={n.x} y={n.y + 5} textAnchor="middle"
              fill={isLCA ? GREEN : isHL ? ACCENT : "var(--viz-muted)"}
              fontSize={12} fontWeight={isLCA || isHL ? 800 : 500}
              fontFamily="monospace">
              {n.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const PRESETS = [
  { label: "LC Example 1", treeStr: "6,2,8,0,4,7,9", p: 2, q: 8 },
  { label: "LC Example 2", treeStr: "6,2,8,0,4,7,9", p: 2, q: 4 },
  { label: "Simple", treeStr: "3,2,4", p: 2, q: 4 },
];

export default function App() {
  const [tab, setTab] = useState("Visualizer");
  const [treeInput, setTreeInput] = useState("6,2,8,0,4,7,9");
  const [pInput, setPInput] = useState("2");
  const [qInput, setQInput] = useState("8");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const p = parseInt(pInput);
    const q = parseInt(qInput);
    if (!isNaN(p) && !isNaN(q)) {
      setSteps(simulate(treeInput, p, q));
      setSi(0);
    }
  }, [treeInput, pInput, qInput]);

  const step = steps[si] || null;
  const stepColor = step?.action === 'done' ? GREEN : step?.action === 'found' ? GREEN : ACCENT;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🌳</span>
        <h1 className="font-semibold text-base">Lowest Common Ancestor of a BST</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Tree · BST</Chip>
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
                      <p className="text-xs font-bold mb-3" style={{ color: ACCENT }}>BST Property</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        If <strong>p &lt; node &lt; q</strong>, then node must be their LCA.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Left/right split = LCA found</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Efficient Navigation</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        No need to explore entire tree. Use BST property to prune paths.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Go left/right based on values</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                  <CodeBlock>{`TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
  // Both targets to the left?
  if (p.val < root.val && q.val < root.val) {
    return lowestCommonAncestor(root.left, p, q);
  }

  // Both targets to the right?
  if (p.val > root.val && q.val > root.val) {
    return lowestCommonAncestor(root.right, p, q);
  }

  // p and q split here (or one is root)
  return root;
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">💡 Key insight: </span>
                    The first node where p and q "split" (one on each side) is their LCA. This is the deepest common ancestor because BST has no crossing paths.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(h)", s: "Height of tree" },
                      { l: "SPACE", v: "O(h)", s: "Recursion stack" }
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
                      <Button
                        key={p.label}
                        size="sm"
                        variant={treeInput === p.treeStr && pInput === String(p.p) && qInput === String(p.q) ? "flat" : "bordered"}
                        color={treeInput === p.treeStr && pInput === String(p.p) && qInput === String(p.q) ? "primary" : "default"}
                        onPress={() => {
                          setTreeInput(p.treeStr);
                          setPInput(String(p.p));
                          setQInput(String(p.q));
                        }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-bold">Tree:</label>
                      <Input size="sm" placeholder="e.g., 6,2,8,0,4,7,9" value={treeInput} onValueChange={setTreeInput} variant="bordered" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">P Value:</label>
                      <Input size="sm" placeholder="2" value={pInput} onValueChange={setPInput} variant="bordered" />
                    </div>
                    <div>
                      <label className="text-xs font-bold">Q Value:</label>
                      <Input size="sm" placeholder="8" value={qInput} onValueChange={setQInput} variant="bordered" />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Tree Visualization</p>
                    <TreeSVG
                      tree={buildBST((treeInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))))}
                      highlightNode={step?.node}
                      lcaNode={step?.action === 'found' || step?.action === 'done' ? step?.lca : null}
                    />

                    <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
                      <div className="rounded-lg p-4 text-center" style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}33` }}>
                        <p className="text-xs text-default-500 mb-2">Node P</p>
                        <p className="text-2xl font-bold" style={{ color: BLUE }}>{pInput}</p>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: `${RED}0d`, border: `1px solid ${RED}33` }}>
                        <p className="text-xs text-default-500 mb-2">Node Q</p>
                        <p className="text-2xl font-bold" style={{ color: RED }}>{qInput}</p>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: `${GREEN}0d`, border: `1px solid ${GREEN}33` }}>
                        <p className="text-xs text-default-500 mb-2">LCA</p>
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>
                          {step?.action === 'found' || step?.action === 'done' ? step?.lca : '?'}
                        </p>
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
