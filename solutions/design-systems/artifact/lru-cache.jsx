export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT="#818cf8",GREEN="#34d399",AMBER="#fbbf24",RED="#f87171",PURPLE="#c084fc";

function simulate(capacity,ops){
  const steps=[],map=new Map();let list=[];
  steps.push({list:[],mapSnap:{},action:"init",evicted:null,result:undefined,desc:`Initialize LRU Cache capacity=${capacity}`,op:null,highlight:null});
  for(const op of ops){
    if(op.type==="get"){
      const idx=list.findIndex(n=>n.key===op.key);
      if(idx===-1){
        steps.push({list:list.map(n=>({...n})),mapSnap:Object.fromEntries(map),action:"get_miss",evicted:null,result:-1,
          desc:`get(${op.key}) → not in cache → return -1`,op,highlight:null});
      }else{
        const node=list.splice(idx,1)[0];list.unshift(node);
        steps.push({list:list.map(n=>({...n})),mapSnap:Object.fromEntries(map),action:"get_hit",evicted:null,result:node.val,
          desc:`get(${op.key}) → hit! val=${node.val}. Promoted to MRU.`,op,highlight:op.key});
      }
    }else{
      const existingIdx=list.findIndex(n=>n.key===op.key);
      const isUpdate=existingIdx!==-1;
      if(isUpdate){list.splice(existingIdx,1);map.delete(op.key);}
      list.unshift({key:op.key,val:op.val});map.set(op.key,op.val);
      let evicted=null;
      if(list.length>capacity){const lru=list.pop();map.delete(lru.key);evicted=lru.key;}
      const action=isUpdate?"put_update":evicted!==null?"put_evict":"put_new";
      const desc=isUpdate?`put(${op.key},${op.val}) → key exists, update & move to MRU.`
        :evicted!==null?`put(${op.key},${op.val}) → cache full! Evict LRU key=${evicted}.`
        :`put(${op.key},${op.val}) → space available. Insert at MRU.`;
      steps.push({list:list.map(n=>({...n})),mapSnap:Object.fromEntries(map),action,evicted,result:undefined,desc,op,highlight:op.key});
    }
  }
  return steps;
}

function parseOps(str){
  return str.split(",").map(s=>s.trim()).filter(Boolean).map(token=>{
    const pm=token.match(/^put\((\d+),(\d+)\)$/i);
    if(pm)return{type:"put",key:parseInt(pm[1]),val:parseInt(pm[2])};
    const gm=token.match(/^get\((\d+)\)$/i);
    if(gm)return{type:"get",key:parseInt(gm[1])};
    return null;
  }).filter(Boolean);
}

function Arrow(){return <span className="text-default-300 text-lg mx-1">⇄</span>;}

function SentinelNode({label,sub,color}){
  return(
    <div className="flex flex-col items-center rounded-xl px-4 py-3 min-w-14 opacity-60"
      style={{border:`2px dashed ${color}`}}>
      <span className="text-[9px] font-bold" style={{color}}>{sub}</span>
      <span className="text-sm font-bold font-mono" style={{color}}>{label}</span>
      <span className="text-[9px]" style={{color}}>dummy</span>
    </div>
  );
}

function LinkedListViz({list,highlight,evicted,capacity}){
  return(
    <div className="overflow-x-auto py-2">
      <div className="flex items-center min-w-max px-2 gap-0">
        <SentinelNode label="HEAD" sub="MRU" color={GREEN}/>
        <Arrow/>
        {list.length===0&&<span className="text-sm text-default-400 italic px-4">— empty —</span>}
        {list.map((node,i)=>{
          const isHL=node.key===highlight,isLRU=i===list.length-1,isEvicted=node.key===evicted;
          const borderColor=isEvicted?RED:isHL?ACCENT:isLRU?AMBER:"var(--viz-border)";
          const bg=isEvicted?`${RED}18`:isHL?`${ACCENT}18`:isLRU?`${AMBER}18`:"var(--viz-node-bg)";
          return(
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center rounded-xl px-4 py-3 min-w-18 transition-all"
                style={{border:`2px solid ${borderColor}`,background:bg,boxShadow:isHL?`0 0 14px ${ACCENT}44`:isEvicted?`0 0 14px ${RED}44`:"none"}}>
                <span className="text-[9px] text-default-400">{i===0?"MRU":isLRU?"LRU":`pos ${i}`}</span>
                <span className="text-base font-bold font-mono" style={{color:isEvicted?RED:isHL?ACCENT:"var(--viz-text)"}}>{node.key}</span>
                <span className="text-[10px] text-default-400">val={node.val}</span>
                {isEvicted&&<span className="text-[9px] font-bold mt-0.5" style={{color:RED}}>EVICTED</span>}
              </div>
              {i<list.length-1&&<Arrow/>}
            </div>
          );
        })}
        {list.length>0&&<Arrow/>}
        <SentinelNode label="TAIL" sub="LRU" color={AMBER}/>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-default-400 min-w-16">capacity:</span>
        <div className="flex gap-1">
          {Array.from({length:capacity}).map((_,i)=>(
            <div key={i} className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all"
              style={{background:i<list.length?`${ACCENT}18`:"var(--viz-surface)",border:`1px solid ${i<list.length?ACCENT:"var(--viz-border)"}`,color:i<list.length?ACCENT:"var(--viz-muted)"}}>
              {i<list.length?list[i].key:"·"}
            </div>
          ))}
        </div>
        <span className="text-xs text-default-400">{list.length}/{capacity}</span>
      </div>
    </div>
  );
}

function HashMapViz({mapSnap,highlight}){
  const entries=Object.entries(mapSnap);
  return(
    <div className="flex flex-wrap gap-2 mt-1">
      {entries.length===0
        ?<span className="text-sm text-default-300 italic">{"{}"}</span>
        :entries.map(([k,v])=>{
          const isHL=parseInt(k)===highlight;
          return(
            <div key={k} className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
              style={{background:isHL?`${ACCENT}18`:"var(--viz-surface)",border:`1px solid ${isHL?ACCENT:"var(--viz-border)"}`,color:isHL?ACCENT:"var(--viz-text)",boxShadow:isHL?`0 0 8px ${ACCENT}33`:"none"}}>
              {k} → {v}
            </div>
          );
        })}
    </div>
  );
}

const DEFAULT_OPS="put(1,1),put(2,2),get(1),put(3,3),get(2),put(4,4),get(1),get(3),get(4)";

function actionColor(action){
  if(action==="get_hit")return GREEN;
  if(action==="get_miss")return RED;
  if(action==="put_evict")return AMBER;
  if(action==="put_update")return PURPLE;
  return ACCENT;
}

export default function App(){
  const [tab,setTab]=useState("Problem");
  const [capacity,setCapacity]=useState(2);
  const [opsStr,setOpsStr]=useState(DEFAULT_OPS);
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);

  useEffect(()=>{
    const ops=parseOps(opsStr);
    if(ops.length>0){setSteps(simulate(capacity,ops));setSi(0);}
  },[capacity,opsStr]);

  const step=steps[si]||null;
  const ac=step?actionColor(step.action):ACCENT;

  return(
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🗄️</span>
        <h1 className="font-semibold text-base">LRU Cache</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="secondary" variant="flat">HashMap · DLL</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k=>setTab(String(k))} variant="underlined" color="primary" size="sm">

          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Design a data structure following the <span style={{color:ACCENT}} className="font-semibold">LRU eviction policy</span>. Both <code style={{color:GREEN}}>get</code> and <code style={{color:GREEN}}>put</code> must run in <strong className="text-foreground">O(1)</strong> average time.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {sig:"int get(int key)",        desc:"Return value if exists, else -1. Mark as MRU."},
                    {sig:"void put(int key, int val)",desc:"Insert/update key. If over capacity, evict LRU first."},
                  ].map(({sig,desc})=>(
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <code className="text-xs font-mono flex-shrink-0" style={{color:GREEN}}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — capacity = 2</p>
                <CodeBlock language="text">{`put(1,1)  → cache: [1=1]
put(2,2)  → cache: [2=2, 1=1]
get(1)    → 1   cache: [1=1, 2=2]  (1 promoted)
put(3,3)  → EVICT 2   cache: [3=3, 1=1]
get(2)    → -1  (evicted)
put(4,4)  → EVICT 1   cache: [4=4, 3=3]
get(1)    → -1
get(3)    → 3
get(4)    → 4`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">🤔 The Core Challenge</p>
                <div className="flex gap-3 flex-wrap mb-4">
                  {[{need:"O(1) lookup",sol:"HashMap",c:ACCENT},{need:"O(1) ordered eviction",sol:"Doubly Linked List",c:GREEN}].map(({need,sol,c})=>(
                    <div key={need} className="flex-1 min-w-36 rounded-lg p-4 text-center" style={{background:"var(--viz-surface)",border:`1px solid ${c}55`}}>
                      <p className="text-xs text-default-400 mb-1">Need</p>
                      <p className="font-bold text-sm mb-2" style={{color:c}}>{need}</p>
                      <p className="text-xs text-default-500">→ {sol}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg px-4 py-3 text-center text-sm font-semibold" style={{background:`${ACCENT}12`,border:`1px solid ${ACCENT}44`,color:ACCENT}}>
                  Combine: HashMap keys → DLL nodes
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">⚙️ Two Core Primitives</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    {name:"remove(node)",color:RED,lines:["node.prev.next = node.next","node.next.prev = node.prev"]},
                    {name:"insertFront(node)",color:GREEN,lines:["node.next = head.next","head.next.prev = node","head.next = node"]},
                  ].map(({name,color,lines})=>(
                    <div key={name} className="flex-1 min-w-48 rounded-lg p-4" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <code className="text-sm font-bold" style={{color}}>{name}</code>
                      <div className="mt-3 flex flex-col gap-1">
                        {lines.map(l=><code key={l} className="text-xs text-default-500">{l}</code>)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">⚡ Complexity</p>
                <div className="flex gap-3">
                  {[{l:"get TIME",v:"O(1)"},{l:"put TIME",v:"O(1)"},{l:"SPACE",v:"O(n)"}].map(({l,v})=>(
                    <div key={l} className="flex-1 rounded-lg p-3 text-center" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <p className="text-xs text-default-400 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{color:GREEN}}>{v}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-3 flex-wrap">
                  <Input label="Capacity" type="number" value={String(capacity)}
                    onValueChange={v=>setCapacity(Math.max(1,parseInt(v)||1))}
                    variant="bordered" size="sm" className="w-24"/>
                  <Input label="Operations (put(k,v), get(k))" value={opsStr}
                    onValueChange={setOpsStr} variant="bordered" size="sm" className="flex-1"/>
                </div>
                <div className="flex gap-3 flex-wrap mt-3">
                  {[
                    {c:GREEN, l:"get hit"},
                    {c:RED,   l:"miss / evicted"},
                    {c:AMBER, l:"LRU position"},
                    {c:ACCENT,l:"active"},
                    {c:PURPLE,l:"updated"},
                  ].map(({c,l})=>(
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
                      <span className="text-xs text-default-400">{l}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              {step&&steps.length>0&&(
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step</p>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((s,i)=>{
                      const c=actionColor(s.action);
                      return(
                        <button key={i} onClick={()=>setSi(i)}
                          className="px-2 py-0.5 rounded text-[10px] cursor-pointer"
                          style={{background:i===si?`${c}20`:"var(--viz-surface)",border:`1px solid ${i===si?c:"var(--viz-border)"}`,color:i===si?c:"var(--viz-muted)"}}>
                          {i===0?"init":s.op?`${s.op.type}(${s.op.key}${s.op.type==="put"?","+s.op.val:""})`:"?"}
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-lg px-4 py-3 mb-4" style={{background:`${ac}12`,border:`1px solid ${ac}44`}}>
                    <p className="text-[10px] text-default-400 mb-0.5">STEP {si+1}/{steps.length}</p>
                    <p className="text-sm text-foreground">{step.desc}</p>
                    {step.result!==undefined&&step.result!==null&&(
                      <p className="text-sm font-bold mt-1" style={{color:step.result===-1?RED:GREEN}}>→ returns {step.result}</p>
                    )}
                  </div>
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider mb-2">Doubly Linked List</p>
                    <LinkedListViz list={step.list} highlight={step.highlight} evicted={step.evicted} capacity={capacity}/>
                  </div>
                  <div className="pt-3 border-t border-divider">
                    <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider mb-2">HashMap (key → val)</p>
                    <HashMapViz mapSnap={step.mapSnap} highlight={step.highlight}/>
                  </div>
                  <div className="flex gap-2 mt-4">
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
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java — HashMap + Doubly Linked List</p>
                <CodeBlock>{`class LRUCache {
    class Node { int key, val; Node prev, next;
        Node(int k, int v) { key=k; val=v; } }

    Map<Integer, Node> map = new HashMap<>();
    int capacity;
    Node head = new Node(0,0), tail = new Node(0,0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail; tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node); insertFront(node);  // move to MRU
        return node.val;
    }

    public void put(int key, int val) {
        if (map.containsKey(key)) remove(map.get(key));
        Node node = new Node(key, val);
        insertFront(node); map.put(key, node);
        if (map.size() > capacity) {
            Node lru = tail.prev;
            remove(lru); map.remove(lru.key);  // node.key needed!
        }
    }

    private void remove(Node n) {
        n.prev.next = n.next; n.next.prev = n.prev;
    }
    private void insertFront(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }
}`}</CodeBlock>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Insights</p>
                <div className="flex flex-col gap-2">
                  {[
                    {icon:"🗺️",tip:"HashMap + DLL = the classic O(1) ordered structure. Need O(1) access AND O(1) eviction? This is the answer."},
                    {icon:"🪆",tip:"Dummy head/tail sentinels eliminate all edge cases — empty list, single node, boundary inserts never need null checks."},
                    {icon:"🔑",tip:"Node must store its own key — when evicting tail.prev you need the key to call map.remove(key). Easy to forget!"},
                    {icon:"🔧",tip:"Build remove() and insertFront() first, then compose get/put from them. Never inline pointer logic."},
                  ].map(({icon,tip})=>(
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
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
