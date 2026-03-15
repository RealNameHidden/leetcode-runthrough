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
  return (
    <span style={{ display:"inline-block", padding:"1px 5px", marginLeft:2, borderRadius:4, background:`${color}28`, color, fontWeight:700, fontSize:12 }}>
      {children}
    </span>
  );
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
  if (nums.length < 3) return [];
  const steps = [];
  nums.sort((a, b) => a - b);
  steps.push({ action:'sort', nums:[...nums], desc:`Sorted: [${nums.join(', ')}]` });
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i-1]) { steps.push({ action:'skip_duplicate_i', i, num:nums[i], nums:[...nums], desc:`Skip duplicate i=${nums[i]}` }); continue; }
    if (nums[i] > 0) { steps.push({ action:'early_exit', i, nums:[...nums], desc:`nums[${i}]=${nums[i]}>0, stop` }); break; }
    const fixedNum = nums[i];
    let left = i+1, right = nums.length-1;
    steps.push({ action:'set_pointers', i, left, right, fixedNum, nums:[...nums], desc:`Fix nums[${i}]=${fixedNum}, left=${left}, right=${right}` });
    while (left < right) {
      const sum = fixedNum + nums[left] + nums[right];
      steps.push({ action:'check_sum', i, left, right, fixedNum, sum, numsLeft:nums[left], numsRight:nums[right], nums:[...nums], desc:`${fixedNum}+${nums[left]}+${nums[right]}=${sum}` });
      if (sum === 0) {
        const triplet = [fixedNum, nums[left], nums[right]];
        result.push(triplet);
        steps.push({ action:'found_triplet', i, left, right, triplet, result:result.map(t=>[...t]), nums:[...nums], desc:`Found triplet: [${triplet.join(', ')}]` });
        while (left < right && nums[left]===nums[left+1]) { left++; steps.push({ action:'skip_dup_left', i, left, right, nums:[...nums], desc:`Skip dup left` }); }
        while (left < right && nums[right]===nums[right-1]) { right--; steps.push({ action:'skip_dup_right', i, left, right, nums:[...nums], desc:`Skip dup right` }); }
        left++; right--;
      } else if (sum < 0) {
        left++;
        steps.push({ action:'sum_too_small', i, left, right, sum, nums:[...nums], desc:`${sum}<0, move left++` });
      } else {
        right--;
        steps.push({ action:'sum_too_large', i, left, right, sum, nums:[...nums], desc:`${sum}>0, move right--` });
      }
    }
  }
  steps.push({ action:'done', result:result.map(t=>[...t]), desc:`Found ${result.length} unique triplet${result.length!==1?'s':''}` });
  return steps;
}

function ArrayViz({ nums, i, left, right }) {
  if (!nums || nums.length===0) return null;
  const maxVal = Math.max(...nums.map(Math.abs), 1);
  const HEIGHT = 100;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end gap-1 justify-center p-4" style={{ minWidth:'100%' }}>
        {nums.map((num, idx) => {
          const isFixed=idx===i, isLeft=idx===left, isRight=idx===right;
          let bg="var(--viz-surface)", bc="var(--viz-border)";
          if (isFixed) { bg=`${TEAL}33`; bc=TEAL; }
          else if (isLeft) { bg=`${GOLD}33`; bc=GOLD; }
          else if (isRight) { bg=`${RED}33`; bc=RED; }
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <div className="transition-all rounded-t" style={{ width:'24px', height:(Math.abs(num)/maxVal)*HEIGHT||4, background:bg, border:`2px solid ${bc}` }} />
              <span className="text-[9px] font-mono font-bold">{num}</span>
              <span className="text-[7px]" style={{ color:'var(--viz-muted)' }}>{idx}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label:"LC Example", val:"-1,0,1,2,-1,-4" },
  { label:"With Dups", val:"-1,-1,-1,0,0,1,1" },
  { label:"Simple", val:"-1,0,1" },
  { label:"No Result", val:"0,1,2,3" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("-1,0,1,2,-1,-4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => { setSteps(simulate(input)); setSi(0); }, [input]);

  const step = steps[si] || null;
  const doneStep = steps[steps.length-1];

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🎯</span>
        <h1 className="font-semibold text-base">3Sum</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Two Pointers</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">

          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an integer array <strong>nums</strong>, return all unique triplets <code>[a, b, c]</code> such that <code>a + b + c == 0</code>. The result must not contain duplicate triplets.
                </p>
                <div className="flex flex-col gap-2">
                  {[{ sig:"List<List<Integer>> threeSum(int[] nums)", desc:"Return all unique triplets summing to zero. Duplicates in output not allowed." }].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono min-w-0 break-all" style={{ color:TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [-1, 0, 1, 2, -1, -4]</p>
                <CodeBlock language="text">{`Input:  nums = [-1, 0, 1, 2, -1, -4]

Step 1: Sort  →  [-4, -1, -1, 0, 1, 2]

Step 2: Fix i=-4, two-pointer on rest → no triplet sums to 0
Step 3: Fix i=-1 (first), L→0, R→2  → (-1)+0+1=0  ✓  triplet: [-1, 0, 1]
Step 4: Fix i=-1 (second) → SKIP (duplicate i value)
Step 5: Fix i=0,  L→1, R→1 → pointers cross, done

Output: [[-1, -1, 2], [-1, 0, 1]]`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background:`${TEAL}0d`, borderColor:`${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color:TEAL }}>Fix One, Find Pair</p>
                    <p className="text-sm leading-relaxed text-default-500">Fix element at index i, then use two pointers on the remaining sorted subarray. This reduces 3Sum → 2Sum.</p>
                    <p className="text-xs text-default-400 mt-3 font-mono">O(n²) instead of O(n³)</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background:`${GOLD}0d`, borderColor:`${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color:GOLD }}>Avoid Duplicates</p>
                    <p className="text-sm leading-relaxed text-default-500">Skip equal adjacent values at i, left, and right after finding a triplet. Sort groups them for easy skipping.</p>
                    <p className="text-xs text-default-400 mt-3 font-mono">3 skip checks needed</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`Arrays.sort(nums);
for (int i = 0; i < nums.length - 2; i++) {
  if (i > 0 && nums[i] == nums[i-1]) continue; // skip dup i
  if (nums[i] > 0) break;                       // early exit
  int left = i + 1, right = nums.length - 1;
  while (left < right) {
    int sum = nums[i] + nums[left] + nums[right];
    if (sum == 0) { result.add(...); left++; right--; }
    else if (sum < 0) left++;
    else right--;
  }
}`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background:`${GOLD}0d`, borderColor:`${GOLD}44` }}>
                  <span style={{ color:GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Sorting enables two pointers AND makes de-duplication easy — equal values are adjacent so you can skip them with a simple while loop.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3">
                  {[{ l:"TIME", v:"O(n²)", s:"Sort O(n log n) + two-pointer loops" }, { l:"SPACE", v:"O(1)", s:"Excluding output list" }].map(({ l, v, s }) => (
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
                <Input label="Array (comma-separated)" value={input} onValueChange={setInput} placeholder="-1,0,1,2,-1,-4" variant="bordered" size="sm" />
              </CardBody></Card>

              {steps.length > 0 && step && (
                <Card><CardBody>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-xs font-mono text-default-500"><strong style={{ color: TEAL }}>{si + 1}</strong> / {steps.length}</span>
                  </div>

                  <p className="text-xs text-default-500 mb-4">
                    Action: <span style={{ color:step.action==='found_triplet'||step.action==='done'?TEAL:step.action==='early_exit'?RED:GOLD }}>{step.action}</span>
                    {step.fixedNum !== undefined && <> · Fixed: <V color={TEAL}>{step.fixedNum}</V></>}
                    {step.left !== undefined && <> · L[<V color={GOLD}>{step.left}</V>] R[<V color={RED}>{step.right}</V>]</>}
                    {step.sum !== undefined && <> · Sum: <V color={step.sum===0?TEAL:step.sum<0?BLUE:RED}>{step.sum}</V></>}
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background:"var(--code-bg)", border:"1px solid var(--code-border)" }}>
                    <CodeLine highlight={step.action==='sort'} annotation={step.action==='sort'?`sorted: [${step.nums?.join(', ')}]`:'sort input'} annotationColor={TEAL}>
                      <span style={{ color:"var(--code-muted)" }}>Arrays.<span style={{ color:TEAL }}>sort</span>(nums)</span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='skip_duplicate_i'} annotation={step.action==='skip_duplicate_i'?`dup i=${step.num}, skip`:'skip dup i'} annotationColor={GOLD}>
                      <span style={{ color:"var(--code-muted)" }}>if (i &gt; 0 &amp;&amp; nums[i] == nums[i-1]) <span style={{ color:GOLD }}>continue</span></span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='check_sum'} annotation={step.action==='check_sum'?`sum = ${step.sum}`:'compute sum'} annotationColor={step?.sum===0?TEAL:step?.sum<0?BLUE:RED}>
                      <span style={{ color:"var(--code-muted)" }}>int sum = nums[i] + nums[<span style={{ color:GOLD }}>left</span>] + nums[<span style={{ color:RED }}>right</span>]</span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='found_triplet'} annotation={step.action==='found_triplet'?`added [${step.triplet?.join(', ')}]`:'triplet found!'} annotationColor={TEAL}>
                      <span style={{ color:"var(--code-muted)" }}>if (sum == 0) result.<span style={{ color:TEAL }}>add</span>(...)</span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='sum_too_small'} annotation={step.action==='sum_too_small'?`sum<0 → left++`:'move left'} annotationColor={GOLD}>
                      <span style={{ color:"var(--code-muted)" }}>else if (sum &lt; 0) <span style={{ color:GOLD }}>left++</span></span>
                    </CodeLine>
                    <CodeLine highlight={step.action==='sum_too_large'} annotation={step.action==='sum_too_large'?`sum>0 → right--`:'move right'} annotationColor={RED}>
                      <span style={{ color:"var(--code-muted)" }}>else <span style={{ color:RED }}>right--</span></span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-4 mb-4" style={{ background:"var(--viz-surface)", border:"1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-2 text-center">
                      <span style={{ color:TEAL }}>■</span> Fixed(i) &nbsp; <span style={{ color:GOLD }}>■</span> Left &nbsp; <span style={{ color:RED }}>■</span> Right
                    </p>
                    <ArrayViz nums={step.nums} i={step.i} left={step.left} right={step.right} />
                  </div>

                  <p className="text-xs font-mono px-3 py-2 rounded mb-4" style={{ background:"var(--viz-surface)", borderLeft:`3px solid ${step.action==='found_triplet'||step.action==='done'?TEAL:step.action==='early_exit'?RED:GOLD}` }}>
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
                  {doneStep.result?.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {doneStep.result.map((t, i) => (
                        <div key={i} className="px-3 py-2 rounded font-mono text-sm" style={{ background:`${TEAL}18`, border:`1px solid ${TEAL}44` }}>[{t.join(', ')}]</div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-default-400">No triplets found</p>}
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                <CodeBlock>{`class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();

        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue; // skip dup i
            if (nums[i] > 0) break;                         // early exit

            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return result;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line:"Arrays.sort(nums)", exp:"Sort enables two-pointer technique and groups equal values for easy duplicate skipping." },
                    { line:"if (i>0 && nums[i]==nums[i-1]) continue", exp:"Skip duplicate outer values to avoid producing the same triplet more than once." },
                    { line:"if (nums[i] > 0) break", exp:"Optimization: sorted array means all remaining sums will also be positive. Safe to stop." },
                    { line:"int left=i+1, right=len-1", exp:"Two-pointer setup on the subarray to the right of i." },
                    { line:"if (sum == 0) result.add(...)", exp:"Valid triplet found. Record it then advance both pointers, skipping any duplicates." },
                    { line:"else if (sum < 0) left++", exp:"Sum too small — move left pointer right to get a larger number." },
                    { line:"else right--", exp:"Sum too large — move right pointer left to get a smaller number." },
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
                    { icon:"📍", color:TEAL, tip:"Sort first — it's the foundation that makes both two-pointer and de-duplication possible." },
                    { icon:"⚠️", color:GOLD, tip:"Three places to skip duplicates: at i, after moving left, after moving right. Forget one → duplicate triplets." },
                    { icon:"🚀", color:BLUE, tip:"Early exit: if nums[i] > 0, all subsequent sums are positive too. Break immediately." },
                    { icon:"🔄", color:RED, tip:"Related: Two Sum II (sorted input), Four Sum (add one more outer loop)." },
                    { icon:"🧠", color:TEAL, tip:"Mental model: Fix one element, then the problem becomes Two Sum on the rest." },
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
