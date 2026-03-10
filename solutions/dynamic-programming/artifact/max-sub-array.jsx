export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

function V({ children, color }) {
  return <span style={{ display:"inline-block", padding:"1px 5px", marginLeft:2, borderRadius:4, background:`${color}28`, color, fontWeight:700, fontSize:12 }}>{children}</span>;
}

function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, padding:"6px 16px", background:highlight?"rgba(78,204,163,0.08)":"transparent", borderLeft:`3px solid ${highlight?TEAL:"transparent"}`, transition:"background 0.2s" }}>
      <div style={{ fontSize:12, fontFamily:"monospace", lineHeight:1.5, flexShrink:0 }}>{children}</div>
      {annotation && <div style={{ fontSize:11, color:annotationColor||TEAL, whiteSpace:"nowrap", fontFamily:"monospace", opacity:0.85 }}>// {annotation}</div>}
    </div>
  );
}

function simulate(numsStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return [];
  const steps = [];
  let currentMax = nums[0], globalMax = nums[0];
  steps.push({ i:0, current:nums[0], global:nums[0], action:'init', desc:`Initialize: currentMax=${nums[0]}, globalMax=${nums[0]}` });
  for (let i = 1; i < nums.length; i++) {
    const extend = currentMax + nums[i];
    const fresh = nums[i];
    const newCurrent = Math.max(fresh, extend);
    const chosenOption = newCurrent === fresh && fresh !== extend ? 'fresh start' : 'extend';
    steps.push({ i, current:newCurrent, global:globalMax, action:'decide', num:nums[i], fresh, extend, chosen:newCurrent, chosenOption, desc:`max(${fresh}, ${currentMax}+${nums[i]}) = max(${fresh}, ${extend}) = ${newCurrent} (${chosenOption})` });
    currentMax = newCurrent;
    if (currentMax > globalMax) {
      globalMax = currentMax;
      steps.push({ i, current:currentMax, global:globalMax, action:'update_global', desc:`New best! globalMax = ${globalMax}` });
    }
  }
  steps.push({ i:nums.length-1, current:currentMax, global:globalMax, action:'done', desc:`Maximum subarray sum = ${globalMax}` });
  return steps;
}

function ArrayViz({ nums, currentIdx }) {
  if (!nums || nums.length === 0) return null;
  const maxVal = Math.max(...nums.map(Math.abs), 1);
  const HEIGHT = 100;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end gap-2 justify-center p-4" style={{ minWidth:'100%' }}>
        {nums.map((num, i) => {
          const isActive = i === currentIdx;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="transition-all rounded-t" style={{ width:'32px', height:(Math.abs(num)/maxVal)*HEIGHT||4, background:isActive?GOLD:"var(--viz-surface)", border:`2px solid ${isActive?GOLD:"var(--viz-border)"}`, boxShadow:isActive?`0 0 8px ${GOLD}66`:'none' }} />
              <span className="text-xs font-mono font-bold">{num}</span>
              <span className="text-[9px]" style={{ color:'var(--viz-muted)' }}>{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label:"LC Example", val:"-2,1,-3,4,-1,2,1,-5,4" },
  { label:"All Positive", val:"1,2,3,4,5" },
  { label:"All Negative", val:"-5,-4,-3,-2,-1" },
  { label:"Mixed", val:"-1,3,-2,4,-1" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("-2,1,-3,4,-1,2,1,-5,4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => { setSteps(simulate(input)); setSi(0); }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const doneStep = steps[steps.length-1];

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📈</span>
        <h1 className="font-semibold text-base">Maximum Subarray (Kadane's)</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="success" variant="flat">DP · Greedy</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an integer array <strong>nums</strong>, find the subarray with the largest sum and return its sum. A subarray is a contiguous non-empty part of the array.
                </p>
                <div className="flex flex-col gap-2">
                  {[{ sig:"int maxSubArray(int[] nums)", desc:"Return the maximum subarray sum. The array has at least one element." }].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color:TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — [-2, 1, -3, 4, -1, 2, 1, -5, 4]</p>
                <CodeBlock language="text">{`Input:  [-2, 1, -3, 4, -1, 2, 1, -5, 4]

At each index, decide: start fresh OR extend current subarray?

i=0: currentMax = -2,  globalMax = -2
i=1: max(1, -2+1)  = max(1, -1)  = 1  (fresh)   globalMax = 1
i=2: max(-3, 1-3)  = max(-3,-2)  = -2 (extend)
i=3: max(4, -2+4)  = max(4,  2)  = 4  (fresh)   globalMax = 4
i=4: max(-1, 4-1)  = max(-1, 3)  = 3  (extend)
i=5: max(2,  3+2)  = max(2,  5)  = 5  (extend)  globalMax = 5
i=6: max(1,  5+1)  = max(1,  6)  = 6  (extend)  globalMax = 6
i=7: max(-5, 6-5)  = max(-5, 1)  = 1  (extend)
i=8: max(4,  1+4)  = max(4,  5)  = 5  (extend)

Output: 6  (subarray [4, -1, 2, 1])`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background:`${TEAL}0d`, borderColor:`${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color:TEAL }}>Extend or Start Fresh</p>
                    <p className="text-sm leading-relaxed text-default-500">At each position, choose the larger of: extending the running sum, or starting a new subarray at this element.</p>
                    <p className="text-xs text-default-400 mt-3 font-mono">max(nums[i], prev + nums[i])</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background:`${GOLD}0d`, borderColor:`${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color:GOLD }}>Track Global Best</p>
                    <p className="text-sm leading-relaxed text-default-500">Keep a running globalMax that captures the best sum ever seen across all positions.</p>
                    <p className="text-xs text-default-400 mt-3 font-mono">globalMax = max(globalMax, currentMax)</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Kadane's Algorithm</p>
                <CodeBlock>{`int maxSubArray(int[] nums) {
  int currentMax = nums[0];
  int globalMax  = nums[0];

  for (int i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    globalMax  = Math.max(globalMax, currentMax);
  }

  return globalMax;
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background:`${GOLD}0d`, borderColor:`${GOLD}44` }}>
                  <span style={{ color:GOLD }} className="font-bold">⚠️ Key insight: </span>
                  If currentMax drops below the current element alone, the previous subarray is dragging us down. Reset by starting fresh.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3">
                  {[{ l:"TIME", v:"O(n)", s:"Single pass" }, { l:"SPACE", v:"O(1)", s:"Two variables only" }].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color:TEAL }}>{v}</p>
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
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map(p => (
                    <Button key={p.label} size="sm" variant={input===p.val?"flat":"bordered"} color={input===p.val?"primary":"default"} onPress={() => setInput(p.val)}>{p.label}</Button>
                  ))}
                </div>
                <Input label="Array (comma-separated)" value={input} onValueChange={setInput} placeholder="-2,1,-3,4,-1,2,1,-5,4" variant="bordered" size="sm" />
              </CardBody></Card>

              {steps.length > 0 && step && (
                <Card><CardBody>
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {steps.map((s, i) => (
                      <button key={i} onClick={() => setSi(i)}
                        style={{ background:i===si?TEAL:"var(--viz-surface)", border:`1px solid ${i===si?TEAL:"var(--viz-border)"}`, color:i===si?"#0b0f0e":undefined }}
                        className="px-2.5 py-1 rounded text-xs cursor-pointer">#{i+1}</button>
                    ))}
                  </div>

                  <p className="text-xs text-default-500 mb-4">
                    Index: <V color={GOLD}>{step.i}</V> ·
                    currentMax: <V color={TEAL}>{step.current}</V> ·
                    globalMax: <V color={GOLD}>{step.global}</V>
                    {step.chosenOption && <> · Choice: <V color={step.chosenOption==='fresh start'?RED:BLUE}>{step.chosenOption}</V></>}
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background:"var(--code-bg)", border:"1px solid var(--code-border)" }}>
                    <CodeLine highlight={step.action==='init'} annotation={step.action==='init'?`currentMax=${step.current}`:'initialize'} annotationColor={TEAL}>
                      <span style={{ color:"var(--code-muted)" }}>int currentMax = nums[0], globalMax = nums[0]</span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='decide'} annotation={step.action==='decide'?`max(${step.fresh}, ${step.extend}) = ${step.chosen}`:'pick max'} annotationColor={step?.chosenOption==='fresh start'?RED:BLUE}>
                      <span style={{ color:"var(--code-muted)" }}>currentMax = Math.<span style={{ color:TEAL }}>max</span>(nums[i], currentMax + nums[i])</span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='update_global'} annotation={step.action==='update_global'?`new best: ${step.global}`:'update global'} annotationColor={GOLD}>
                      <span style={{ color:"var(--code-muted)" }}>globalMax = Math.<span style={{ color:GOLD }}>max</span>(globalMax, currentMax)</span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='done'} annotation={step.action==='done'?`answer: ${step.global}`:'return'} annotationColor={TEAL}>
                      <span style={{ color:"var(--code-muted)" }}>return <span style={{ color:TEAL }}>globalMax</span></span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-4 mb-4" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-2 text-center"><span style={{ color:GOLD }}>■</span> Current index</p>
                    <ArrayViz nums={nums} currentIdx={step.i} />
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-lg p-3 text-center" style={{ background:`${TEAL}0d`, border:`1px solid ${TEAL}33` }}>
                        <p className="text-xs text-default-500 mb-1">currentMax</p>
                        <p className="text-2xl font-bold" style={{ color:TEAL }}>{step.current}</p>
                      </div>
                      <div className="rounded-lg p-3 text-center" style={{ background:`${GOLD}0d`, border:`1px solid ${GOLD}33` }}>
                        <p className="text-xs text-default-500 mb-1">globalMax</p>
                        <p className="text-2xl font-bold" style={{ color:GOLD }}>{step.global}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono px-3 py-2 rounded mb-4" style={{ background:"var(--viz-surface)", borderLeft:`3px solid ${step.action==='done'||step.action==='update_global'?TEAL:GOLD}` }}>
                    {step.desc}
                  </p>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si===0} onPress={() => setSi(i => Math.max(0, i-1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si===steps.length-1} onPress={() => setSi(i => Math.min(steps.length-1, i+1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {doneStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                  <div className="rounded-xl p-6 text-center" style={{ background:`${TEAL}0d`, border:`1px solid ${TEAL}33` }}>
                    <p className="text-xs text-default-500 mb-2">Maximum Subarray Sum</p>
                    <p className="text-4xl font-bold" style={{ color:TEAL }}>{doneStep.global}</p>
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                <CodeBlock>{`class Solution {
    public int maxSubArray(int[] nums) {
        int currentMax = nums[0];
        int globalMax  = nums[0];

        for (int i = 1; i < nums.length; i++) {
            // Extend previous sum OR start fresh?
            currentMax = Math.max(nums[i], currentMax + nums[i]);

            // Update best seen so far
            globalMax = Math.max(globalMax, currentMax);
        }

        return globalMax;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line:"int currentMax = nums[0]", exp:"Initialize to first element — handles all-negative arrays correctly (answer is the least-negative element)." },
                    { line:"int globalMax = nums[0]", exp:"Track the best ever seen. Also initialized to first element for the same reason." },
                    { line:"currentMax = Math.max(nums[i], currentMax + nums[i])", exp:"Core of Kadane's: if extending would give a smaller result than starting fresh, reset the subarray here." },
                    { line:"globalMax = Math.max(globalMax, currentMax)", exp:"At every position, check if the current subarray is the best we've ever seen." },
                    { line:"return globalMax", exp:"The answer: maximum subarray sum seen at any point during the scan." },
                  ].map(({ line, exp }) => (
                    <div key={line} className="py-3 flex gap-3 items-start">
                      <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono" style={{ background:"var(--viz-surface)", color:TEAL, border:"1px solid var(--viz-border)" }}>{line}</code>
                      <span className="text-sm text-default-500 leading-relaxed">{exp}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon:"📍", color:TEAL, tip:"Initialize both variables to nums[0] not 0 — the subarray must be non-empty, so 0 is wrong for all-negative input." },
                    { icon:"⚠️", color:GOLD, tip:"The decision at each step: max(nums[i], currentMax + nums[i]). If currentMax is negative, drop it." },
                    { icon:"🔄", color:BLUE, tip:"Related: Maximum Product Subarray (track both min and max), Circular Subarray (total - minSubarray)." },
                    { icon:"🧠", color:RED, tip:"'If adding the previous sum makes things worse, start over here' — that's the entire algorithm." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start" style={{ background:"var(--viz-surface)", border:`1px solid var(--viz-border)`, borderLeft:`3px solid ${color}` }}>
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
