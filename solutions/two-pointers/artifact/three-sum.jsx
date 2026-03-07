export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const ACCENT = "#f43f5e";
const GOLD = "#fbbf24";
const GREEN = "#10b981";
const RED = "#ef4444";
const POINTER = "#8b5cf6";

function simulate(numsStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (nums.length < 3) return [];

  const steps = [];
  nums.sort((a, b) => a - b);

  steps.push({
    action: 'sort',
    nums: [...nums],
    desc: `Sorted array: [${nums.join(', ')}]`
  });

  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) {
      steps.push({
        action: 'skip_duplicate_i',
        i,
        num: nums[i],
        nums: [...nums],
        desc: `Skip duplicate i value: ${nums[i]}`
      });
      continue;
    }

    if (nums[i] > 0) {
      steps.push({
        action: 'early_exit',
        i,
        num: nums[i],
        nums: [...nums],
        desc: `nums[${i}]=${nums[i]} > 0. All remaining sums positive. Stop.`
      });
      break;
    }

    const fixedNum = nums[i];
    let left = i + 1;
    let right = nums.length - 1;

    steps.push({
      action: 'set_pointers',
      i,
      left,
      right,
      fixedNum,
      nums: [...nums],
      desc: `Fixed nums[${i}]=${fixedNum}. Set left=${left}, right=${right}`
    });

    while (left < right) {
      const sum = fixedNum + nums[left] + nums[right];

      steps.push({
        action: 'check_sum',
        i,
        left,
        right,
        fixedNum,
        sum,
        numsLeft: nums[left],
        numsRight: nums[right],
        nums: [...nums],
        desc: `${fixedNum} + ${nums[left]} + ${nums[right]} = ${sum}`
      });

      if (sum === 0) {
        const triplet = [fixedNum, nums[left], nums[right]];
        result.push(triplet);

        steps.push({
          action: 'found_triplet',
          i,
          left,
          right,
          triplet,
          nums: [...nums],
          desc: `Found triplet: [${triplet.join(', ')}]`
        });

        while (left < right && nums[left] === nums[left + 1]) {
          left++;
          steps.push({
            action: 'skip_duplicate_left',
            i,
            left,
            right,
            desc: `Skip duplicate left`
          });
        }

        while (left < right && nums[right] === nums[right - 1]) {
          right--;
          steps.push({
            action: 'skip_duplicate_right',
            i,
            left,
            right,
            desc: `Skip duplicate right`
          });
        }

        left++;
        right--;
      } else if (sum < 0) {
        left++;
        steps.push({
          action: 'sum_too_small',
          i,
          left,
          right,
          sum,
          nums: [...nums],
          desc: `${sum} < 0, need larger sum. Move left++`
        });
      } else {
        right--;
        steps.push({
          action: 'sum_too_large',
          i,
          left,
          right,
          sum,
          nums: [...nums],
          desc: `${sum} > 0, need smaller sum. Move right--`
        });
      }
    }
  }

  steps.push({
    action: 'done',
    result,
    desc: `Found ${result.length} unique triplet${result.length !== 1 ? 's' : ''}`
  });

  return steps;
}

function ArrayViz({ nums, i, left, right }) {
  const maxVal = Math.max(...nums.map(Math.abs), 1);
  const HEIGHT = 100;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-end gap-1 justify-center p-4" style={{ minWidth: '100%' }}>
        {nums.map((num, idx) => {
          const normalized = Math.abs(num) / maxVal;
          const barHeight = normalized * HEIGHT;
          const isFixed = idx === i;
          const isLeft = idx === left;
          const isRight = idx === right;

          let bg = "var(--viz-surface)";
          let borderColor = "var(--viz-border)";

          if (isFixed) {
            bg = `${POINTER}33`;
            borderColor = POINTER;
          } else if (isLeft) {
            bg = `${GOLD}33`;
            borderColor = GOLD;
          } else if (isRight) {
            bg = `${RED}33`;
            borderColor = RED;
          }

          return (
            <div key={idx} className="flex flex-col items-center gap-0.5">
              <div className="transition-all rounded-t"
                style={{
                  width: '24px',
                  height: barHeight || 4,
                  background: bg,
                  border: `2px solid ${borderColor}`
                }}
              />
              <span className="text-[9px] font-mono font-bold">{num}</span>
              <span className="text-[7px]" style={{ color: 'var(--viz-muted)' }}>{idx}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRESETS = [
  { label: "LC Example", val: "-1,0,1,2,-1,-4" },
  { label: "With Duplicates", val: "-1,-1,-1,0,0,1,1" },
  { label: "Simple", val: "-1,0,1" },
];

export default function App() {
  const [tab, setTab] = useState("Visualizer");
  const [input, setInput] = useState("-1,0,1,2,-1,-4");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si] || null;
  const nums = input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const stepColor = step?.action === 'done' ? GREEN : step?.action === 'found_triplet' ? GREEN : ACCENT;

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🎯</span>
        <h1 className="font-semibold text-base">3Sum</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Two Pointers</Chip>
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
                      <p className="text-xs font-bold mb-3" style={{ color: ACCENT }}>Fix One, Find Pair</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Fix element at index i, then use two pointers to find two more elements that complete the triplet.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Reduces 3Sum to 2Sum</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Avoid Duplicates</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Skip duplicate values at fixed position and at both pointers to ensure unique triplets.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">Only one triplet per unique combo</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm</p>
                  <CodeBlock>{`List<List<Integer>> threeSum(int[] nums) {
  Arrays.sort(nums);
  List<List<Integer>> result = new ArrayList<>();

  for (int i = 0; i < nums.length - 2; i++) {
    // Skip duplicates for i
    if (i > 0 && nums[i] == nums[i-1]) continue;

    // Early exit if smallest sum > 0
    if (nums[i] > 0) break;

    int left = i + 1, right = nums.length - 1;
    while (left < right) {
      int sum = nums[i] + nums[left] + nums[right];
      if (sum == 0) {
        result.add(Arrays.asList(nums[i], nums[left], nums[right]));
        // Skip duplicates for left & right
        while (left < right && nums[left] == nums[++left]);
        while (left < right && nums[right] == nums[--right]);
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">💡 Key insight: </span>
                    Sorting + two pointers avoids needing a HashSet and gives us O(n²) time complexity.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(n²)", s: "Outer loop + two pointers" },
                      { l: "SPACE", v: "O(1)", s: "Excluding output" }
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
                    placeholder="e.g., -1,0,1,2,-1,-4"
                    variant="bordered"
                    size="sm"
                    classNames={{ label: `!text-[${ACCENT}]` }}
                  />
                </CardBody>
              </Card>

              {steps.length > 0 && (
                <Card>
                  <CardBody>
                    <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Array Visualization</p>
                    <ArrayViz nums={nums} i={step?.i} left={step?.left} right={step?.right} />

                    {step?.action === 'check_sum' && (
                      <div className="bg-content2 rounded-lg px-4 py-3 mt-4 mb-4 text-xs font-mono">
                        <div className="font-bold mb-2">Current Sum:</div>
                        <div className="text-sm">
                          <span style={{ color: POINTER }}>{step.fixedNum}</span>
                          {' + '}
                          <span style={{ color: GOLD }}>{step.numsLeft}</span>
                          {' + '}
                          <span style={{ color: RED }}>{step.numsRight}</span>
                          {' = '}
                          <span style={{ color: step.sum === 0 ? GREEN : step.sum < 0 ? RED : GOLD }}>
                            {step.sum}
                          </span>
                        </div>
                      </div>
                    )}

                    {step?.action === 'found_triplet' && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-xs font-mono mb-4" style={{ borderLeft: `3px solid ${GREEN}` }}>
                        ✓ Triplet: [{step.triplet.join(', ')}]
                      </div>
                    )}

                    {step?.action === 'done' && (
                      <div className="bg-content2 rounded-lg px-4 py-3 text-xs font-mono mb-4">
                        <div className="font-bold mb-2">Result ({step.result.length} triplet{step.result.length !== 1 ? 's' : ''}):</div>
                        {step.result.length === 0 ? (
                          <p>No triplets found</p>
                        ) : (
                          <div className="space-y-1">
                            {step.result.map((triplet, i) => (
                              <div key={i}>[{triplet.join(', ')}]</div>
                            ))}
                          </div>
                        )}
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
