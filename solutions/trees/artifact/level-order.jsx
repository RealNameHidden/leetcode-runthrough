export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";

const INDIGO="#818cf8",CYAN="#67e8f9",YELLOW="#fbbf24",GREEN="#4ade80",VIOLET="#a78bfa",RED="#f87171";
const LEVEL_COLORS=[
  {fill:`${INDIGO}28`,stroke:INDIGO,text:INDIGO},
  {fill:`${CYAN}18`,stroke:CYAN,text:CYAN},
  {fill:`${YELLOW}18`,stroke:YELLOW,text:YELLOW},
  {fill:`${GREEN}18`,stroke:GREEN,text:GREEN},
  {fill:`${RED}18`,stroke:RED,text:RED},
];

function buildTree(arr){
  if(!arr.length||arr[0]==null)return null;
  const nodes=arr.map((v,i)=>v!=null?{val:v,id:i,left:null,right:null}:null);
  for(let i=0;i<nodes.length;i++){
    if(!nodes[i])continue;
    const l=2*i+1,r=2*i+2;
    if(l<nodes.length)nodes[i].left=nodes[l];
    if(r<nodes.length)nodes[i].right=nodes[r];
  }
  return nodes[0];
}
function assignPos(node,depth=0,left=0,right=1,pos={}){
  if(!node)return pos;
  pos[node.id]={x:(left+right)/2,y:depth};
  assignPos(node.left,depth+1,left,(left+right)/2,pos);
  assignPos(node.right,depth+1,(left+right)/2,right,pos);
  return pos;
}
function collectAll(node,out=[]){if(!node)return out;out.push(node);collectAll(node.left,out);collectAll(node.right,out);return out;}
function collectEdges(node,edges=[]){
  if(!node)return edges;
  if(node.left){edges.push([node.id,node.left.id]);collectEdges(node.left,edges);}
  if(node.right){edges.push([node.id,node.right.id]);collectEdges(node.right,edges);}
  return edges;
}

function simulateLevelOrder(root){
  if(!root)return[];
  const steps=[],queue=[root];
  let levelNum=0;
  steps.push({queue:[root.val],processing:[],levelVals:[],result:[],levelNum:-1,
    desc:`Add root (${root.val}) to queue`,nodeIds:new Set(),processedByLevel:{},phase:"init",activeId:null,levelSize:1});
  const processedByLevel={};
  while(queue.length>0){
    const levelSize=queue.length,levelVals=[];
    processedByLevel[levelNum]=[];
    steps.push({queue:queue.map(n=>n.val),processing:[],levelVals:[],result:Object.values(processedByLevel).map(v=>[...v]),
      levelNum,desc:`Level ${levelNum}: snapshot size=${levelSize}`,nodeIds:new Set(Object.values(processedByLevel).flat()),
      processedByLevel:JSON.parse(JSON.stringify(processedByLevel)),phase:"snapshot",activeId:null,levelSize});
    for(let i=0;i<levelSize;i++){
      const node=queue.shift();
      levelVals.push(node.val);
      processedByLevel[levelNum]=[...levelVals];
      const added=[];
      if(node.left){queue.push(node.left);added.push(node.left.val);}
      if(node.right){queue.push(node.right);added.push(node.right.val);}
      steps.push({queue:queue.map(n=>n.val),processing:levelVals,levelVals,result:Object.values(processedByLevel).map(v=>[...v]),
        levelNum,desc:`poll() → ${node.val}${added.length?`, enqueue [${added.join(",")}]`:" (leaf)"}`,
        nodeIds:new Set(Object.values(processedByLevel).flat()),processedByLevel:JSON.parse(JSON.stringify(processedByLevel)),
        phase:"poll",activeId:node.id,levelSize});
    }
    steps.push({queue:queue.map(n=>n.val),processing:[],levelVals:[],result:Object.values(processedByLevel).map(v=>[...v]),
      levelNum,desc:`Level ${levelNum} complete → add [${levelVals.join(",")}]`,
      nodeIds:new Set(Object.values(processedByLevel).flat()),processedByLevel:JSON.parse(JSON.stringify(processedByLevel)),
      phase:"levelDone",activeId:null,levelSize});
    levelNum++;
  }
  steps.push({queue:[],processing:[],levelVals:[],result:Object.values(processedByLevel).map(v=>[...v]),
    levelNum:-1,desc:`Queue empty → return result ✓`,nodeIds:new Set(Object.values(processedByLevel).flat()),
    processedByLevel:JSON.parse(JSON.stringify(processedByLevel)),phase:"done",activeId:null,levelSize:0});
  return steps;
}

function TreeViz({treeRoot,step}){
  const W=560,H=240;
  if(!treeRoot)return null;
  const pos=assignPos(treeRoot),allNodes=collectAll(treeRoot),edges=collectEdges(treeRoot);
  const px=x=>x*(W-60)+30,py=y=>y*62+36;
  const nodeLevel={};
  const bfs=(n,lv)=>{if(!n)return;nodeLevel[n.id]=lv;bfs(n.left,lv+1);bfs(n.right,lv+1);};
  bfs(treeRoot,0);
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{fontFamily:"monospace",overflow:"visible"}}>
      {edges.map(([aid,bid])=>{
        const a=pos[aid],b=pos[bid];
        return<line key={`${aid}-${bid}`} x1={px(a.x)} y1={py(a.y)} x2={px(b.x)} y2={py(b.y)} stroke="var(--viz-border)" strokeWidth={1.5} opacity={0.6}/>;
      })}
      {allNodes.map(node=>{
        const p=pos[node.id],lv=nodeLevel[node.id],col=LEVEL_COLORS[lv%LEVEL_COLORS.length];
        const isActive=step?.activeId===node.id,isDone=step?.processedByLevel?.[lv]?.includes(node.val);
        return(
          <g key={node.id}>
            {isActive&&<circle cx={px(p.x)} cy={py(p.y)} r={24} fill={`${col.stroke}20`}/>}
            <circle cx={px(p.x)} cy={py(p.y)} r={20}
              fill={isActive?col.fill:isDone?`${col.stroke}12`:"var(--viz-node-bg)"}
              stroke={isActive?col.stroke:isDone?`${col.stroke}70`:"var(--viz-border)"}
              strokeWidth={isActive?2.5:1.5}/>
            <text x={px(p.x)} y={py(p.y)} textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight={isActive?700:500}
              fill={isActive?col.text:isDone?`${col.stroke}cc`:"var(--viz-muted)"}>
              {node.val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const PRESETS=[
  {label:"Example 1",arr:[3,9,20,null,null,15,7]},
  {label:"Example 2",arr:[1,2,3,4,5]},
  {label:"Single",arr:[1]},
  {label:"Left skew",arr:[1,2,null,3,null,null,null,4]},
];

export default function App(){
  const [tab,setTab]=useState("Problem");
  const [preset,setPreset]=useState(0);
  const [treeRoot,setTreeRoot]=useState(null);
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);

  useEffect(()=>{
    const root=buildTree(PRESETS[preset].arr);
    setTreeRoot(root);
    setSteps(simulateLevelOrder(root));
    setSi(0);
  },[preset]);

  const step=steps[si];
  const phaseColor=step
    ?step.phase==="done"?GREEN:step.phase==="levelDone"?VIOLET:step.phase==="poll"?YELLOW:INDIGO
    :INDIGO;

  return(
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🌊</span>
        <h1 className="font-semibold text-base">Binary Tree Level Order Traversal</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="secondary" variant="flat">BFS · Queue</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k=>setTab(String(k))} variant="underlined" color="primary" size="sm">

          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed">
                  Given the <span style={{color:INDIGO}} className="font-semibold">root</span> of a binary tree, return the{" "}
                  <span style={{color:CYAN}} className="font-semibold">level order traversal</span> — left to right, level by level.
                </p>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example</p>
                <CodeBlock language="text">{`Input:  [3,9,20,null,null,15,7]
        3          ← level 0
       / \\
      9   20       ← level 1
         /  \\
        15   7     ← level 2

Output: [[3],[9,20],[15,7]]`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">🔑 The Key Trick: levelSize Snapshot</p>
                <p className="text-sm text-default-500 leading-relaxed mb-3">
                  Before processing a level, <strong style={{color:YELLOW}}>snapshot queue.size()</strong>. That number is exactly how many nodes are on the current level.
                </p>
                <CodeBlock language="java">{`// Queue entering level 1: [9, 20]
int levelSize = queue.size(); // = 2
for (int i = 0; i < levelSize; i++) {
    poll 9  → no children
    poll 20 → enqueue 15, 7
}
// After: queue = [15, 7]  ← level 2`}</CodeBlock>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">⚡ Complexity</p>
                <div className="flex gap-3">
                  {[{l:"TIME",v:"O(n)",s:"Every node once"},{l:"SPACE",v:"O(n)",s:"Queue ≤ widest level"}].map(({l,v,s})=>(
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <p className="text-xs text-default-400 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{color:INDIGO}}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Choose a Tree</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESETS.map((p,i)=>(
                    <Button key={i} size="sm" variant={preset===i?"flat":"bordered"}
                      color={preset===i?"primary":"default"} onPress={()=>setPreset(i)}>{p.label}</Button>
                  ))}
                </div>
              </CardBody></Card>

              {steps.length>0&&step&&(
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">BFS Simulation</p>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((s,i)=>{
                      const c=s.phase==="done"?GREEN:s.phase==="levelDone"?VIOLET:s.phase==="poll"?YELLOW:INDIGO;
                      return(
                        <button key={i} onClick={()=>setSi(i)}
                          className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                          style={{background:i===si?`${c}20`:"var(--viz-surface)",border:`1px solid ${i===si?c:"var(--viz-border)"}`,color:i===si?c:"var(--viz-muted)"}}>
                          {i===0?"init":i}
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-lg px-4 py-3 mb-4" style={{background:`${phaseColor}12`,border:`1px solid ${phaseColor}40`}}>
                    <p className="text-[10px] text-default-400 mb-0.5">STEP {si+1}/{steps.length}</p>
                    <p className="text-sm text-foreground">{step.desc}</p>
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                    <TreeViz treeRoot={treeRoot} step={step}/>
                  </div>
                  <div className="flex gap-4 mb-4 flex-wrap">
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider mb-2">Queue</p>
                      <div className="flex gap-1.5 flex-wrap min-h-8">
                        {step.queue.length===0
                          ?<span className="text-xs text-default-300 italic">empty</span>
                          :step.queue.map((v,i)=>(
                            <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)",color:"var(--viz-text)"}}>
                              {v}
                            </span>
                          ))}
                      </div>
                    </div>
                    {step.processing.length>0&&(
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider mb-2">Current Level</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {step.processing.map((v,i)=>(
                            <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{background:`${YELLOW}18`,border:`1px solid ${YELLOW}50`,color:YELLOW}}>{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider mb-2">Result so far</p>
                    <div className="flex gap-2 flex-wrap min-h-8">
                      {step.result.length===0
                        ?<span className="text-xs text-default-300 italic">[]</span>
                        :step.result.map((lvl,i)=>{
                          const col=LEVEL_COLORS[i%LEVEL_COLORS.length];
                          return(
                            <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                              style={{background:col.fill,border:`1px solid ${col.stroke}60`,color:col.text}}>
                              [{lvl.join(",")}]
                            </span>
                          );
                        })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si===0}
                      onPress={()=>setSi(i=>Math.max(0,i-1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si===steps.length-1}
                      onPress={()=>setSi(i=>Math.min(steps.length-1,i+1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                <CodeBlock>{`public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        int levelSize = queue.size(); // THE KEY LINE
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left  != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}`}</CodeBlock>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Cheat Sheet</p>
                <div className="flex flex-col gap-2">
                  {[
                    {t:"Level order = ?",    a:"BFS with a Queue",                             c:INDIGO},
                    {t:"Isolate one level?", a:"Snapshot levelSize = queue.size() first",       c:CYAN},
                    {t:"poll or remove?",    a:"poll() — returns null instead of throwing",     c:YELLOW},
                    {t:"Empty tree?",        a:"Guard with if(root==null) return early",         c:GREEN},
                  ].map(({t,a,c})=>(
                    <div key={t} className="flex gap-3 items-center rounded-lg px-3 py-2.5"
                      style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <code className="text-xs text-default-400 flex-1">{t}</code>
                      <span className="text-xs font-semibold text-right" style={{color:c}}>→ {a}</span>
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
