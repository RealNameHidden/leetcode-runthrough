export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT = "#06b6d4";
const GOLD = "#fbbf24";
const GREEN = "#10b981";
const RED = "#ef4444";

function simulate(numsStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length === 0) return [];

  const steps = [];
  let maxReach = 0;
  const goal = nums.length - 1;

  steps.push({
    i: 0,
    maxReach: 0,
    action: 'init',
    desc: `Initialize: maxReach=0, goal=${goal}`
  });

  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) {
      steps.push({
        i,
        maxReach,
        action: 'unreachable',
        reachable: false,
        desc: `Index ${i} exceeds maxReach (${maxReach}). Cannot reach!`
      });
      break;
    }

    const prevMax = maxReach;
    maxReach = Math.max(maxReach, i + nums[i]);

    steps.push({
      i,
      maxReach,
      action: 'check',
      num: nums[i],
      reachable: true,
      prevMax,
      desc: `At index ${i}: maxReach = max(${prevMax}, ${i}+${nums[i]}) = ${maxReach}`
    });

    if (maxReach >= goal) {
      steps.push({
        i,
        maxReach,
        action: 'success',
        reachable: true,
        desc: `maxReach (${maxReach}) ≥ goal (${goal}). Can reach the end!`
      });
      break;
    }
  }

  return steps;
}

function ArrayViz({ nums, currentIdx, maxReach, goal }) {
  const maxVal = Math.max(...nums, 1);
  const HEIGHT = 100;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end gap-2 justify-center p-4" style={{ minWidth: '100%' }}>
        {nums.map((num, i) => {
          const barHeight = (num / maxVal) * HEIGHT;
          const isGoal = i === goal;
          const isReachable = i <= maxReach;
          const isCurrent = i === currentIdx;

          let bg = isReachable ? "var(--viz-surface)" : RED + "22";
          if (isCurrent) bg = GOLD;
          if (isGoal) bg = GREEN;

          let borderColor = isReachable ? "var(--viz-border)" : RED;
          if (isCurrent) borderColor = GOLD;
          if (isGoal) borderColor = GREEN;

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="transition-all rounded-t"
                style={{
                  width: '32px',
                  height: barHeight,
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  boxShadow: isCurrent ? `0 0 8px ${GOLD}66` : isGoal ? `0 0 8px ${GREEN}66` : 'none'
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
  { label: "LC Example 1", val: "2,3,1,1,4" },
  { label: "LC Example 2", val: "3,2,1,0,4" },
  { label: "Long Jumps", val: "5,0,0,0,0,0" },
];

export default function App() {
  const [tab, setTab] = useState("Visualizer");
  const [input, setInput] = useState("2,3,1,1,4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const goal = nums.length - 1;
  const stepColor = step?.action === 'success' ? GREEN : step?.action === 'unreachable' ? RED : ACCENT;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🦘</span>
        <h1 className="font-semibold text-base">Jump Game</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="success" variant="flat">Greedy</Chip>
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
                      <p className="text-xs font-bold mb-3" style={{ color: ACCENT }}>Track Farthest Reach</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Keep the <strong>maximum index we can reach</strong>. At each position, greedily extend it.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">maxReach = max(maxReach, i + nums[i])</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Greedy Choice</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        We don't decide which jump to take. We just ask: how far can we <strong>possibly</strong> reach?
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Optimal = reach as far as possible</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                  <CodeBlock>{`boolean canJump(int[] nums) {
  int maxReach = 0;

  for (int i = 0; i < nums.length; i++) {
    // Can we reach this position?
    if (i > maxReach) return false;

    // How far can we reach from here?
    maxReach = Math.max(maxReach, i + nums[i]);

    // Can we reach the end?
    if (maxReach >= nums.length - 1) return true;
  }

  return true;
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">💡 Key insight: </span>
                    Greedy works because reaching as far as possible always gives us the best options for the next jump.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n)", s: "Single pass" },
                      { l: "SPACE", v: "O(1)", s: "One variable" }
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
                    placeholder="e.g., 2,3,1,1,4"
                    variant="bordered"
                    size="sm"
                    classNames={{ label: `!text-[${ACCENT}]` }}
                  />
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Jump Heights</p>
                    <ArrayViz nums={nums} currentIdx={step?.i} maxReach={step?.maxReach} goal={goal} />

                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                      <div className="rounded-lg p-4 text-center" style={{ background: `${ACCENT}0d`, border: `1px solid ${ACCENT}33` }}>
                        <p className="text-xs text-default-500 mb-2">Max Reach</p>
                        <p className="text-2xl font-bold" style={{ color: ACCENT }}>{step?.maxReach}</p>
                      </div>
                      <div className="rounded-lg p-4 text-center" style={{ background: `${GREEN}0d`, border: `1px solid ${GREEN}33` }}>
                        <p className="text-xs text-default-500 mb-2">Goal</p>
                        <p className="text-2xl font-bold" style={{ color: GREEN }}>{goal}</p>
                      </div>
                    </div>

                    {step?.reachable === false && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-xs font-mono mb-4" style={{ borderLeft: `3px solid ${RED}` }}>
                        ✗ Cannot reach beyond index {step?.maxReach}
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
