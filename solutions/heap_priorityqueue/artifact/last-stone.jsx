export const difficulty = 'Easy'
import { useState, useEffect } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT="#e8924a",AMBER="#f5c842",GREEN="#6dbf7e",RED="#e05c4a";

class MaxHeap{
  constructor(){this.data=[];}
  push(v){this.data.push(v);this._up(this.data.length-1);}
  pop(){const top=this.data[0];const last=this.data.pop();if(this.data.length>0){this.data[0]=last;this._down(0);}return top;}
  peek(){return this.data[0];}
  size(){return this.data.length;}
  _up(i){while(i>0){const p=Math.floor((i-1)/2);if(this.data[p]>=this.data[i])break;[this.data[p],this.data[i]]=[this.data[i],this.data[p]];i=p;}}
  _down(i){const n=this.data.length;while(true){let big=i,l=2*i+1,r=2*i+2;if(l<n&&this.data[l]>this.data[big])big=l;if(r<n&&this.data[r]>this.data[big])big=r;if(big===i)break;[this.data[i],this.data[big]]=[this.data[big],this.data[i]];i=big;}}
}

function simulate(stones){
  const steps=[],h=new MaxHeap();
  for(const s of stones)h.push(s);
  steps.push({heap:[...h.data],action:"init",desc:`Build max-heap from [${stones.join(",")}]`,x:null,y:null,result:null,smash:false});
  while(h.size()>0){
    if(h.size()===1){
      steps.push({heap:[...h.data],action:"done",desc:`1 stone left → return ${h.peek()}`,x:h.peek(),y:null,result:h.peek(),smash:false});
      break;
    }
    const x=h.pop(),y=h.pop();
    if(x===y){
      steps.push({heap:[...h.data],action:"equal",desc:`Poll ${x} and ${y} — equal, both destroyed`,x,y,result:null,smash:true});
    }else{
      const diff=x-y;h.push(diff);
      steps.push({heap:[...h.data],action:"diff",desc:`Poll ${x} and ${y} — diff=${diff}, push back`,x,y,result:diff,smash:true});
    }
    if(h.size()===0){
      steps.push({heap:[],action:"done",desc:`Heap empty → return 0`,x:null,y:null,result:0,smash:false});
      break;
    }
  }
  return steps;
}

function HeapTree({heap,highlightIdxs=[]}){
  if(!heap||heap.length===0)return<p className="text-center text-default-400 py-4 text-sm">— empty —</p>;
  const levels=[];let i=0,level=0;
  while(i<heap.length){
    const count=Math.min(Math.pow(2,level),heap.length-i);
    levels.push(heap.slice(i,i+count).map((v,ni)=>({v,idx:Math.pow(2,level)-1+ni})));
    i+=count;level++;
  }
  return(
    <div className="flex flex-col items-center gap-3 py-2">
      {levels.map((lvl,li)=>(
        <div key={li} className="flex gap-3 justify-center">
          {lvl.map(({v,idx})=>{
            const isHL=highlightIdxs.includes(idx);
            const isRoot=idx===0;
            return(
              <div key={idx} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all"
                  style={{background:isRoot?`${ACCENT}28`:isHL?`${RED}28`:"var(--viz-surface)",border:`2px solid ${isRoot?ACCENT:isHL?RED:"var(--viz-border)"}`,color:isRoot?ACCENT:isHL?RED:"var(--viz-text)",boxShadow:isRoot?`0 0 12px ${ACCENT}55`:"none"}}>
                  {v}
                </div>
                {isRoot&&<span className="text-[9px] mt-0.5" style={{color:ACCENT}}>MAX</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const PRESETS=[
  {label:"LC Example 1",val:"2,7,4,1,8,1"},
  {label:"LC Example 2",val:"1"},
  {label:"All Equal",   val:"3,3,3,3"},
  {label:"Descending",  val:"9,7,5,3,1"},
];

export default function App(){
  const [tab,setTab]=useState("Intuition");
  const [stonesStr,setStonesStr]=useState("2,7,4,1,8,1");
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);

  useEffect(()=>{
    const stones=stonesStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>0);
    if(stones.length>0){setSteps(simulate(stones));setSi(0);}
  },[stonesStr]);

  const step=steps[si]||null;
  const stepColor=step?.action==="done"?GREEN:step?.action==="equal"?RED:step?.smash?AMBER:ACCENT;

  return(
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🪨</span>
        <h1 className="font-semibold text-base">Last Stone Weight</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="warning" variant="flat">Max-Heap</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k=>setTab(String(k))} variant="underlined" color="primary" size="sm">

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">🧠 The Insight</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Always smash the <strong className="text-foreground">two heaviest stones</strong>. A <span style={{color:ACCENT}} className="font-semibold">max-heap</span> gives you the two largest in O(log n) each round.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-40 rounded-lg p-4" style={{background:`${RED}0d`,border:`1px solid ${RED}33`}}>
                    <p className="text-xs font-bold mb-2" style={{color:RED}}>x == y → both destroyed</p>
                    <p className="text-xs text-default-400">Pop two equal stones. Neither survives.</p>
                  </div>
                  <div className="flex-1 min-w-40 rounded-lg p-4" style={{background:`${AMBER}0d`,border:`1px solid ${AMBER}33`}}>
                    <p className="text-xs font-bold mb-2" style={{color:AMBER}}>x != y → push (x-y)</p>
                    <p className="text-xs text-default-400">Larger stone survives with reduced weight. Push the difference back.</p>
                  </div>
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Steps</p>
                {[
                  {n:"1",t:"Build max-heap from stones array",  d:"O(n log n) initialization."},
                  {n:"2",t:"While heap has ≥ 2 stones",         d:"Keep smashing until 0 or 1 stone remains."},
                  {n:"3",t:"Pop y (largest), Pop x (2nd largest)",d:"x ≤ y always (max-heap property)."},
                  {n:"4",t:"If x != y, push (y - x) back",     d:"Surviving stone with reduced weight."},
                  {n:"5",t:"Return peek() or 0",                d:"1 stone left → its weight. Empty → return 0."},
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
                  {[{l:"TIME",v:"O(n log n)",s:"n smash rounds, log n per pop/push"},{l:"SPACE",v:"O(n)",s:"heap holds all stones"}].map(({l,v,s})=>(
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <p className="text-xs text-default-400 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{color:ACCENT}}>{v}</p>
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
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {PRESETS.map(p=>(
                    <Button key={p.label} size="sm"
                      variant={stonesStr===p.val?"flat":"bordered"}
                      color={stonesStr===p.val?"warning":"default"}
                      onPress={()=>setStonesStr(p.val)}>{p.label}</Button>
                  ))}
                </div>
                <Input label="Stones (comma-separated)" value={stonesStr}
                  onValueChange={setStonesStr} variant="bordered" size="sm"/>
              </CardBody></Card>

              {steps.length>0&&step&&(
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Smash Simulation</p>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((s,i)=>{
                      const c=s.action==="done"?GREEN:s.action==="equal"?RED:s.smash?AMBER:ACCENT;
                      return(
                        <button key={i} onClick={()=>setSi(i)}
                          className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                          style={{background:i===si?`${c}20`:"var(--viz-surface)",border:`1px solid ${i===si?c:"var(--viz-border)"}`,color:i===si?c:"var(--viz-muted)"}}>
                          {i===0?"init":i}
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-lg px-4 py-3 mb-4" style={{background:`${stepColor}12`,border:`1px solid ${stepColor}40`}}>
                    <p className="text-[10px] text-default-400 mb-0.5">STEP {si+1}/{steps.length}</p>
                    <p className="text-sm text-foreground">{step.desc}</p>
                    {step.smash&&step.x!==null&&(
                      <div className="flex gap-3 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:`${RED}18`,color:RED}}>Pop: {step.x}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:`${AMBER}18`,color:AMBER}}>Pop: {step.y}</span>
                        {step.result!==null&&<span className="text-xs font-bold px-2 py-0.5 rounded" style={{background:`${GREEN}18`,color:GREEN}}>Push: {step.result}</span>}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                    <p className="text-[10px] text-center text-default-400 mb-2">Max-Heap — root = heaviest stone</p>
                    <HeapTree heap={step.heap} highlightIdxs={[]}/>
                  </div>
                  {step.action==="done"&&(
                    <div className="rounded-lg px-4 py-3 mb-4 text-center" style={{background:`${GREEN}12`,border:`1px solid ${GREEN}44`}}>
                      <p className="text-xs text-default-400 mb-1">Final Answer</p>
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
                <pre className="rounded-lg p-4 text-xs leading-8 overflow-x-auto" style={{background:"var(--code-bg)",color:"var(--code-text)"}}>
{`public int lastStoneWeight(int[] stones) {
    PriorityQueue<Integer> `}<span style={{color:ACCENT}}>maxHeap</span>{` =
        new PriorityQueue<>(Collections.reverseOrder());

    for (int s : stones) `}<span style={{color:ACCENT}}>maxHeap</span>{`.offer(s);

    while (`}<span style={{color:ACCENT}}>maxHeap</span>{`.size() > 1) {
        int y = `}<span style={{color:ACCENT}}>maxHeap</span>{`.poll();  `}<span style={{color:"var(--code-muted)"}}>// heaviest</span>{`
        int x = `}<span style={{color:ACCENT}}>maxHeap</span>{`.poll();  `}<span style={{color:"var(--code-muted)"}}>// 2nd heaviest</span>{`
        if (x != y)
            `}<span style={{color:ACCENT}}>maxHeap</span>{`.offer(y - x);
    }

    return `}<span style={{color:ACCENT}}>maxHeap</span>{`.isEmpty() ? 0 : `}<span style={{color:GREEN}}>`maxHeap.peek()`</span>{`;
}`}
                </pre>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Points</p>
                <div className="flex flex-col gap-2">
                  {[
                    {icon:"🏔️",tip:"Max-heap always gives the two heaviest stones in O(log n). Use Collections.reverseOrder() in Java."},
                    {icon:"💥",tip:"If y == x, both are destroyed (don't push anything). If y > x, push (y-x) back."},
                    {icon:"0️⃣",tip:"Empty heap → return 0. This handles the case where all stones cancel out."},
                    {icon:"⚡",tip:"O(n log n) total: n rounds, log n per pop/push. Optimal for this problem."},
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
