export const difficulty = 'Medium'
import { useState, useEffect, useRef } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT="#38bdf8",TEAL="#2dd4bf",WATER="#1e6fa8",WATERHI="#38bdf850",GREEN="#4ade80",POINTER="#facc15";

function simulate(heights){
  const steps=[];
  let l=0,r=heights.length-1,best=0,bestL=0,bestR=0;
  steps.push({l,r,area:0,best,bestL,bestR,desc:"Initialize left=0, right=n-1.",moved:null});
  while(l<r){
    const h=Math.min(heights[l],heights[r]);
    const area=h*(r-l);
    const prev=steps[steps.length-1].best;
    if(area>best){best=area;bestL=l;bestR=r;}
    const moved=heights[l]<heights[r]?"left":(heights[r]<heights[l]?"right":"left");
    const desc=area>prev
      ?`area=min(${heights[l]},${heights[r]})×${r-l}=${area} ✦ new best!`
      :`area=min(${heights[l]},${heights[r]})×${r-l}=${area}`;
    steps.push({l,r,area,best,bestL,bestR,desc,moved});
    if(heights[l]<heights[r])l++;else r--;
  }
  steps.push({l,r,area:null,best,bestL,bestR,desc:`Pointers met → answer=${best}`,moved:null,done:true});
  return steps;
}

function WaterViz({heights,l,r,best,bestL,bestR,done}){
  if(!heights||heights.length===0)return null;
  const maxH=Math.max(...heights);
  const BAR_W=Math.min(44,Math.floor(520/heights.length)-4);
  const GAP=Math.max(3,Math.floor(520/heights.length)-BAR_W);
  const VIZ_H=180;
  const areaH=l!==undefined&&r!==undefined&&!done?Math.min(heights[l],heights[r]):null;
  return(
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end relative" style={{gap:GAP,minWidth:heights.length*(BAR_W+GAP),height:VIZ_H+28,padding:"0 8px"}}>
        {heights.map((h,i)=>{
          const barH=(h/maxH)*VIZ_H;
          const isL=i===l&&!done,isR=i===r&&!done;
          const isBetween=!done&&l!==undefined&&r!==undefined&&i>l&&i<r;
          const waterH=areaH&&isBetween?(areaH/maxH)*VIZ_H:0;
          const isBest=done&&i>=bestL&&i<=bestR;
          let borderColor="var(--viz-border)";
          if(isL||isR)borderColor=POINTER;
          else if(isBest)borderColor=`${TEAL}88`;
          return(
            <div key={i} className="relative flex flex-col items-center justify-end" style={{width:BAR_W,height:VIZ_H+28}}>
              {waterH>0&&(
                <div className="absolute left-0 right-0 bottom-0" style={{height:barH,display:"flex",flexDirection:"column",justifyContent:"flex-start"}}>
                  <div style={{height:waterH,background:WATERHI,borderLeft:`1px solid ${ACCENT}33`,borderRight:`1px solid ${ACCENT}33`,marginTop:barH-waterH}}/>
                </div>
              )}
              <div className="relative" style={{width:BAR_W,height:barH,background:isL||isR?`${POINTER}33`:isBest?`${TEAL}22`:"var(--viz-surface)",border:`1.5px solid ${borderColor}`,borderRadius:"4px 4px 0 0",transition:"all 0.2s"}}>
                {(isL||isR)&&(
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold" style={{color:POINTER}}>{isL?"L":"R"}</div>
                )}
              </div>
              <div className="text-[9px] mt-1 font-mono" style={{color:"var(--viz-muted)"}}>{h}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS=[
  {label:"LC Example 1",val:"1,8,6,2,5,4,8,3,7"},
  {label:"LC Example 2",val:"1,1"},
  {label:"Ascending",   val:"1,2,3,4,5,6,7,8"},
  {label:"V-shape",     val:"8,1,1,1,1,1,1,8"},
];

export default function App(){
  const [tab,setTab]=useState("Problem");
  const [heightsStr,setHeightsStr]=useState("1,8,6,2,5,4,8,3,7");
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);

  useEffect(()=>{
    const h=heightsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>=0);
    if(h.length>=2){setSteps(simulate(h));setSi(0);}
  },[heightsStr]);

  const step=steps[si]||null;
  const heights=heightsStr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>=0);
  const isBest=step&&step.area===step.best&&step.area>0;

  return(
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🌊</span>
        <h1 className="font-semibold text-base">Container With Most Water</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Two Pointers</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={k=>setTab(String(k))} variant="underlined" color="primary" size="sm">

          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed">
                  Given <code className="text-foreground">n</code> vertical lines, find two lines that together with the x-axis form a container holding the <span style={{color:ACCENT}} className="font-semibold">most water</span>. Return the maximum amount of water.
                </p>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Formula</p>
                <div className="rounded-lg px-4 py-3 text-center" style={{background:`${ACCENT}0d`,border:`1px solid ${ACCENT}33`}}>
                  <p className="text-sm font-mono font-bold" style={{color:ACCENT}}>
                    area = min(height[L], height[R]) × (R - L)
                  </p>
                </div>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">🎯 Why Two Pointers?</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Start with the widest container (L=0, R=n-1). Moving the <strong className="text-foreground">taller pointer inward</strong> can only decrease width AND can't increase the area (still limited by the shorter wall). So always move the <span style={{color:POINTER}} className="font-semibold">shorter pointer</span>.
                </p>
                <div className="rounded-lg px-4 py-3" style={{background:`${POINTER}0d`,border:`1px solid ${POINTER}33`}}>
                  <p className="text-sm font-semibold text-foreground mb-1">The Greedy Rule:</p>
                  <p className="text-sm text-default-500">Move whichever pointer has the shorter height. We can only hope for a bigger area by finding a taller wall on the shorter side.</p>
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">⚡ Complexity</p>
                <div className="flex gap-3">
                  {[{l:"TIME",v:"O(n)",s:"One pass, each pointer moves inward"},{l:"SPACE",v:"O(1)",s:"Two pointer variables"}].map(({l,v,s})=>(
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
                  <div className="rounded-lg px-4 py-3 mb-4" style={{background:isBest?`${GREEN}12`:`${ACCENT}0d`,border:`1px solid ${isBest?GREEN:ACCENT}44`}}>
                    <p className="text-[10px] text-default-400 mb-0.5">STEP {si+1}/{steps.length}</p>
                    <p className="text-sm text-foreground">{step.desc}</p>
                  </div>
                  <div className="rounded-xl p-4 mb-4" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                    <WaterViz heights={heights} l={step.l} r={step.r} best={step.best} bestL={step.bestL} bestR={step.bestR} done={step.done}/>
                  </div>
                  <div className="flex gap-4 mb-4 text-center">
                    <div className="flex-1 rounded-lg py-2" style={{background:"var(--viz-surface)",border:"1px solid var(--viz-border)"}}>
                      <p className="text-[10px] text-default-400">Current Area</p>
                      <p className="text-lg font-bold" style={{color:ACCENT}}>{step.area??"-"}</p>
                    </div>
                    <div className="flex-1 rounded-lg py-2" style={{background:`${GREEN}0d`,border:`1px solid ${GREEN}33`}}>
                      <p className="text-[10px] text-default-400">Best So Far</p>
                      <p className="text-lg font-bold" style={{color:GREEN}}>{step.best}</p>
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
                <CodeBlock>{`public int maxArea(int[] height) {
    int l = 0, r = height.length - 1;
    int best = 0;

    while (l < r) {
        int area = Math.min(height[l], height[r]) * (r - l);
        best = Math.max(best, area);

        // move the shorter pointer inward
        if (height[l] < height[r]) l++;
        else                        r--;
    }
    return best;
}`}</CodeBlock>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Key Insights</p>
                <div className="flex flex-col gap-2">
                  {[
                    {icon:"📐",tip:"Start widest (L=0, R=n-1). Width can only shrink — so maximize height by always moving the shorter wall."},
                    {icon:"🎯",tip:"Moving the taller pointer inward is always suboptimal: width decreases AND height is still capped by the shorter wall."},
                    {icon:"⚡",tip:"O(n) time — each pointer moves inward at most n times total. O(1) space."},
                    {icon:"🔑",tip:"This is a greedy shrink: we sacrifice width for a chance at greater height on the shorter side."},
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
