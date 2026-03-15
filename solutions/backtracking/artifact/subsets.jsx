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

function simulate(nums) {
  if (!nums.length) return [{ phase: 'result', path: [], result: [[]] }];
  const steps = [];
  const result = [];
  function backtrack(start, path) {
    result.push(path.map(x => x));
    const snap = () => result.map(r => [...r]);
    steps.push({ phase: 'result', path: path.map(x => x), result: snap() });
    for (let i = start; i < nums.length; i++) {
      steps.push({ phase: 'include', i, num: nums[i], pathBefore: path.map(x => x), pathAfter: [...path, nums[i]], result: snap() });
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
      steps.push({ phase: 'backtrack', i, num: nums[i], pathAfter: path.map(x => x), result: snap() });
    }
  }
  backtrack(0, []);
  return steps;
}

const PRESETS = [
  { label: "LC Example", val: "1,2,3" },
  { label: "Single", val: "5" },
  { label: "Four", val: "1,2,3,4" },
];

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("1,2,3");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    const arr = input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    setSteps(simulate(arr));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));

  return (
    <div className="min-h-full bg-background text-foreground">

      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📋</span>
        <h1 className="font-semibold text-base">Subsets</h1>
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
                    Given an integer array <strong>nums</strong> of <strong>unique</strong> elements, return all possible subsets (the power set). The solution set must <strong>not</strong> contain duplicate subsets. Return the solution in any order.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { sig: "List<List<Integer>> subsets(int[] nums)", desc: "Return all subsets. Empty set [] is included. No duplicate subsets." },
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
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [1,2,3]</p>
                  <CodeBlock language="text">{`Input:  nums = [1, 2, 3]

Output: [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]

Step-by-step: Start with []. For each index, either include or skip.
  Include 1 → [1]; include 2 → [1,2]; include 3 → [1,2,3]. Backtrack, then [1,3], etc.`}</CodeBlock>
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
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Include or Skip</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        At each index <code>i</code>, two choices: include <code>nums[i]</code> in the current path or skip it. Recurse with <code>start = i + 1</code> to avoid reusing elements.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">2^n subsets</p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Add Before Branching</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Add the current path to the result at the start of each recursive call. Then iterate and try including each remaining element, backtrack after each try.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">path → result, then for-each</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock>{`void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
  result.add(new ArrayList<>(path));   // every path is a subset
  for (int i = start; i < nums.length; i++) {
    path.add(nums[i]);                   // include
    backtrack(nums, i + 1, path, result);
    path.remove(path.size() - 1);        // backtrack
  }
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    Adding the path at the beginning of the call captures both the empty set and every partial subset; the loop only adds “next” elements to avoid duplicates.
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n · 2^n)", s: "2^n subsets, each built in O(n)" },
                      { l: "SPACE", v: "O(n)", s: "Recursion stack depth; output is O(n · 2^n)" }
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
                      <Button key={p.label} size="sm" variant={input === p.val ? "flat" : "bordered"} color={input === p.val ? "primary" : "default"} onPress={() => setInput(p.val)}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Input label="nums (comma-separated)" value={input} onValueChange={setInput} placeholder="1,2,3" variant="bordered" size="sm" />
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
                      {step?.phase === 'result' && (
                        <>Add to result: <V color={TEAL}>[{step.path?.join(', ')}]</V> · Total subsets so far: <V color={GOLD}>{step.result?.length}</V></>
                      )}
                      {step?.phase === 'include' && (
                        <>Include <V color={TEAL}>{step.num}</V> at index <V color={GOLD}>{step.i}</V> · path: <V color={BLUE}>[{step.pathAfter?.join(', ')}]</V></>
                      )}
                      {step?.phase === 'backtrack' && (
                        <>Backtrack: remove <V color={RED}>{step.num}</V> · path: <V color={BLUE}>[{step.pathAfter?.join(', ')}]</V></>
                      )}
                    </p>
                    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                      <CodeLine highlight={step?.phase === 'result'} annotation={step?.phase === 'result' ? `path = [${step.path?.join(', ')}]` : ''} annotationColor={TEAL}>
                        <span style={{ color: "var(--code-muted)" }}>result.add(new ArrayList&lt;&gt;(path))</span>
                      </CodeLine>
                      <CodeLine highlight={step?.phase === 'include'} annotation={step?.phase === 'include' ? `i=${step.i}, add ${step.num}` : ''} annotationColor={GOLD}>
                        <span style={{ color: "var(--code-muted)" }}>path.add(nums[i])</span>
                      </CodeLine>
                      <CodeLine highlight={step?.phase === 'backtrack'} annotation={step?.phase === 'backtrack' ? `remove ${step.num}` : ''} annotationColor={RED}>
                        <span style={{ color: "var(--code-muted)" }}>path.remove(path.size() - 1)</span>
                      </CodeLine>
                    </div>
                    <div className="rounded-xl p-5 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-400 mb-2">Current path</p>
                      <p className="font-mono text-sm font-bold mb-4" style={{ color: TEAL }}>
                        [{step?.phase === 'result' ? step.path : step?.pathAfter || step?.pathBefore || step?.path || []}]
                      </p>
                      <p className="text-xs text-default-400 mb-2">Current result ({step?.result?.length ?? 0} subsets)</p>
                      <p className="font-mono text-sm font-bold" style={{ color: TEAL }}>
                        [{(step?.result ?? []).map(s => `[${s.join(', ')}]`).join(', ')}]
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
                      <p className="text-xs text-default-400 mb-3">All subsets (last step has full result)</p>
                      <p className="font-mono text-sm" style={{ color: TEAL }}>
                        {JSON.stringify(steps[steps.length - 1]?.result ?? [])}
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
  public List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    List<Integer> path = new ArrayList<>();
    backtrack(nums, 0, path, result);
    return result;
  }

  private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
    // Every path (at any depth) is a valid subset
    result.add(new ArrayList<>(path));

    for (int i = start; i < nums.length; i++) {
      path.add(nums[i]);           // include
      backtrack(nums, i + 1, path, result);
      path.remove(path.size() - 1); // exclude (backtrack)
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
                      { line: "result.add(new ArrayList<>(path));", exp: "Add a copy of the current path to result at the start of each call. Captures [] and every partial subset." },
                      { line: "for (int i = start; i < nums.length; i++)", exp: "Only consider elements from start onward to avoid duplicate subsets and reuse." },
                      { line: "path.add(nums[i]); backtrack(...); path.remove(path.size()-1);", exp: "Include nums[i], recurse, then backtrack by removing so we can try the next branch." },
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
                      { icon: "📍", color: TEAL, tip: "Classic include/skip backtracking: add path first, then for each index include and recurse, then backtrack." },
                      { icon: "⚠️", color: GOLD, tip: "Always add a copy of path (new ArrayList<>(path)); mutating the same list would corrupt result." },
                      { icon: "🔄", color: BLUE, tip: "Use start index so you only pick elements once and avoid duplicate subsets (e.g. [1,2] vs [2,1])." },
                      { icon: "💡", color: TEAL, tip: "Same pattern extends to Subsets II (with sort + skip duplicates) and Combination Sum." },
                      { icon: "🎯", color: BLUE, tip: "Related: Subsets II, Combinations, Combination Sum, Permutations." },
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
