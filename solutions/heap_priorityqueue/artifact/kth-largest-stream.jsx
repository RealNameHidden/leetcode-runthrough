export const difficulty = 'Easy'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT="#f78166",GREEN="#3fb950",BLUE="#79c0ff";

class MinHeap{
  constructor(){this.data=[];}
  push(v){this.data.push(v);this._up(this.data.length-1);}
  pop(){const top=this.data[0];const last=this.data.pop();if(this.data.length>0){this.data[0]=last;this._down(0);}return top;}
  peek(){return this.data[0];}
  size(){return this.data.length;}
  _up(i){while(i>0){const p=Math.floor((i-1)/2);if(this.data[p]<=this.data[i])break;[this.data[p],this.data[i]]=[this.data[i],this.data[p]];i=p;}}
  _down(i){const n=this.data.length;while(true){let s=i,l=2*i+1,r=2*i+2;if(l<n&&this.data[l]<this.data[s])s=l;if(r<n&&this.data[r]<this.data[s])s=r;if(s===i)break;[this.data[i],this.data[s]]=[this.data[s],this.data[i]];i=s;}}
}

function simulate(k,nums,adds){
  const h=new MinHeap(),steps=[];
  for(const n of nums)h.push(n);
  while(h.size()>k)h.pop();
  steps.push({phase:"init",heap:[...h.data],result:h.peek()??null,val:null,desc:`Init with [${nums.join(",")}], trim to k=${k} largest → heap=[${h.data.join(",")}]`});
  for(const val of adds){
    h.push(val);
    if(h.size()>k)h.pop();
    steps.push({phase:"add",heap:[...h.data],result:h.peek(),val,desc:`add(${val}) → heap min = ${h.peek()} → kth largest = ${h.peek()}`});
  }
  return steps;
}

function HeapTree({heap,highlight}){
  if(!heap||heap.length===0)return<p className="text-center text-default-400 py-4 text-sm">empty heap</p>;
  const levels=[];let i=0,level=0;
  while(i<heap.length){
    const count=Math.min(Math.pow(2,level),heap.length-i);
    levels.push(heap.slice(i,i+count));
    i+=count;level++;
  }
  return(
    <div className="flex flex-col items-center gap-3 py-2">
      {levels.map((lvl,li)=>(
        <div key={li} className="flex gap-3 justify-center items-center">
          {lvl.map((v,ni)=>{
            const idx=Math.pow(2,li)-1+ni;
            const isHL=v===highlight;
            const isRoot=li===0;
            return(
              <div key={ni} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all"
                  style={{background:isRoot?`${ACCENT}28`:isHL?`${BLUE}28`:"var(--viz-surface)",border:`2px solid ${isRoot?ACCENT:isHL?BLUE:"var(--viz-border)"}`,color:isRoot?ACCENT:isHL?BLUE:"var(--viz-text)",boxShadow:isRoot?`0 0 12px ${ACCENT}55`:isHL?`0 0 8px ${BLUE}44`:"none"}}>
                  {v}
                </div>
                {isRoot&&<span className="text-[9px] mt-1" style={{color:ACCENT}}>MIN</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const DEFAULT_NUMS="4,5,8,2";
const DEFAULT_ADDS="3,5,10,9,4";

export default function App(){
  const [tab,setTab]=useState("Intuition");
  const [k,setK]=useState(3);
  const [numsStr,setNumsStr]=useState(DEFAULT_NUMS);
  const [addsStr,setAddsStr]=useState(DEFAULT_ADDS);
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);

  useEffect(()=>{
    const nums=numsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    const adds=addsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    if(nums.length>0){setSteps(simulate(k,nums,adds));setSi(0);}
  },[k,numsStr,addsStr]);

  const step=steps[si]||null;

  return(
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📡</span>
        <h1 className="font-semibold text-base">Kth Largest Element in a Stream</h1>
        <Chip size="sm" color="warning" variant="flat">Easy</Chip>
        <Chip size="sm" color="danger" variant="flat">Min-Heap</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k=>setTab(String(k))} variant="underlined" color="primary" size="sm">

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">🧠 The Key Insight</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Keep a <strong className="text-foreground">min-heap of size k</strong>. The kth largest is always the <span style={{color:ACCENT}} className="font-semibold">minimum element</span> of that heap — the smallest of the top-k.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-40 rounded-lg p-4" style={{background:`${ACCENT}0d`,border:`1px solid ${ACCENT}33`}}>
                    <p className="text-xs font-bold mb-2" style={{color:ACCENT}}>Min-Heap of size k</p>
                    <p className="text-xs text-default-500 leading-relaxed">Heap root = kth largest. When a new number arrives, push it in. If size exceeds k, pop the min (too small to be top-k).</p>
                  </div>
                  <div className="flex-1 min-w-40 rounded-lg p-4" style={{background:`${GREEN}0d`,border:`1px solid ${GREEN}33`}}>
                    <p className="text-xs font-bold mb-2" style={{color:GREEN}}>Why not sort every time?</p>
                    <p className="text-xs text-default-500 leading-relaxed">Sorting = O(n log n) per add. Heap = O(log k) per add. Heap grows with stream while staying fast.</p>
                  </div>
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                {[
                  {n:"1",t:"Build heap from initial nums",     d:"Push all, then pop until size = k."},
                  {n:"2",t:"add(val): push val into heap",     d:"O(log k) insertion."},
                  {n:"3",t:"If heap.size() > k, pop minimum",  d:"Discard values smaller than the kth largest."},
                  {n:"4",t:"Return heap.peek()",               d:"The root is always the kth largest."},
                ].map(({n,t,d})=>(
                  <div key={n} className="flex gap-3 mb-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{background:`${ACCENT}18`,border:`1px solid ${ACCENT}55`,color:ACCENT}}>{n}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-0.5">{t}</p>
                      <p className="text-xs text-default-400">{d}</p>
                    </div>
                  </div>
                ))}
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">⚡ Complexity</p>
                <div className="flex gap-3">
                  {[{l:"add() TIME",v:"O(log k)"},{l:"Constructor",v:"O(n log k)"},{l:"SPACE",v:"O(k)"}].map(({l,v})=>(
                    <div key={l} className="flex-1 rounded-lg p-3 text-center" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <p className="text-xs text-default-400 mb-1">{l}</p>
                      <p className="font-bold text-sm" style={{color:ACCENT}}>{v}</p>
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
                  <Input label="k" type="number" value={String(k)} onValueChange={v=>setK(Math.max(1,parseInt(v)||1))}
                    variant="bordered" size="sm" className="w-20"/>
                  <Input label="Initial nums" value={numsStr} onValueChange={setNumsStr}
                    variant="bordered" size="sm" className="flex-1"/>
                  <Input label="Stream adds" value={addsStr} onValueChange={setAddsStr}
                    variant="bordered" size="sm" className="flex-1"/>
                </div>
              </CardBody></Card>

              {steps.length>0&&step&&(
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Min-Heap Simulation</p>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((s,i)=>(
                      <button key={i} onClick={()=>setSi(i)}
                        className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                        style={{background:i===si?`${ACCENT}20`:"var(--viz-surface)",border:`1px solid ${i===si?ACCENT:"var(--viz-border)"}`,color:i===si?ACCENT:"var(--viz-muted)"}}>
                        {i===0?"init":`add(${s.val})`}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-lg px-4 py-3 mb-4" style={{background:`${ACCENT}12`,border:`1px solid ${ACCENT}40`}}>
                    <p className="text-[10px] text-default-400 mb-0.5">STEP {si+1}/{steps.length}</p>
                    <p className="text-sm text-foreground">{step.desc}</p>
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                    <p className="text-[10px] font-semibold text-default-400 uppercase tracking-wider mb-2 text-center">
                      Min-Heap (size={step.heap.length}, k={k}) — root = kth largest
                    </p>
                    <HeapTree heap={step.heap} highlight={step.val}/>
                  </div>
                  {step.result!==undefined&&step.result!==null&&(
                    <div className="rounded-lg px-4 py-3 mb-4 text-center" style={{background:`${GREEN}12`,border:`1px solid ${GREEN}44`}}>
                      <p className="text-xs text-default-400 mb-1">Kth Largest</p>
                      <p className="text-xl font-bold" style={{color:GREEN}}>{step.result}</p>
                    </div>
                  )}
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
                <CodeBlock>{`class KthLargest {
    private PriorityQueue<Integer> minHeap;
    private int k;

    public KthLargest(int k, int[] nums) {
        this.k = k;
        minHeap = new PriorityQueue<>();
        for (int n : nums) add(n);  // reuse add() logic
    }

    public int add(int val) {
        minHeap.offer(val);
        if (minHeap.size() > k)
            minHeap.poll();  // remove smallest
        return minHeap.peek();  // root = kth largest
    }
}`}</CodeBlock>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Cheat Sheet</p>
                <div className="flex flex-col gap-2">
                  {[
                    {t:"Kth largest?",         a:"Min-heap of size k",                   c:ACCENT},
                    {t:"Why min-heap not max?", a:"Root is the kth largest (smallest of top-k)",c:GREEN},
                    {t:"Heap too big?",         a:"pop() the min — it's below the kth",  c:BLUE},
                    {t:"Return value?",         a:"peek() — always the kth largest",      c:ACCENT},
                  ].map(({t,a,c})=>(
                    <div key={t} className="flex gap-3 items-center rounded-lg px-3 py-2.5"
                      style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <code className="text-xs text-default-400 flex-1">{t}</code>
                      <span className="text-xs font-semibold" style={{color:c}}>→ {a}</span>
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
