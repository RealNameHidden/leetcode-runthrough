export const difficulty = 'Medium';
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
const RED = "#ff6b6b";

function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 5px", marginLeft: 2,
      borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 12
    }}>
      {children}
    </span>
  );
}

function CodeLine({ children, highlight, annotation, annotationColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12,
      padding: "6px 16px",
      background: highlight ? "rgba(78,204,163,0.08)" : "transparent",
      borderLeft: `3px solid ${highlight ? TEAL : "transparent"}`,
      transition: "background 0.2s",
    }}>
      <div style={{ fontSize: 12, fontFamily: "monospace", lineHeight: 1.5, flexShrink: 0 }}>
        {children}
      </div>
      {annotation && (
        <div style={{ fontSize: 11, color: annotationColor, whiteSpace: "nowrap", fontFamily: "monospace", opacity: 0.85 }}>
          // {annotation}
        </div>
      )}
    </div>
  );
}

function simulate(candidates, target) {
  if (!candidates.length || target <= 0) return [];
  const steps = [];
  const result = [];
  function backtrack(currentSum, combination, startIdx) {
    if (currentSum === target) {
      result.push(combination.slice());
      steps.push({
        phase: 'found',
        combination: combination.slice(),
        result: result.map(r => r.slice()),
        currentSum,
      });
      return;
    }
    if (currentSum > target) {
      steps.push({
        phase: 'prune',
        combination: combination.slice(),
        currentSum,
        result: result.map(r => r.slice()),
      });
      return;
    }
    for (let i = startIdx; i < candidates.length; i++) {
      const num = candidates[i];
      const newSum = currentSum + num;
      steps.push({
        phase: 'choose',
        i,
        num,
        combinationBefore: combination.slice(),
        combinationAfter: [...combination, num],
        currentSum,
        newSum,
        result: result.map(r => r.slice()),
      });
      combination.push(num);
      backtrack(newSum, combination, i);
      combination.pop();
      steps.push({
        phase: 'unchoose',
        num,
        combinationAfter: combination.slice(),
        currentSum,
        result: result.map(r => r.slice()),
      });
    }
  }
  backtrack(0, [], 0);
  return steps;
}

const PRESETS = [
  { label: "LC Example", candidates: "2,3,6,7", target: "7" },
  { label: "Small", candidates: "2,3,5", target: "8" },
  { label: "Single", candidates: "2", target: "4" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [candidatesStr, setCandidatesStr] = useState("2,3,6,7");
  const [targetStr, setTargetStr] = useState("7");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  const candidates = candidatesStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  const target = parseInt(targetStr.trim(), 10) || 0;

  useEffect(() => {
    if (candidates.length && target > 0) {
      setSteps(simulate(candidates, target));
      setSi(0);
    } else {
      setSteps([]);
    }
  }, [candidatesStr, targetStr]);

  const step = steps[si] || null;
  const lastResult = steps.length > 0 ? steps[steps.length - 1].result : [];

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1 flex-wrap">
        <span className="text-xl">🎯</span>
        <h1 className="font-semibold text-base">Combination Sum</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Backtracking</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-4">
                    Given an array of <strong>distinct</strong> integers <strong>candidates</strong> and a <strong>target</strong>, return all unique combinations where the chosen numbers sum to target. The <strong>same number may be chosen</strong> from candidates an unlimited number of times. Two combinations are unique if the frequency of at least one of the chosen numbers is different.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { sig: "List<List<Integer>> combinationSum(int[] candidates, int target)", desc: "Return all unique combinations that sum to target. You may reuse the same element." },
                    ].map(({ sig, desc }) => (
                      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                        <span className="text-xs text-default-500 leading-relaxed min-w-0 flex-1">{desc}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — candidates = [2,3,6,7], target = 7</p>
                  <CodeBlock language="text">{`Input:  candidates = [2, 3, 6, 7], target = 7

Output: [[2, 2, 3], [7]]

Step-by-step: Try 2 → 2+2+3 = 7 ✓. Try 2 → 2+2+6 > 7, prune. Try 3, 6; then 7 alone ✓.
We recurse with the same index to allow reusing a candidate.`}</CodeBlock>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Reuse with same index</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Unlike Subsets, we may use the same candidate many times. So when we recurse after adding <code>candidates[i]</code>, pass <code>i</code> (not <code>i + 1</code>) as the next start index so we can pick it again.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">backtrack(..., i) not i+1</p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Base case and prune</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        If <code>currentSum == target</code>, add a copy of the combination to result. If <code>currentSum &gt; target</code>, return immediately (prune) — no need to explore further.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">sum == target ✓; sum &gt; target ✗</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`void backtrack(int[] candidates, int target, int currentSum,
    List<Integer> combination, List<List<Integer>> result, int startIdx) {
  if (currentSum == target) {
    result.add(new ArrayList<>(combination));
    return;
  }
  if (currentSum > target) return;   // prune
  for (int i = startIdx; i < candidates.length; i++) {
    combination.add(candidates[i]);
    backtrack(candidates, target, currentSum + candidates[i], combination, result, i);  // same i = reuse
    combination.remove(combination.size() - 1);
  }
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    Passing <code>i</code> (not <code>i + 1</code>) into the recursive call is what allows reusing the same candidate; passing <code>startIdx</code> in the loop avoids duplicate combinations like [2,3] and [3,2].
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(N^(T/M + 1))", s: "N = candidates, T = target, M = min(candidate); branching factor and depth" },
                      { l: "SPACE", v: "O(T/M)", s: "Recursion stack depth; output can be large" }
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-1">{l}</p>
                        <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                        <p className="text-xs text-default-400 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

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
                        variant={candidatesStr === p.candidates && targetStr === p.target ? "flat" : "bordered"}
                        color={candidatesStr === p.candidates && targetStr === p.target ? "primary" : "default"}
                        onPress={() => { setCandidatesStr(p.candidates); setTargetStr(p.target); }}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Input label="candidates (comma-separated)" value={candidatesStr} onValueChange={setCandidatesStr} placeholder="2,3,6,7" variant="bordered" size="sm" className="flex-1 min-w-0" />
                    <Input type="number" label="target" value={targetStr} onValueChange={setTargetStr} placeholder="7" variant="bordered" size="sm" className="w-24" />
                  </div>
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Backtracking</p>
                    <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                      {si + 1}/{steps.length}
                    </p>
                    <p className="text-xs text-default-500 mb-4">
                      {step?.phase === 'found' && (
                        <>Found: <V color={TEAL}>[{step.combination?.join(', ')}]</V> → result size: <V color={GOLD}>{step.result?.length}</V></>
                      )}
                      {step?.phase === 'prune' && (
                        <>Prune: sum <V color={RED}>{step.currentSum}</V> &gt; target {target}</>
                      )}
                      {step?.phase === 'choose' && (
                        <>Choose <V color={TEAL}>{step.num}</V> at index <V color={GOLD}>{step.i}</V> · sum: <V color={BLUE}>{step.currentSum}</V> → <V color={BLUE}>{step.newSum}</V></>
                      )}
                      {step?.phase === 'unchoose' && (
                        <>Unchoose <V color={RED}>{step.num}</V> · path: <V color={BLUE}>[{step.combinationAfter?.join(', ')}]</V></>
                      )}
                    </p>
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={step?.phase === 'found'} annotation={step?.phase === 'found' ? `add [${step.combination?.join(', ')}]` : ''} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>result.add(new ArrayList&lt;&gt;(combination))</span>
                      </CodeLine>
                      <CodeLine highlight={step?.phase === 'prune'} annotation={step?.phase === 'prune' ? `currentSum ${step.currentSum} &gt; target` : ''} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>if (currentSum &gt; target) return;</span>
                      </CodeLine>
                      <CodeLine highlight={step?.phase === 'choose'} annotation={step?.phase === 'choose' ? `add ${step.num}, recurse(i=${step.i})` : ''} annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>combination.add(num); backtrack(..., i);</span>
                      </CodeLine>
                      <CodeLine highlight={step?.phase === 'unchoose'} annotation={step?.phase === 'unchoose' ? `remove ${step.num}` : ''} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>combination.remove(combination.size() - 1)</span>
                      </CodeLine>
                    </div>
                    <div className="rounded-xl p-5 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-2">Current combination</p>
                      <p className="font-mono text-sm font-bold mb-4" style={{ color: TEAL }}>
                        [{step?.phase === 'choose' ? step.combinationAfter?.join(', ') : step?.phase === 'unchoose' ? step.combinationAfter?.join(', ') : step?.combination?.join(', ') ?? ''}]
                      </p>
                      <p className="text-xs text-default-400 mb-2">Result so far ({step?.result?.length ?? 0} combinations)</p>
                      <p className="font-mono text-sm" style={{ color: TEAL }}>
                        [{(step?.result ?? []).map(r => `[${r.join(', ')}]`).join(', ')}]
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                      <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Result</p>
                    <div className="rounded-xl p-5 text-center overflow-x-auto" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-3">All combinations that sum to {target}</p>
                      <p className="font-mono text-sm" style={{ color: TEAL }}>
                        {JSON.stringify(lastResult)}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                  <CodeBlock>{`import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result, 0);
        return result;
    }

    private void backtrack(
        int[] candidates,
        int target,
        int currentSum,
        List<Integer> combination,
        List<List<Integer>> result,
        int startIdx
    ) {
        // Base case: found a valid combination
        if (currentSum == target) {
            result.add(new ArrayList<>(combination));
            return;
        }

        // Prune: exceeded target
        if (currentSum > target) {
            return;
        }

        // Try each candidate starting from startIdx
        for (int i = startIdx; i < candidates.length; i++) {
            int num = candidates[i];

            // Choose: add this number
            combination.add(num);

            // Explore: recurse with the SAME index (allow reuse)
            backtrack(candidates, target, currentSum + num, combination, result, i);

            // Unchoose: backtrack
            combination.remove(combination.size() - 1);
        }
    }
}`}</CodeBlock>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "if (currentSum == target) result.add(new ArrayList<>(combination));", exp: "Base case: when the current path sums to target, add a copy of the combination to result." },
                      { line: "if (currentSum > target) return;", exp: "Prune: stop exploring this branch; adding more will only increase the sum." },
                      { line: "for (int i = startIdx; i < candidates.length; i++)", exp: "Try each candidate from startIdx onward to avoid duplicate combinations (e.g. [2,3] only, not [3,2])." },
                      { line: "backtrack(..., currentSum + num, ..., i);", exp: "Pass i (not i+1) so we can reuse the same candidate in the next recursive call." },
                      { line: "combination.remove(combination.size() - 1);", exp: "Unchoose: remove the last element so we can try the next candidate in the loop." },
                    ].map(({ line, exp }) => (
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono" style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>{line}</code>
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
                      { icon: "📍", color: TEAL, tip: "Same-index reuse: pass i (not i+1) into the recursive call so the same candidate can be chosen again." },
                      { icon: "⚠️", color: GOLD, tip: "Always add a copy of the combination (new ArrayList<>(combination)); mutating the same list would corrupt result." },
                      { icon: "🔄", color: BLUE, tip: "Loop from startIdx to avoid duplicate combinations — we only build [2,2,3], not [2,3,2] or [3,2,2]." },
                      { icon: "💡", color: TEAL, tip: "Prune as soon as currentSum > target to avoid unnecessary recursion." },
                      { icon: "🎯", color: BLUE, tip: "Related: Combination Sum II (no reuse, skip duplicates), Subsets, Subset Sum." },
                    ].map(({ icon, color, tip }) => (
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
