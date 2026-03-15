export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

// ── Algorithm accent colors (fixed, work on any background) ──────────────────
const TEAL   = "#4ecca3";
const GOLD   = "#f6c90e";
const BLUE   = "#5dade2";

// ── Build + record steps ─────────────────────────────────────────────────────
function buildTreeSteps(preorder, inorder) {
  const idxMap = {};
  inorder.forEach((v, i) => (idxMap[v] = i));
  const steps = [];
  let nodePointer = 0;
  function build(inStart, inEnd, depth, parentVal, side) {
    if (inStart > inEnd) return null;
    const rootVal = preorder[nodePointer];
    const mid = idxMap[rootVal];
    const capturedPtr = nodePointer;
    nodePointer++;
    steps.push({ rootVal, nodePointer: capturedPtr, mid, inStart, inEnd, depth, parentVal, side });
    const node = { val: rootVal, left: null, right: null };
    node.left  = build(inStart,   mid - 1, depth + 1, rootVal, "left");
    node.right = build(mid + 1,   inEnd,   depth + 1, rootVal, "right");
    return node;
  }
  const tree = build(0, preorder.length - 1, 0, null, null);
  return { tree, steps };
}

// ── Tree layout ──────────────────────────────────────────────────────────────
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
    if (node.left)  { edges.push({ x1:x, y1:y, x2:x-s, y2:(depth+1)*64+32 }); assign(node.left,  depth+1, x-s, s/2); }
    if (node.right) { edges.push({ x1:x, y1:y, x2:x+s, y2:(depth+1)*64+32 }); assign(node.right, depth+1, x+s, s/2); }
  }
  assign(root, 0, Math.max(spread, 100), spread / 2);
  const minX = Math.min(...nodes.map(n => n.x));
  nodes.forEach(n => (n.x -= minX - 36));
  edges.forEach(e => { e.x1 -= minX-36; e.x2 -= minX-36; });
  return { nodes, edges, width: Math.max(...nodes.map(n=>n.x))+36, height: Math.max(...nodes.map(n=>n.y))+36 };
}

// ── Tree SVG ─────────────────────────────────────────────────────────────────
function TreeSVG({ tree, highlightVal, builtVals }) {
  if (!tree) return <p className="text-center text-default-400 py-8">—</p>;
  const { nodes, edges, width, height } = layoutTree(tree);
  const builtSet = new Set(builtVals || []);
  return (
    <svg width={width} height={height} style={{ overflow:"visible", display:"block", margin:"0 auto" }}>
      {edges.map((e,i) => (
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke="var(--viz-border)" strokeWidth={1.5}/>
      ))}
      {nodes.map((n,i) => {
        const isHL = n.val === highlightVal;
        const isDone = builtSet.has(n.val) && !isHL;
        return (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={19}
              fill={isHL ? TEAL : isDone ? `${TEAL}1a` : "var(--viz-node-bg)"}
              stroke={isHL ? TEAL : isDone ? `${TEAL}66` : "var(--viz-border)"}
              strokeWidth={isHL ? 2.5 : 1.5}
              style={{ filter: isHL ? `drop-shadow(0 0 8px ${TEAL}88)` : "none", transition:"all 0.3s" }}/>
            <text x={n.x} y={n.y+5} textAnchor="middle"
              fill={isHL ? "#0b0f0e" : isDone ? TEAL : "var(--viz-muted)"}
              fontSize={12} fontWeight={isHL?800:500} fontFamily="monospace">{n.val}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: "LC Example 1", pre: "3,9,20,15,7",   in: "9,3,15,20,7"   },
  { label: "LC Example 2", pre: "1,2",            in: "2,1"           },
  { label: "Balanced 7",   pre: "4,2,1,3,6,5,7", in: "1,2,3,4,5,6,7" },
  { label: "Right-skewed", pre: "1,2,3,4",        in: "1,2,3,4"       },
];

// ── Inline value badge ───────────────────────────────────────────────────────
function V({ children, color }) {
  return (
    <span style={{ display:"inline-block", padding:"1px 5px", marginLeft:2, borderRadius:4, background:`${color}28`, color, fontWeight:700, fontSize:12 }}>
      {children}
    </span>
  );
}

// ── Code line ────────────────────────────────────────────────────────────────
function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{
      display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12,
      padding:"6px 16px",
      background: highlight ? "rgba(78,204,163,0.08)" : "transparent",
      borderLeft: `3px solid ${highlight ? TEAL : "transparent"}`,
      transition:"background 0.2s",
    }}>
      <div style={{ fontSize:12, fontFamily:"monospace", lineHeight:1.5, flexShrink:0 }}>
        {children}
      </div>
      {annotation && (
        <div style={{ fontSize:11, color:annotationColor, whiteSpace:"nowrap", fontFamily:"monospace", opacity:0.85 }}>
          // {annotation}
        </div>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]       = useState("Visualizer");
  const [preStr, setPreStr] = useState("3,9,20,15,7");
  const [inStr,  setInStr]  = useState("9,3,15,20,7");
  const [steps,  setSteps]  = useState([]);
  const [si,     setSi]     = useState(0);
  const [tree,   setTree]   = useState(null);
  const [error,  setError]  = useState("");

  useEffect(() => {
    try {
      const pre = preStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
      const ino = inStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
      if (pre.length===0 || pre.length!==ino.length) { setError("Arrays must be non-empty and equal length"); return; }
      if ([...pre].sort((a,b)=>a-b).join()!==[...ino].sort((a,b)=>a-b).join()) { setError("Arrays must contain the same values"); return; }
      setError("");
      const { tree:t, steps:s } = buildTreeSteps(pre, ino);
      setTree(t); setSteps(s); setSi(0);
    } catch { setError("Invalid input"); }
  }, [preStr, inStr]);

  const step      = steps[si] || null;
  const builtVals = steps.slice(0, si+1).map(s=>s.rootVal);

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🌳</span>
        <h1 className="font-semibold text-base">Construct Binary Tree · Preorder + Inorder</h1>
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

          {/* ── INTUITION ───────────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea — Two Simple Roles</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background:`${TEAL}0d`, borderColor:`${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color:TEAL }}>PREORDER = the tape 📼</p>
                      <div className="flex gap-1.5 mb-3">
                        {[3,9,20,15,7].map((v,i) => (
                          <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono`}
                            style={{ background:i===0?`${TEAL}28`:"var(--viz-surface)", border:`1px solid ${i===0?TEAL:"var(--viz-border)"}`, color:i===0?TEAL:"var(--viz-muted)" }}>
                            {v}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs leading-relaxed text-default-500">One pointer: <code style={{color:TEAL}}>nodePointer++</code> on every call. No window slicing.</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background:`${GOLD}0d`, borderColor:`${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color:GOLD }}>INORDER = the fence ✂️</p>
                      <div className="flex gap-1.5 mb-3">
                        {[9,3,15,20,7].map((v,i) => (
                          <div key={i} className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono"
                            style={{ background:i===1?`${GOLD}28`:"var(--viz-surface)", border:`1px solid ${i===1?GOLD:"var(--viz-border)"}`, color:i===1?GOLD:"var(--viz-muted)" }}>
                            {v}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs leading-relaxed text-default-500">Root position splits left vs right subtrees.</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Recursive Template</p>
                  <CodeBlock>{`build(inStart, inEnd) {
  if (inStart > inEnd) return null;   // empty window

  int rootVal = pre[nodePointer++];  // take off the tape
  int mid = map.get(rootVal);          // O(1) lookup

  root.left  = build(inStart, mid - 1);
  root.right = build(mid + 1, inEnd);
  return root;
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background:`${GOLD}0d`, borderColor:`${GOLD}44` }}>
                    <span style={{color:GOLD}} className="font-bold">⚠️ Order matters: </span>
                    left child must be called <strong className="text-foreground">before</strong> right — preorder visits left subtree first.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[{l:"TIME",v:"O(n)",s:"Each node visited once"},{l:"SPACE",v:"O(n)",s:"HashMap + O(h) call stack"}].map(({l,v,s})=>(
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-1">{l}</p>
                        <p className="font-bold text-base" style={{color:TEAL}}>{v}</p>
                        <p className="text-xs text-default-400 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* ── VISUALIZER ──────────────────────────────────────────── */}
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
                        variant={preStr===p.pre && inStr===p.in ? "flat" : "bordered"}
                        color={preStr===p.pre && inStr===p.in ? "primary" : "default"}
                        onPress={() => { setPreStr(p.pre); setInStr(p.in); }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Input
                      label="preorder"
                      value={preStr}
                      onValueChange={setPreStr}
                      variant="bordered"
                      size="sm"
                      className="flex-1"
                      classNames={{ label: "!text-[#4ecca3]" }}
                    />
                    <Input
                      label="inorder"
                      value={inStr}
                      onValueChange={setInStr}
                      variant="bordered"
                      size="sm"
                      className="flex-1"
                      classNames={{ label: "!text-[#f6c90e]" }}
                    />
                  </div>
                  {error && (
                    <div className="mt-3 px-3 py-2 rounded-lg text-xs text-danger bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800">
                      {error}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Debugger */}
              {!error && steps.length > 0 && step && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Live Debugger</p>

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="text-xs font-mono text-default-500"><strong style={{ color: TEAL }}>{si + 1}</strong> / {steps.length}</span>
                    </div>

                    {/* context */}
                    <p className="text-xs text-default-500 mb-3">
                      {step.parentVal !== null
                        ? <>build() as <span className="font-semibold" style={{color:step.side==="left"?TEAL:BLUE}}>{step.side} child</span> of node <span className="font-semibold" style={{color:GOLD}}>{step.parentVal}</span></>
                        : <>build() — <span className="font-semibold" style={{color:TEAL}}>root call</span></>}
                    </p>

                    {/* code block */}
                    <div className="rounded-xl overflow-hidden mb-4 font-mono text-xs" style={{ background:"var(--code-bg)", color:"var(--code-text)", border:"1px solid var(--code-border)" }}>
                      {/* signature */}
                      <div className="px-4 py-2 text-xs border-b" style={{ background:"rgba(0,0,0,0.3)", borderColor:"var(--code-border)" }}>
                        <span style={{color:"var(--code-muted)"}}>TreeNode </span>
                        <span style={{color:TEAL}}>build</span>
                        <span style={{color:"var(--code-muted)"}}>(pre, inStart=</span>
                        <V color={GOLD}>{step.inStart}</V>
                        <span style={{color:"var(--code-muted)"}}>, inEnd=</span>
                        <V color={GOLD}>{step.inEnd}</V>
                        <span style={{color:"var(--code-muted)"}}>)</span>
                      </div>

                      <CodeLine annotation={`${step.inStart} > ${step.inEnd} = false`} annotationColor="var(--code-muted)">
                        <span style={{color:BLUE}}>if </span><span style={{color:"var(--code-muted)"}}>inStart</span><V color={GOLD}>{step.inStart}</V>
                        <span style={{color:"var(--code-muted)"}}> {">"} inEnd</span><V color={GOLD}>{step.inEnd}</V>
                        <span style={{color:"var(--code-muted)"}}>) return null;</span>
                      </CodeLine>

                      <CodeLine highlight annotation={`rootVal = ${step.rootVal}`} annotationColor={TEAL}>
                        <span style={{color:"var(--code-muted)"}}>int rootVal = pre[nodePointer</span>
                        <V color={TEAL}>{step.nodePointer}</V>
                        <span style={{color:"var(--code-muted)"}}>++] → </span>
                        <span style={{color:TEAL, fontWeight:800}}>{step.rootVal}</span>
                      </CodeLine>

                      <CodeLine annotation={`root at inorder[${step.mid}]`} annotationColor={GOLD}>
                        <span style={{color:"var(--code-muted)"}}>int mid = map.get(</span>
                        <V color={TEAL}>{step.rootVal}</V>
                        <span style={{color:"var(--code-muted)"}}>) → </span>
                        <span style={{color:GOLD, fontWeight:800}}>{step.mid}</span>
                      </CodeLine>

                      <CodeLine annotation={step.mid-1<step.inStart?"null (no left)":` ${step.mid-step.inStart} node(s) left`} annotationColor={step.mid-1<step.inStart?"var(--code-muted)":TEAL}>
                        <span style={{color:"var(--code-muted)"}}>root.left = build(</span>
                        <V color={GOLD}>{step.inStart}</V>
                        <span style={{color:"var(--code-muted)"}}>, </span>
                        <V color={GOLD}>{step.mid-1}</V>
                        <span style={{color:"var(--code-muted)"}}>)</span>
                      </CodeLine>

                      <CodeLine annotation={step.mid+1>step.inEnd?"null (no right)":` ${step.inEnd-step.mid} node(s) right`} annotationColor={step.mid+1>step.inEnd?"var(--code-muted)":BLUE}>
                        <span style={{color:"var(--code-muted)"}}>root.right = build(</span>
                        <V color={GOLD}>{step.mid+1}</V>
                        <span style={{color:"var(--code-muted)"}}>, </span>
                        <V color={GOLD}>{step.inEnd}</V>
                        <span style={{color:"var(--code-muted)"}}>)</span>
                      </CodeLine>

                      <CodeLine annotation={`node(${step.rootVal}) placed`} annotationColor={TEAL}>
                        <span style={{color:BLUE}}>return </span>
                        <span style={{color:"var(--code-muted)"}}>new TreeNode(</span>
                        <V color={TEAL}>{step.rootVal}</V>
                        <span style={{color:"var(--code-muted)"}}>);</span>
                      </CodeLine>
                    </div>

                    {/* Tree viz */}
                    <div className="rounded-xl p-5 mb-4 text-center" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">bright = current root · teal = already placed</p>
                      <TreeSVG tree={tree} highlightVal={step.rootVal} builtVals={builtVals}/>
                    </div>

                    <div className="flex gap-2">
                      <Button fullWidth variant="bordered" size="sm" isDisabled={si===0}
                        onPress={() => setSi(i => Math.max(0, i-1))}>← Prev</Button>
                      <Button fullWidth color="primary" size="sm" isDisabled={si===steps.length-1}
                        onPress={() => setSi(i => Math.min(steps.length-1, i+1))}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Final tree */}
              {!error && tree && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Tree</p>
                    <div className="rounded-xl p-6 flex flex-col items-center" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                      <TreeSVG tree={tree} builtVals={steps.map(s=>s.rootVal)}/>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          {/* ── CODE ────────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java — nodePointer Approach</p>
                  <CodeBlock>{`class Solution {
    int nodePointer = 0;
    Map<Integer,Integer> map = new HashMap<>();

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++)
            map.put(inorder[i], i);
        return build(preorder, 0, preorder.length - 1);
    }

    private TreeNode build(int[] pre, int inStart, int inEnd) {
        if (inStart > inEnd) return null;

        int rootVal = pre[nodePointer++];
        TreeNode root = new TreeNode(rootVal);
        int mid = map.get(rootVal);

        root.left  = build(pre, inStart, mid - 1);
        root.right = build(pre, mid + 1, inEnd);
        return root;
    }
}`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line:"int nodePointer = 0",       exp:"One shared pointer across all recursive calls. Increments automatically — no preL/preR math needed." },
                      { line:"if (inStart > inEnd)",       exp:"Only base case needed. Empty inorder window = no nodes in this subtree." },
                      { line:"pre[nodePointer++]",         exp:"Take next value off the preorder tape. Works because preorder visits root before children." },
                      { line:"map.get(rootVal)",           exp:"O(1) HashMap lookup. Gives absolute index of root in inorder, splitting left and right." },
                      { line:"build(inStart, mid-1)",      exp:"Left child: inorder window shrinks left of root. Called first so pointer advances through left subtree." },
                      { line:"build(mid+1, inEnd)",        exp:"Right child: inorder window is right of root. Pointer already past all left subtree nodes." },
                    ].map(({line,exp})=>(
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono" style={{ background:"var(--viz-surface)", color:TEAL, border:"1px solid var(--viz-border)" }}>{line}</code>
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
                      { icon:"📼", color:TEAL,  tip:"Preorder is a tape. One global nodePointer++. Never track preL/preR." },
                      { icon:"✂️", color:GOLD,  tip:"Inorder is the fence. Pass inStart/inEnd down — they define each subtree's boundaries." },
                      { icon:"⚠️", color:GOLD,  tip:"Left before right always. nodePointer must consume left subtree before right." },
                      { icon:"⚡", color:TEAL,  tip:"HashMap the inorder first. O(1) lookup per node = O(n) total." },
                      { icon:"🔁", color:BLUE,  tip:"LC 106 (Postorder + Inorder): same pattern but nodePointer starts at END and goes --. Right child before left." },
                    ].map(({icon,color,tip})=>(
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                        style={{ background:"var(--viz-surface)", border:`1px solid var(--viz-border)`, borderLeft:`3px solid ${color}` }}>
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
