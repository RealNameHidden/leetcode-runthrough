export const difficulty = 'Hard'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const WATER="rgba(96,165,250,0.45)",WATERHI="rgba(147,197,253,0.85)";
const LEFT="#f97316",RIGHT="#c084fc",GREEN="#4ade80",AMBER="#fbbf24",ACCENT="#38bdf8";

function simulate(heights){
  const n=heights.length;
  const waterArr=new Array(n).fill(0);
  const steps=[];
  let left=0,right=n-1,leftMax=0,rightMax=0,total=0;
  steps.push({left,right,leftMax,rightMax,total,waterArr:[...waterArr],activeIdx:null,waterAdded:0,
    action:"init",desc:`Init: left=0, right=${n-1}. Squeeze inward tracking leftMax & rightMax.`});
  while(left<right){
    if(heights[left]<=heights[right]){
      if(heights[left]>=leftMax){
        leftMax=heights[left];
        steps.push({left,right,leftMax,rightMax,total,waterArr:[...waterArr],activeIdx:left,waterAdded:0,
          action:"updateMax",side:"left",desc:`h[${left}]=${heights[left]} ≥ leftMax → new leftMax=${leftMax}. Wall, no water.`});
      }else{
        const w=leftMax-heights[left];waterArr[left]=w;total+=w;
        steps.push({left,right,leftMax,rightMax,total,waterArr:[...waterArr],activeIdx:left,waterAdded:w,
          action:"trap",side:"left",desc:`h[${left}]=${heights[left]} < leftMax=${leftMax} → trap ${w} unit${w!==1?"s":""}. Total=${total}`});
      }
      left++;
    }else{
      if(heights[right]>=rightMax){
        rightMax=heights[right];
        steps.push({left,right,leftMax,rightMax,total,waterArr:[...waterArr],activeIdx:right,waterAdded:0,
          action:"updateMax",side:"right",desc:`h[${right}]=${heights[right]} ≥ rightMax → new rightMax=${rightMax}. Wall, no water.`});
      }else{
        const w=rightMax-heights[right];waterArr[right]=w;total+=w;
        steps.push({left,right,leftMax,rightMax,total,waterArr:[...waterArr],activeIdx:right,waterAdded:w,
          action:"trap",side:"right",desc:`h[${right}]=${heights[right]} < rightMax=${rightMax} → trap ${w} unit${w!==1?"s":""}. Total=${total}`});
      }
      right--;
    }
  }
  steps.push({left,right,leftMax,rightMax,total,waterArr:[...waterArr],activeIdx:null,waterAdded:0,
    action:"done",desc:`Pointers met → total trapped = ${total} units.`});
  return steps;
}

const CHART_H=160;

function BarChart({heights,waterArr,leftPtr,rightPtr,activeIdx,action}){
  const maxH=Math.max(...heights,1);
  const n=heights.length;
  const barW=Math.max(20,Math.min(48,Math.floor(520/n)-5));
  return(
    <div className="overflow-x-auto py-1">
      <div className="flex items-end justify-center gap-1" style={{minWidth:n*(barW+4),height:CHART_H+56}}>
        {heights.map((h,i)=>{
          const stonePx=Math.max(h>0?Math.round((h/maxH)*CHART_H):4,h>0?6:4);
          const wt=waterArr[i]||0;
          const waterPx=wt>0?Math.max(Math.round((wt/maxH)*CHART_H),4):0;
          const isLeft=i===leftPtr,isRight=i===rightPtr,isActive=i===activeIdx;
          const justTrapped=action==="trap"&&isActive;
          let stoneColor="var(--viz-surface)";
          if(isActive)stoneColor=isLeft?LEFT:RIGHT;
          else if(isLeft)stoneColor="#9a3412";
          else if(isRight)stoneColor="#6b21a8";
          return(
            <div key={i} className="flex flex-col items-center justify-end" style={{height:CHART_H+56,width:barW}}>
              <div className="flex flex-col" style={{width:barW}}>
                {waterPx>0&&(
                  <div style={{height:waterPx,background:justTrapped?WATERHI:WATER,borderRadius:"2px 2px 0 0",transition:"all 0.2s"}}/>
                )}
                <div style={{height:stonePx,background:stoneColor,border:`1.5px solid ${isActive?isLeft?LEFT:RIGHT:isLeft?"#9a3412":isRight?"#6b21a8":"var(--viz-border)"}`,borderRadius:waterPx>0?"0":"2px 2px 0 0",transition:"all 0.2s"}}/>
              </div>
              <div className="text-[9px] mt-1 font-mono" style={{color:"var(--viz-muted)"}}>{h}</div>
              {isLeft&&<div className="text-[9px] font-bold" style={{color:LEFT}}>L</div>}
              {isRight&&<div className="text-[9px] font-bold" style={{color:RIGHT}}>R</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS=[
  {label:"LC Example 1",val:"0,1,0,2,1,0,1,3,2,1,2,1"},
  {label:"LC Example 2",val:"4,2,0,3,2,5"},
  {label:"Simple",      val:"3,0,2,0,4"},
  {label:"No water",    val:"1,2,3,4,5"},
];

export default function App(){
  const [tab,setTab]=useState("Problem");
  const [heightsStr,setHeightsStr]=useState("0,1,0,2,1,0,1,3,2,1,2,1");
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);

  useEffect(()=>{
    const h=heightsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>=0);
    if(h.length>=2){setSteps(simulate(h));setSi(0);}
  },[heightsStr]);

  const step=steps[si]||null;
  const heights=heightsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>=0);
  const stepColor=step?.action==="done"?GREEN:step?.action==="trap"?ACCENT:step?.side==="left"?LEFT:RIGHT;

  return(
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🌧️</span>
        <h1 className="font-semibold text-base">Trapping Rain Water</h1>
        <Chip size="sm" color="danger" variant="flat">Hard</Chip>
        <Chip size="sm" color="primary" variant="flat">Two Pointers</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k=>setTab(String(k))} variant="underlined" color="primary" size="sm">

          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed">
                  Given an array of non-negative integers representing heights of bars, compute how much <span style={{color:ACCENT}} className="font-semibold">rain water</span> can be trapped between bars after it rains.
                </p>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Formula</p>
                <div className="rounded-lg px-4 py-3 text-center" style={{background:`${ACCENT}0d`,border:`1px solid ${ACCENT}33`}}>
                  <p className="text-sm font-mono font-bold" style={{color:ACCENT}}>
                    water[i] = min(leftMax, rightMax) - height[i]
                  </p>
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example</p>
                <CodeBlock language="text">{`Input:  [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">🧠 The Key Insight</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Water above position i is determined by <code className="text-foreground">min(leftMax, rightMax) - height[i]</code>. With two pointers, we always know which side is limiting.
                </p>
                <div className="rounded-lg px-4 py-3 mb-3" style={{background:`${LEFT}0d`,border:`1px solid ${LEFT}33`}}>
                  <p className="text-xs font-bold mb-1" style={{color:LEFT}}>Process left when height[L] ≤ height[R]</p>
                  <p className="text-xs text-default-500">Right wall is taller — leftMax is the binding constraint. Safe to compute water for L.</p>
                </div>
                <div className="rounded-lg px-4 py-3" style={{background:`${RIGHT}0d`,border:`1px solid ${RIGHT}33`}}>
                  <p className="text-xs font-bold mb-1" style={{color:RIGHT}}>Process right when height[R] &lt; height[L]</p>
                  <p className="text-xs text-default-500">Left wall is taller — rightMax is the binding constraint. Safe to compute water for R.</p>
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">⚡ Complexity</p>
                <div className="flex gap-3">
                  {[{l:"TIME",v:"O(n)",s:"One pass"},{l:"SPACE",v:"O(1)",s:"Two pointers + two maxes"}].map(({l,v,s})=>(
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
                      variant={heightsStr===p.val?"flat":"bordered"}
                      color={heightsStr===p.val?"primary":"default"}
                      onPress={()=>setHeightsStr(p.val)}>{p.label}</Button>
                  ))}
                </div>
                <Input label="Heights" value={heightsStr} onValueChange={setHeightsStr}
                  variant="bordered" size="sm"/>
                <div className="flex gap-4 mt-3">
                  {[{c:LEFT,l:"Left pointer"},{c:RIGHT,l:"Right pointer"},{c:ACCENT,l:"Water trapped"}].map(({c,l})=>(
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
                      <span className="text-xs text-default-400">{l}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              {steps.length>0&&step&&(
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Two Pointer Simulation</p>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((_,i)=>(
                      <button key={i} onClick={()=>setSi(i)}
                        className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                        style={{background:i===si?`${ACCENT}20`:"var(--viz-surface)",border:`1px solid ${i===si?ACCENT:"var(--viz-border)"}`,color:i===si?ACCENT:"var(--viz-muted)"}}>
                        {i===0?"init":i}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-lg px-4 py-3 mb-4" style={{background:`${stepColor}12`,border:`1px solid ${stepColor}44`}}>
                    <p className="text-[10px] text-default-400 mb-0.5">STEP {si+1}/{steps.length}</p>
                    <p className="text-sm text-foreground">{step.desc}</p>
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                    <BarChart heights={heights} waterArr={step.waterArr} leftPtr={step.left} rightPtr={step.right} activeIdx={step.activeIdx} action={step.action}/>
                  </div>
                  <div className="flex gap-3 mb-4">
                    {[
                      {l:"leftMax",v:step.leftMax,c:LEFT},
                      {l:"rightMax",v:step.rightMax,c:RIGHT},
                      {l:"Total Trapped",v:step.total,c:ACCENT},
                    ].map(({l,v,c})=>(
                      <div key={l} className="flex-1 rounded-lg py-2 text-center" style={{background:`${c}0d`,border:`1px solid ${c}33`}}>
                        <p className="text-[10px] text-default-400">{l}</p>
                        <p className="text-lg font-bold" style={{color:c}}>{v}</p>
                      </div>
                    ))}
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
                <CodeBlock>{`public int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0;
    int total = 0;

    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= leftMax)
                leftMax = height[left];  // new wall
            else
                total += leftMax - height[left]; // trap water
            left++;
        } else {
            if (height[right] >= rightMax)
                rightMax = height[right];
            else
                total += rightMax - height[right];
            right--;
        }
    }
    return total;
}`}</CodeBlock>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Insights</p>
                <div className="flex flex-col gap-2">
                  {[
                    {icon:"🎯",tip:"Process the side with the smaller height — the other side's wall is guaranteed to be at least as tall, making leftMax/rightMax the true bottleneck."},
                    {icon:"💧",tip:"water[i] = min(leftMax, rightMax) - height[i]. With two pointers, you always know which max is smaller without scanning the other side."},
                    {icon:"⚡",tip:"O(n) time, O(1) space — better than the O(n) space prefix-max array approach."},
                    {icon:"🔑",tip:"If height[left] >= leftMax: it's a wall (update max). Otherwise: it's a valley (trap water = leftMax - height[left])."},
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
