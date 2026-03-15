export const difficulty = 'Hard'
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

const PRESETS = [
  { label: "LC Example", nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  { label: "Increasing", nums: [1, 2, 3, 4, 5], k: 2 },
  { label: "Decreasing", nums: [5, 4, 3, 2, 1], k: 2 },
  { label: "All Same", nums: [2, 2, 2, 2], k: 2 },
];

function parseInput(numsStr, kStr) {
  const nums = numsStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  const k = parseInt(kStr, 10);
  if (nums.length === 0) return { error: "Enter at least one number.", nums: [], k: 0 };
  if (!Number.isInteger(k) || k < 1) return { error: "k must be an integer >= 1.", nums, k: 0 };
  if (k > nums.length) return { error: "k must be <= array length.", nums, k: 0 };
  return { error: "", nums, k };
}

function simulate(nums, k) {
  const steps = [];
  const n = nums.length;
  const result = [];
  const dq = []; // indices, front = dq[0], back = dq[dq.length-1]

  for (let i = 0; i < n; i++) {
    if (dq.length && dq[0] === i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] < nums[i]) dq.pop();
    dq.push(i);
    const currentMax = dq.length ? nums[dq[0]] : null;
    if (i >= k - 1) result.push(nums[dq[0]]);
    const windowStart = i - k + 1;
    const windowEnd = i;
    let desc = `i = ${i}: process nums[${i}] = ${nums[i]}. `;
    if (i < k - 1) desc += "Window not full yet.";
    else desc += `Window [${windowStart}, ${windowEnd}], max = ${currentMax} → result.`;
    steps.push({
      i,
      windowStart: Math.max(0, windowStart),
      windowEnd: i,
      dq: [...dq],
      currentMax,
      resultSoFar: [...result],
      recorded: i >= k - 1,
      desc,
      nums: [...nums],
    });
  }
  return steps;
}

function VisPanel({ nums, step, k, finalMode }) {
  if (!nums.length || !step) return null;
  const { windowStart, windowEnd, dq, i, resultSoFar, recorded } = step;
  const frontIdx = dq.length ? dq[0] : -1;
  const resultLen = nums.length - k + 1;

  const CELL = "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono flex-shrink-0";
  const ROW_LABEL = "text-[10px] font-mono w-14 flex-shrink-0 pt-3 text-right pr-2";

  // ── Row 1: Array ─────────────────────────────────────
  const arrayRow = (
    <div className="flex items-start gap-0">
      <div className={ROW_LABEL} style={{ color: "var(--viz-muted)" }}>array</div>
      <div className="flex flex-col">
        {/* Index labels */}
        <div className="flex gap-2 px-0 mb-1">
          {nums.map((_, idx) => (
            <div key={idx} className="w-10 text-center text-[10px] font-mono" style={{ color: "var(--viz-muted)" }}>{idx}</div>
          ))}
        </div>
        {/* Cells */}
        <div className="flex gap-2">
          {nums.map((val, idx) => {
            const inWindow = !finalMode && idx >= windowStart && idx <= windowEnd;
            const current = !finalMode && idx === i;
            const isFront = !finalMode && idx === frontIdx;
            let border = "var(--viz-border)";
            let bg = "var(--viz-surface)";
            let color = undefined;
            if (inWindow) { border = TEAL; bg = `${TEAL}15`; }
            if (isFront && !current) { border = BLUE; bg = `${BLUE}18`; color = BLUE; }
            if (current) { border = GOLD; bg = `${GOLD}20`; color = GOLD; }
            return (
              <div key={`arr-${idx}`} className={CELL} style={{ background: bg, border: `1px solid ${border}`, color }}>
                {val}
              </div>
            );
          })}
        </div>
        {/* Labels below cells */}
        <div className="flex gap-2 mt-1">
          {nums.map((_, idx) => {
            const isL = !finalMode && idx === windowStart;
            const isI = !finalMode && idx === i;
            const isFront = !finalMode && idx === frontIdx;
            let label = "";
            let labelColor = "var(--viz-muted)";
            if (isI && isFront && isL) { label = "L/i/max"; labelColor = GOLD; }
            else if (isI && isFront) { label = "i/max"; labelColor = GOLD; }
            else if (isI && isL) { label = "L/i"; labelColor = GOLD; }
            else if (isFront && isL) { label = "L/max"; labelColor = BLUE; }
            else if (isI) { label = "i"; labelColor = GOLD; }
            else if (isFront) { label = "max"; labelColor = BLUE; }
            else if (isL) { label = "L"; labelColor = TEAL; }
            return (
              <div key={`lbl-${idx}`} className="w-10 text-center text-[10px] font-mono" style={{ color: labelColor }}>{label}</div>
            );
          })}
        </div>
        {/* Window bracket bar */}
        {!finalMode && (
          <div className="flex gap-2 mt-1">
            {nums.map((_, idx) => {
              const inWindow = idx >= windowStart && idx <= windowEnd;
              return (
                <div key={`bar-${idx}`} className="w-10 h-[2px] rounded-full" style={{ background: inWindow ? TEAL : "transparent" }} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ── Row 2: Deque ─────────────────────────────────────
  const dequeRow = !finalMode && (
    <div className="flex items-start gap-0 mt-4">
      <div className={ROW_LABEL} style={{ color: "var(--viz-muted)" }}>deque</div>
      <div className="flex flex-col">
        {/* Arrow hints + FRONT/BACK labels */}
        <div className="flex items-center mb-1" style={{ minHeight: 16 }}>
          {dq.length === 0 ? null : (
            <>
              <div className="text-[10px] font-mono mr-2" style={{ color: "var(--viz-muted)" }}>← pollFirst</div>
              <div className="flex gap-2">
                {dq.map((dqIdx, pos) => {
                  const isFront = pos === 0;
                  const isBack = pos === dq.length - 1;
                  let label = "";
                  if (isFront && isBack) label = "FRONT / BACK";
                  else if (isFront) label = "FRONT";
                  else if (isBack) label = "BACK";
                  return (
                    <div key={`dlbl-${dqIdx}`} className="w-10 text-center text-[10px] font-mono font-bold" style={{ color: isFront ? BLUE : "var(--viz-muted)" }}>
                      {label}
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] font-mono ml-2" style={{ color: "var(--viz-muted)" }}>offerLast →</div>
            </>
          )}
        </div>
        {/* Deque cells */}
        {dq.length === 0 ? (
          <div className="flex items-center justify-center h-10 px-4 rounded-lg text-xs" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", color: "var(--viz-muted)", minWidth: 80 }}>
            — empty —
          </div>
        ) : (
          <div className="flex gap-2">
            {dq.map((dqIdx, pos) => {
              const isFront = pos === 0;
              const border = isFront ? BLUE : "var(--viz-border)";
              const bg = isFront ? `${BLUE}18` : "var(--viz-surface)";
              const color = isFront ? BLUE : undefined;
              return (
                <div key={`dq-${dqIdx}`} className="flex flex-col items-center gap-0.5">
                  <div className="text-[10px] font-mono" style={{ color: "var(--viz-muted)" }}>[{dqIdx}]</div>
                  <div className={CELL} style={{ background: bg, border: `1px solid ${border}`, color }}>
                    {nums[dqIdx]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Monotonic note */}
        {dq.length > 1 && (
          <div className="text-[10px] font-mono mt-1" style={{ color: "var(--viz-muted)" }}>
            values: {dq.map(j => nums[j]).join(" ≥ ")} (decreasing)
          </div>
        )}
      </div>
    </div>
  );

  // ── Row 3: Result ─────────────────────────────────────
  const resultRow = (
    <div className="flex items-start gap-0 mt-4">
      <div className={ROW_LABEL} style={{ color: "var(--viz-muted)" }}>result</div>
      <div className="flex flex-col">
        <div className="flex gap-2">
          {Array.from({ length: resultLen }).map((_, rIdx) => {
            const filled = rIdx < resultSoFar.length;
            const isNewest = !finalMode && recorded && rIdx === resultSoFar.length - 1;
            let border = "var(--viz-border)";
            let bg = "var(--viz-surface)";
            let color = "var(--viz-muted)";
            if (filled) { border = TEAL; bg = `${TEAL}15`; color = TEAL; }
            if (isNewest) { border = GOLD; bg = `${GOLD}20`; color = GOLD; }
            return (
              <div key={`res-${rIdx}`} className={CELL} style={{ background: bg, border: `1px solid ${border}`, color }}>
                {filled ? resultSoFar[rIdx] : "?"}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-1">
          {Array.from({ length: resultLen }).map((_, rIdx) => (
            <div key={`ridx-${rIdx}`} className="w-10 text-center text-[10px] font-mono" style={{ color: "var(--viz-muted)" }}>{rIdx}</div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max px-1 py-2">
        {arrayRow}
        {dequeRow}
        {resultRow}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [numsStr, setNumsStr] = useState("1,3,-1,-3,5,3,6,7");
  const [kStr, setKStr] = useState("3");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [error, setError] = useState("");

  const parsed = parseInput(numsStr, kStr);
  const { error: parseError, nums, k } = parsed;

  useEffect(() => {
    const { error: e, nums: n, k: kVal } = parseInput(numsStr, kStr);
    if (e) {
      setError(e);
      setSteps([]);
      setSi(0);
      return;
    }
    setError("");
    setSteps(simulate(n, kVal));
    setSi(0);
  }, [numsStr, kStr]);

  const step = steps[si] || null;
  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;

  function applyPreset(preset) {
    setNumsStr(preset.nums.join(","));
    setKStr(String(preset.k));
  }
  function isActive(preset) {
    const parsed = parseInput(numsStr, kStr);
    if (parsed.error) return false;
    return parsed.nums.length === preset.nums.length &&
      parsed.nums.every((v, i) => v === preset.nums[i]) && parsed.k === preset.k;
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🪟</span>
        <h1 className="font-semibold text-base">Sliding Window Maximum</h1>
        <Chip size="sm" color="danger" variant="flat">Hard</Chip>
        <Chip size="sm" color="primary" variant="flat">Sliding Window · Deque</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  You are given an array of integers <code>nums</code> and an integer <code>k</code>. There is a sliding window of size <code>k</code> that moves from the very left to the very right of the array. Return an array where each element is the maximum value in the corresponding window.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int[] maxSlidingWindow(int[] nums, int k)", desc: "Return array of length n - k + 1; each entry is the max in that window. Constraints: 1 <= k <= n." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono flex-shrink-0" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — nums = [1,3,-1,-3,5,3,6,7], k = 3</p>
                <CodeBlock language="text">{`Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Expected output: [3, 3, 5, 5, 6, 7]

Window positions and max:
  [1  3 -1] -3  5  3  6  7   → max 3
   1 [3 -1 -3] 5  3  6  7   → max 3
   1  3 [-1 -3  5] 3  6  7   → max 5
   1  3 -1 [-3  5  3] 6  7   → max 5
   1  3 -1 -3 [5  3  6] 7   → max 6
   1  3 -1 -3  5 [3  6  7]  → max 7`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Monotonic Deque</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Store indices in the deque so that values at those indices are in decreasing order. The front is always the index of the current window maximum.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">dq: indices, nums[dq[i]] ≥ nums[dq[i+1]]</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Window Boundary</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      When the front index falls outside the current window (equals i - k), remove it. Then add the current index after dropping any back indices whose values are smaller than the current value.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">poll first if dq.peekFirst() == i - k</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`List<Integer> result = new ArrayList<>();
Deque<Integer> dq = new ArrayDeque<>();  // indices

for (int i = 0; i < nums.length; i++) {
    if (!dq.isEmpty() && dq.peekFirst() == i - k)
        dq.pollFirst();   // out of window
    while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i])
        dq.pollLast();    // smaller elements never become max
    dq.offerLast(i);
    if (i >= k - 1)
        result.add(nums[dq.peekFirst()]);
}

return result.stream().mapToInt(Integer::intValue).toArray();`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Store indices (not values) so you can both check "out of window" and compare values via nums[idx]. Only keep useful candidates—any element smaller than a later one to its right can never be the max of a future window.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "Each index pushed and popped at most once" },
                    { l: "SPACE", v: "O(k)", s: "Deque holds at most k indices" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 min-w-36 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
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
                  {PRESETS.map((p) => (
                    <Button
                      key={p.label}
                      size="sm"
                      variant={isActive(p) ? "flat" : "bordered"}
                      color={isActive(p) ? "primary" : "default"}
                      onPress={() => applyPreset(p)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Input label="Numbers (comma-separated)" variant="bordered" size="sm" value={numsStr} onValueChange={setNumsStr} className="flex-1 min-w-0" />
                  <Input label="k" variant="bordered" size="sm" type="number" value={kStr} onValueChange={setKStr} className="w-20" />
                </div>
                {error && (
                  <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: `${RED}12`, border: `1px solid ${RED}44`, color: RED }}>
                    {error}
                  </div>
                )}
              </CardBody></Card>

              {step && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Step-by-Step Debugger</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>
                    {si + 1}/{steps.length}
                  </p>

                  <p className="text-xs text-default-500 mb-4">
                    i: <span style={{ color: GOLD }}>{step.i}</span> ·
                    Window: <span style={{ color: TEAL }}>[{step.windowStart}, {step.windowEnd}]</span> ·
                    Max: <span style={{ color: BLUE }}>{step.currentMax ?? "—"}</span> ·
                    <span style={{ color: step.recorded ? TEAL : "var(--viz-muted)" }}>
                      {step.recorded ? " recorded to result" : " window not full"}
                    </span>
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine highlight={step.dq.length && step.dq[0] === step.i - k} annotation={step.dq.length && step.dq[0] === step.i - k ? `poll first (out of window)` : "front in window"} annotationColor={step.dq[0] === step.i - k ? RED : TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>if (dq.peekFirst() == i - k) dq.pollFirst()</span>
                    </CodeLine>
                    <CodeLine highlight={true} annotation={`while back &lt; nums[${step.i}]=${step.nums[step.i]}, poll last`} annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>while (nums[dq.peekLast()] &lt; nums[i]) dq.pollLast()</span>
                    </CodeLine>
                    <CodeLine highlight={true} annotation={`dq.offerLast(${step.i})`} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>dq.offerLast(i)</span>
                    </CodeLine>
                    <CodeLine highlight={step.recorded} annotation={step.recorded ? `result = nums[dq.peekFirst()] = ${step.currentMax}` : "i &lt; k - 1"} annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>if (i &gt;= k - 1) result[ri++] = nums[dq.peekFirst()]</span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-5 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">Teal = window, gold = current i, blue = deque front (max), gold cell in result = just recorded.</p>
                    <VisPanel nums={step.nums} step={step} k={k} finalMode={false} />
                  </div>

                  <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}44` }}>
                    {step.desc}
                  </div>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi((v) => Math.max(0, v - 1))}>
                      ← Prev
                    </Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi((v) => Math.min(steps.length - 1, v + 1))}>
                      Next →
                    </Button>
                  </div>
                </CardBody></Card>
              )}

              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final State</p>
                  <div className="rounded-xl p-6 mb-4 text-center" style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}33` }}>
                    <p className="text-xs text-default-500 mb-2">Result (max in each window)</p>
                    <p className="text-xl font-bold font-mono" style={{ color: TEAL }}>[{finalStep.resultSoFar.join(", ")}]</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">Final result array — all window maximums.</p>
                    <VisPanel nums={finalStep.nums} step={finalStep} k={k} finalMode={true} />
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class SlidingWindowMaximum {
    public int[] maxSlidingWindow(int[] nums, int k) {
        if (nums == null || nums.length == 0) return new int[0];

        List<Integer> result = new ArrayList<>();

        // Deque stores INDICES, not values
        Deque<Integer> dq = new ArrayDeque<>();

        for (int i = 0; i < nums.length; i++) {
            // 1. Remove indices that are out of the window boundary
            if (!dq.isEmpty() && dq.peekFirst() == i - k) {
                dq.pollFirst();
            }

            // 2. Remove indices of elements smaller than current (they'll never be max)
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) {
                dq.pollLast();
            }

            // 3. Add current element's index to the back
            dq.offerLast(i);

            // 4. Once we've hit window size k, start recording the max
            if (i >= k - 1) {
                result.add(nums[dq.peekFirst()]);
            }
        }

        return result.stream().mapToInt(Integer::intValue).toArray();
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "if (nums == null || nums.length == 0) return new int[0];", exp: "Guard: empty input yields empty result." },
                    { line: "List<Integer> result = new ArrayList<>();", exp: "Grow the result dynamically — no need to pre-calculate the output size." },
                    { line: "Deque<Integer> dq = new ArrayDeque<>();", exp: "Deque holds indices (not values) so we can check window boundary and compare via nums[idx]." },
                    { line: "if (!dq.isEmpty() && dq.peekFirst() == i - k) dq.pollFirst();", exp: "Front index just left the window (it was the leftmost); remove it." },
                    { line: "while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) dq.pollLast();", exp: "Elements smaller than current can never be the max of any future window containing current; drop them from the back." },
                    { line: "dq.offerLast(i);", exp: "Add current index; deque stays sorted by decreasing value (monotonic)." },
                    { line: "if (i >= k - 1) result.add(nums[dq.peekFirst()]);", exp: "Once the window has k elements, the front of the deque is the index of the current window max; append it." },
                    { line: "return result.stream().mapToInt(Integer::intValue).toArray();", exp: "Convert the list to a primitive int[] for the return type." },
                  ].map(({ line, exp }) => (
                    <div key={line} className="py-3 flex gap-3 items-start">
                      <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono" style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
                        {line}
                      </code>
                      <span className="text-sm text-default-500 leading-relaxed">{exp}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📍", color: TEAL, tip: "Deque stores indices, not values—so you can both test \"out of window\" and compare values via nums[idx]." },
                    { icon: "⚠️", color: GOLD, tip: "Monotonic deque: only keep \"useful\" candidates. Any element smaller than a later one to its right can never be the max of a future window." },
                    { icon: "🔄", color: BLUE, tip: "Front of deque is always the current window max; back is the most recently added index (after removing smaller ones)." },
                    { icon: "💡", color: TEAL, tip: "Out-of-window check: front index equals i - k (the index that just left the left side of the window)." },
                    { icon: "🎯", color: BLUE, tip: "Related: Next Greater Element (monotonic stack), Min Stack, other sliding-window max/min problems." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
