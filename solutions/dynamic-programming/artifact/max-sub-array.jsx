export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT = "#8b5cf6";
const GOLD = "#fbbf24";
const GREEN = "#10b981";
const BLUE = "#3b82f6";

function simulate(numsStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return [];

  const steps = [];
  let currentMax = nums[0];
  let globalMax = nums[0];

  steps.push({
    i: 0,
    current: nums[0],
    global: nums[0],
    action: 'init',
    desc: `Initialize: currentMax = ${nums[0]}, globalMax = ${nums[0]}`
  });

  for (let i = 1; i < nums.length; i++) {
    const newCurrent = Math.max(nums[i], currentMax + nums[i]);
    const chosenOption = newCurrent === nums[i] ? 'fresh' : 'extend';

    steps.push({
      i,
      current: newCurrent,
      global: globalMax,
      action: 'decide',
      num: nums[i],
      choices: [nums[i], currentMax + nums[i]],
      chosen: newCurrent,
      chosenOption,
      desc: `At index ${i}: max(${nums[i]}, ${currentMax}+${nums[i]}) = ${newCurrent} (${chosenOption})`
    });

    currentMax = newCurrent;

    if (currentMax > globalMax) {
      globalMax = currentMax;
      steps.push({
        i,
        current: currentMax,
        global: globalMax,
        action: 'update_global',
        desc: `New best! globalMax = ${globalMax}`
      });
    }
  }

  steps.push({
    i: nums.length - 1,
    current: currentMax,
    global: globalMax,
    action: 'done',
    desc: `Maximum subarray sum = ${globalMax}`
  });

  return steps;
}

function ArrayViz({ nums, currentIdx }) {
  const maxVal = Math.max(...nums);
  const minVal = Math.min(...nums);
  const range = maxVal - minVal || 1;
  const HEIGHT = 120;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end gap-2 justify-center p-4" style={{ minWidth: '100%' }}>
        {nums.map((num, i) => {
          const normalized = (num - minVal) / range;
          const barHeight = normalized * HEIGHT;
          const isActive = i === currentIdx;

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="transition-all rounded-t"
                style={{
                  width: '32px',
                  height: barHeight,
                  background: isActive ? GOLD : "var(--viz-surface)",
                  border: `2px solid ${isActive ? GOLD : "var(--viz-border)"}`,
                  boxShadow: isActive ? `0 0 8px ${GOLD}66` : 'none'
                }}
              />
              <span className="text-xs font-mono font-bold">{num}</span>
              <span className="text-[9px]" style={{ color: 'var(--viz-muted)' }}>{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "LC Example 1", val: "-2,1,-3,4,-1,2,1,-5,4" },
  { label: "All Positive", val: "1,2,3,4,5" },
  { label: "All Negative", val: "-5,-4,-3,-2,-1" },
];

export default function App() {
  const [tab, setTab] = useState("Visualizer");
  const [input, setInput] = useState("-2,1,-3,4,-1,2,1,-5,4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const stepColor = step?.action === 'done' ? GREEN : step?.action === 'update_global' ? GOLD : ACCENT;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📈</span>
        <h1 className="font-semibold text-base">Maximum Subarray (Kadane's Algorithm)</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="success" variant="flat">DP</Chip>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined"
          color="primary"
          size="sm"
        >

          {/* INTUITION */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${ACCENT}0d`, borderColor: `${ACCENT}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: ACCENT }}>At Each Position</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Decide: should I <strong>extend the current subarray</strong> or <strong>start fresh</strong>?
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">max(nums[i], prev_sum + nums[i])</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Remember the Best</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Track both the <strong>current best</strong> and the <strong>global best</strong> we've ever seen.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Update globalMax at each step</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Kadane's Algorithm</p>
                  <CodeBlock>{`int maxSubArray(int[] nums) {
  int currentMax = nums[0];
  int globalMax = nums[0];

  for (int i = 1; i < nums.length; i++) {
    // Extend previous sum OR start fresh?
    currentMax = Math.max(nums[i], currentMax + nums[i]);

    // Update best seen so far
    globalMax = Math.max(globalMax, currentMax);
  }

  return globalMax;
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">💡 Key insight: </span>
                    We only keep track of two numbers: the best ending here, and the best ever. No need for extra arrays!
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n)", s: "Single pass" },
                      { l: "SPACE", v: "O(1)", s: "Two variables only" }
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <p className="text-xs text-default-500 mb-1">{l}</p>
                        <p className="font-bold text-base" style={{ color: ACCENT }}>{v}</p>
                        <p className="text-xs text-default-400 mt-1">{s}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* VISUALIZER */}
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
                  <Input
                    label="Array (comma-separated)"
                    value={input}
                    onValueChange={setInput}
                    placeholder="e.g., -2,1,-3,4,-1,2,1,-5,4"
                    variant="bordered"
                    size="sm"
                    classNames={{ label: `!text-[${ACCENT}]` }}
                  />
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Array</p>
                    <ArrayViz nums={nums} currentIdx={step?.i} />

                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                      <div className="rounded-lg p-4 text-center" style={{ background: `${ACCENT}0d`, border: `1px solid ${ACCENT}33` }}>
                        <p className="text-xs text-default-500 mb-2">currentMax</p>
                        <p className="text-2xl font-bold" style={{ color: ACCENT }}>{step?.current}</p>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: `${GOLD}0d`, border: `1px solid ${GOLD}33` }}>
                        <p className="text-xs text-default-500 mb-2">globalMax</p>
                        <p className="text-2xl font-bold" style={{ color: GOLD }}>{step?.global}</p>
                      </div>
                    </div>

                    {step?.choices && (
                      <div className="bg-content2 rounded-lg px-4 py-3 text-xs font-mono mb-4">
                        <p className="font-bold mb-2">Choices at index {step.i}:</p>
                        <p>Start fresh: {step.choices[0]}</p>
                        <p>Extend: {step.choices[1]}</p>
                        <p style={{ color: GREEN }} className="mt-2">✓ Choose: {step.chosen} ({step.chosenOption})</p>
                      </div>
                    )}

                    <div className="bg-content2 rounded-lg px-4 py-3 text-sm font-mono" style={{ borderLeft: `3px solid ${stepColor}` }}>
                      {step?.desc}
                    </div>

                    <div className="flex gap-2 justify-between mt-6">
                      <Button size="sm" onPress={() => setSi(Math.max(0, si - 1))} isDisabled={si === 0}>← Prev</Button>
                      <span className="text-xs self-center">{si + 1} / {steps.length}</span>
                      <Button size="sm" onPress={() => setSi(Math.min(steps.length - 1, si + 1))} isDisabled={si === steps.length - 1}>Next →</Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </Tab>

        </Tabs>
      </div>
    </div>
  );
}
