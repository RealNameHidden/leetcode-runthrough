export const difficulty = "Medium";

import { useState, useEffect } from "react";
import CodeBlock from "../../../src/CodeBlock";
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

// ── Keyframe animations injected once ────────────────────────────────────────
const ANIM_CSS = `
@keyframes ts-pulse {
  0%, 100% { box-shadow: 0 0 6px 2px rgba(78,204,163,0.3); }
  50%       { box-shadow: 0 0 14px 6px rgba(78,204,163,0.6); }
}
@keyframes ts-idle-pulse {
  0%, 100% { box-shadow: 0 0 6px 2px rgba(246,201,14,0.25); }
  50%       { box-shadow: 0 0 12px 5px rgba(246,201,14,0.5); }
}
@keyframes ts-slide-in {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ts-slide-right {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes ts-arrow-flow {
  0%   { opacity: 0.2; transform: translateX(0); }
  50%  { opacity: 1;   transform: translateX(4px); }
  100% { opacity: 0.2; transform: translateX(0); }
}
@keyframes ts-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-3px); }
}
@keyframes ts-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

// ── Reusable: V badge ─────────────────────────────────────────────────────────
function V({ children, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "1px 5px", marginLeft: 2,
      borderRadius: 4, background: `${color}28`, color, fontWeight: 700, fontSize: 12,
    }}>
      {children}
    </span>
  );
}

// ── Reusable: CodeLine ────────────────────────────────────────────────────────
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

// ── Gantt cell ─────────────────────────────────────────────────────────────────
function GanttCell({ state, isCurrent }) {
  const style = {
    exec:  { bg: TEAL,           border: TEAL,          text: "#0b0f0e", label: "●" },
    cool:  { bg: `${RED}33`,     border: `${RED}77`,    text: RED,       label: "○" },
    avail: { bg: "var(--viz-surface)", border: "var(--viz-border)", text: "var(--viz-muted)", label: "" },
    done:  { bg: "transparent",  border: "transparent", text: "transparent", label: "" },
    idle:  { bg: `${GOLD}22`,    border: `${GOLD}66`,   text: GOLD,      label: "—" },
    empty: { bg: "transparent",  border: "transparent", text: "transparent", label: "" },
  }[state] || { bg: "transparent", border: "transparent", text: "transparent", label: "" };

  return (
    <div style={{
      width: 24, height: 20, margin: "0 1px",
      borderRadius: 4,
      background: style.bg,
      border: `1px solid ${isCurrent ? TEAL : style.border}`,
      boxShadow: isCurrent && state === "exec" ? `0 0 8px ${TEAL}88` : "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 9, fontWeight: 700,
      color: style.text,
      flexShrink: 0,
      transition: "all 0.15s ease",
      outline: isCurrent ? `1px solid ${TEAL}44` : "none",
    }}>
      {style.label}
    </div>
  );
}

// ── Gantt grid ─────────────────────────────────────────────────────────────────
function GanttGrid({ timeline, taskLabels, currentTime }) {
  const rows = [...taskLabels, "IDLE"];
  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ minWidth: Math.max(currentTime * 26 + 48, 200) }}>
        {/* Time header */}
        <div style={{ display: "flex", paddingLeft: 36 }}>
          {Array.from({ length: currentTime }).map((_, t) => (
            <div key={t} style={{
              width: 24, margin: "0 1px",
              textAlign: "center", fontSize: 9, fontFamily: "monospace",
              color: t + 1 === currentTime ? TEAL : "var(--viz-muted)",
              fontWeight: t + 1 === currentTime ? 700 : 400,
            }}>
              {t + 1}
            </div>
          ))}
        </div>
        {/* Task rows */}
        {rows.map(label => (
          <div key={label} style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            <div style={{
              width: 34, fontSize: 10, fontWeight: 700, fontFamily: "monospace", flexShrink: 0,
              color: label === "IDLE" ? GOLD : TEAL,
            }}>
              {label}
            </div>
            {Array.from({ length: currentTime }).map((_, t) => {
              const state = timeline[label]?.[t + 1] || "empty";
              return <GanttCell key={t} state={state} isCurrent={t + 1 === currentTime} />;
            })}
          </div>
        ))}
        {/* Legend */}
        <div style={{ display: "flex", gap: 12, paddingLeft: 36, marginTop: 8, flexWrap: "wrap" }}>
          {[
            { color: TEAL, label: "Executing", shape: "●" },
            { color: RED,  label: "Cooldown",  shape: "○" },
            { color: GOLD, label: "Idle",       shape: "—" },
          ].map(({ color, label, shape }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "var(--viz-muted)" }}>
              <span style={{ color, fontWeight: 700, fontSize: 10 }}>{shape}</span> {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Heap bars ──────────────────────────────────────────────────────────────────
function HeapBars({ heapSnap, executed }) {
  if (heapSnap.length === 0) {
    return (
      <p style={{ color: "var(--viz-muted)", textAlign: "center", fontSize: 11, padding: "8px 0", fontFamily: "monospace" }}>
        — heap empty —
      </p>
    );
  }
  const maxCount = heapSnap[0].count;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {heapSnap.map(({ task, count }, i) => {
        const isExec = task === executed;
        const color = isExec ? TEAL : i === 0 ? GOLD : "var(--viz-border)";
        return (
          <div key={task} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: isExec ? `${TEAL}22` : `${GOLD}0d`,
              border: `2px solid ${isExec ? TEAL : GOLD}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, fontFamily: "monospace",
              color: isExec ? TEAL : GOLD, flexShrink: 0,
              animation: isExec ? "ts-pulse 1.2s ease-in-out infinite" : "none",
            }}>
              {task}
            </div>
            <div style={{ flex: 1, height: 10, background: "var(--viz-surface)", borderRadius: 5, overflow: "hidden", border: "1px solid var(--viz-border)" }}>
              <div style={{
                width: `${(count / maxCount) * 100}%`, height: "100%",
                background: isExec ? TEAL : GOLD,
                borderRadius: 5, opacity: isExec ? 1 : 0.55,
                transition: "width 0.3s ease",
              }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: isExec ? TEAL : GOLD, minWidth: 12 }}>
              {count}
            </span>
            {isExec && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3, background: `${TEAL}22`, color: TEAL, border: `1px solid ${TEAL}55` }}>
                EXEC
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Cooldown chips ─────────────────────────────────────────────────────────────
function CooldownChips({ cooldownSnap, currentTime, n }) {
  if (cooldownSnap.length === 0) {
    return (
      <p style={{ color: "var(--viz-muted)", textAlign: "center", fontSize: 11, padding: "8px 0", fontFamily: "monospace" }}>
        — queue empty —
      </p>
    );
  }
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {cooldownSnap.map(({ task, count, availAt }) => {
        const timeLeft = availAt - currentTime;
        const entryTime = availAt - n - 1;
        const progress = n > 0 ? Math.min(1, (currentTime - entryTime) / n) : 1;
        const isReady = timeLeft <= 0;
        return (
          <div key={`${task}-${availAt}`} style={{
            padding: "6px 10px", borderRadius: 10, minWidth: 68,
            background: isReady ? `${TEAL}18` : `${RED}12`,
            border: `1px solid ${isReady ? TEAL : RED}55`,
            animation: "ts-float 2s ease-in-out infinite",
            transition: "all 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: isReady ? TEAL : RED }}>
                {task}
              </span>
              <span style={{ fontSize: 9, color: "var(--viz-muted)" }}>×{count}</span>
            </div>
            <div style={{ height: 3, background: "var(--viz-border)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
              <div style={{
                width: `${progress * 100}%`, height: "100%",
                background: isReady ? TEAL : RED, borderRadius: 2,
                transition: "width 0.3s ease",
              }} />
            </div>
            <div style={{ fontSize: 8, color: "var(--viz-muted)", fontFamily: "monospace" }}>
              {isReady ? "✓ ready" : `t=${availAt} (${timeLeft}left)`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Animated Pipeline ──────────────────────────────────────────────────────────
function Pipeline({ step }) {
  const { executed, released, heapSnap, cooldownSnap, n } = step;
  const isIdle = executed === "IDLE";
  const hasRelease = !!released;
  const hasCooldown = cooldownSnap.length > 0;
  const arrowColor = isIdle ? GOLD : TEAL;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, justifyContent: "center", padding: "8px 0" }}>

      {/* HEAP */}
      <div style={{
        flex: 1, maxWidth: 140,
        padding: "10px 12px", borderRadius: 12,
        background: "var(--viz-surface)", border: `1px solid var(--viz-border)`,
        minHeight: 90,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          📦 Heap
        </div>
        {heapSnap.length === 0
          ? <div style={{ fontSize: 10, color: "var(--viz-muted)", fontFamily: "monospace" }}>empty</div>
          : heapSnap.slice(0, 4).map(({ task, count }, i) => (
            <div key={task} style={{
              display: "flex", alignItems: "center", gap: 4, marginBottom: 3,
              animation: i === 0 && !isIdle ? "ts-slide-in 0.3s ease" : "none",
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: "50%",
                background: i === 0 && !isIdle ? `${TEAL}22` : `${GOLD}0d`,
                border: `1.5px solid ${i === 0 && !isIdle ? TEAL : GOLD}`,
                fontSize: 9, fontWeight: 700, fontFamily: "monospace",
                color: i === 0 && !isIdle ? TEAL : GOLD,
              }}>
                {task}
              </span>
              <div style={{ flex: 1, height: 5, background: "var(--viz-border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${(count / (heapSnap[0]?.count || 1)) * 100}%`, height: "100%",
                  background: i === 0 && !isIdle ? TEAL : GOLD, opacity: 0.6, borderRadius: 3,
                }} />
              </div>
              <span style={{ fontSize: 9, color: "var(--viz-muted)", fontFamily: "monospace" }}>×{count}</span>
            </div>
          ))
        }
        {heapSnap.length > 4 && (
          <div style={{ fontSize: 8, color: "var(--viz-muted)", marginTop: 2 }}>+{heapSnap.length - 4} more</div>
        )}
      </div>

      {/* Arrow Heap→CPU */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px", gap: 2 }}>
        <div style={{ fontSize: 14, animation: !isIdle ? "ts-arrow-flow 0.8s ease-in-out infinite" : "none", color: arrowColor }}>
          ➡️
        </div>
        {!isIdle && (
          <div style={{
            fontSize: 9, fontWeight: 700, fontFamily: "monospace",
            color: TEAL, animation: "ts-slide-in 0.3s ease",
            background: `${TEAL}22`, padding: "1px 4px", borderRadius: 3, border: `1px solid ${TEAL}44`,
          }}>
            {executed}
          </div>
        )}
      </div>

      {/* CPU */}
      <div style={{
        width: 96, padding: "10px 8px",
        borderRadius: 12,
        background: isIdle ? `${GOLD}0d` : `${TEAL}0d`,
        border: `1.5px solid ${isIdle ? GOLD : TEAL}`,
        animation: isIdle ? "ts-idle-pulse 1.2s ease-in-out infinite" : "ts-pulse 1.2s ease-in-out infinite",
        textAlign: "center", minHeight: 90,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
      }}>
        <div style={{ fontSize: 22 }}>{isIdle ? "💤" : "🖥️"}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: isIdle ? GOLD : TEAL, textTransform: "uppercase", letterSpacing: 1 }}>
          {isIdle ? "Idle" : "CPU"}
        </div>
        {!isIdle && (
          <div style={{
            fontSize: 18, fontWeight: 700, fontFamily: "monospace", color: TEAL,
            animation: "ts-pulse 1s ease-in-out infinite",
          }}>
            {executed}
          </div>
        )}
        <div style={{ fontSize: 8, color: "var(--viz-muted)", fontFamily: "monospace" }}>
          t = {step.time}
        </div>
      </div>

      {/* Arrow CPU→Cooldown */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px", gap: 2 }}>
        <div style={{
          fontSize: 14,
          animation: hasCooldown ? "ts-arrow-flow 0.8s ease-in-out 0.2s infinite" : "none",
          color: hasCooldown ? RED : "var(--viz-border)",
          opacity: hasCooldown ? 1 : 0.3,
        }}>
          ➡️
        </div>
        {hasRelease && (
          <div style={{
            fontSize: 9, fontWeight: 700, fontFamily: "monospace",
            color: TEAL, animation: "ts-slide-right 0.3s ease",
            background: `${TEAL}22`, padding: "1px 4px", borderRadius: 3, border: `1px solid ${TEAL}44`,
          }}>
            ↩{released}
          </div>
        )}
      </div>

      {/* COOLDOWN QUEUE */}
      <div style={{
        flex: 1, maxWidth: 140, padding: "10px 12px", borderRadius: 12,
        background: "var(--viz-surface)", border: `1px solid var(--viz-border)`,
        minHeight: 90,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: RED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          ⏳ Cooldown
        </div>
        {cooldownSnap.length === 0
          ? <div style={{ fontSize: 10, color: "var(--viz-muted)", fontFamily: "monospace" }}>empty</div>
          : cooldownSnap.map(({ task, count, availAt }) => {
            const timeLeft = availAt - step.time;
            return (
              <div key={`${task}-${availAt}`} style={{
                display: "flex", alignItems: "center", gap: 4, marginBottom: 4,
                animation: "ts-slide-right 0.3s ease",
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${RED}18`, border: `1.5px solid ${RED}66`,
                  fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: RED,
                }}>
                  {task}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 4, background: "var(--viz-border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.max(5, (1 - timeLeft / (n + 1)) * 100)}%`,
                      height: "100%", background: RED, borderRadius: 2, opacity: 0.7,
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 8, color: "var(--viz-muted)", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                  -{timeLeft}
                </span>
              </div>
            );
          })
        }
      </div>

      {/* Back-loop arrow */}
      {hasCooldown && (
        <div style={{
          position: "absolute", fontSize: 9, color: "var(--viz-muted)",
          display: "none", // decorative hint only in description
        }} />
      )}
    </div>
  );
}

// ── Simulation ─────────────────────────────────────────────────────────────────
function simulate(input) {
  const match = input.match(/^([A-Z]+)\s+n=(\d+)$/);
  if (!match) return [];

  const tasksStr = match[1];
  const n = parseInt(match[2]);

  // Count frequencies
  const freq = {};
  for (const ch of tasksStr) freq[ch] = (freq[ch] || 0) + 1;
  const taskLabels = Object.keys(freq).sort();
  const remainingFreq = { ...freq };

  // Max-heap as sorted array of {task, count}
  let heap = taskLabels.map(task => ({ task, count: freq[task] }));
  heap.sort((a, b) => b.count - a.count);

  // Cooldown queue: [{task, count, availAt}] sorted by availAt asc
  let cooldownQueue = [];

  // Shared timeline: timeline[task][time] = "exec"|"cool"|"avail"|"done"
  const timeline = {};
  for (const t of [...taskLabels, "IDLE"]) timeline[t] = [];

  let time = 0;
  const steps = [];

  while (heap.length > 0 || cooldownQueue.length > 0) {
    time++;

    // Release from cooldown (may release multiple)
    let released = null;
    while (cooldownQueue.length > 0 && cooldownQueue[0].availAt === time) {
      const item = cooldownQueue.shift();
      heap.push(item);
      released = item.task; // track last released (usually only one)
    }
    heap.sort((a, b) => b.count - a.count);

    // Execute most frequent task
    let executed = "IDLE";
    if (heap.length > 0) {
      const top = heap.shift();
      executed = top.task;
      remainingFreq[top.task]--;
      if (top.count - 1 > 0) {
        cooldownQueue.push({ task: top.task, count: top.count - 1, availAt: time + n + 1 });
        cooldownQueue.sort((a, b) => a.availAt - b.availAt);
      }
    }

    // Build timeline cells for this time unit
    const cooldownSet = new Set(cooldownQueue.map(x => x.task));
    const heapSet = new Set(heap.map(x => x.task));
    for (const label of taskLabels) {
      if (label === executed) {
        timeline[label][time] = "exec";
      } else if (cooldownSet.has(label)) {
        timeline[label][time] = "cool";
      } else if (remainingFreq[label] > 0 || heapSet.has(label)) {
        timeline[label][time] = "avail";
      } else {
        timeline[label][time] = "done";
      }
    }
    timeline["IDLE"][time] = executed === "IDLE" ? "idle" : "empty";

    // Build human description
    const cooldownInfo = cooldownQueue.map(c => `${c.task}×${c.count}→t${c.availAt}`).join(", ") || "none";
    const heapInfo = heap.map(h => `${h.task}×${h.count}`).join(", ") || "empty";
    const desc = executed === "IDLE"
      ? `t=${time}: IDLE (heap empty, cooldown: ${cooldownInfo})`
      : `t=${time}: Execute ${executed}${released ? ` · Released ${released} from cooldown` : ""} · Heap: [${heapInfo}]`;

    steps.push({
      time,
      executed,
      released,
      heapSnap: heap.map(x => ({ ...x })),
      cooldownSnap: cooldownQueue.map(x => ({ ...x })),
      timeline,          // shared ref — past cells never mutated, safe
      taskLabels,
      n,
      desc,
    });

    if (time > 60) break;
  }

  return steps;
}

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: "Idle Gaps",  val: "AAAA n=2" },
  { label: "Balanced",   val: "AAABBB n=2" },
  { label: "No Idle",    val: "AAABBBCCC n=2" },
  { label: "Dense",      val: "AABBCCD n=1" },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Problem");
  const [input, setInput] = useState("AAABBB n=2");
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step = steps[si];
  const isActive = (p) => input === p.val;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Inject animations */}
      <style>{ANIM_CSS}</style>

      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">⏱️</span>
        <h1 className="font-semibold text-base">Task Scheduler</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Heap · Greedy</Chip>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined"
          color="primary"
          size="sm"
        >
          {/* ── PROBLEM TAB ───────────────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-4">
                    Given a list of CPU tasks (uppercase letters) and a cooldown integer <strong>n</strong>, each identical task must wait at least <strong>n</strong> time units between executions. CPU must always be doing something (task or idle). Return the <strong>minimum total time</strong> to finish all tasks.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { sig: "int leastInterval(char[] tasks, int n)", desc: "Return minimum time units. Same task must wait ≥ n intervals between executions. Idle time counts." },
                    ].map(({ sig, desc }) => (
                      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <code className="text-xs font-mono flex-shrink-0" style={{ color: TEAL }}>{sig}</code>
                        <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — ["A","A","A","B","B","B"], n = 2</p>
                  <CodeBlock language="text">{`Tasks: A×3, B×3 | Cooldown n = 2

Schedule:  A → B → idle → A → B → idle → A → B
Time:      1   2     3    4   5     6    7   8

Total = 8 (6 tasks + 2 idle slots)

Why idle? After A at t=1, A cannot run until t=4 (1+2+1).
          Gap is filled with B at t=2, then forced idle at t=3.`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example 2 — ["A","A","A","B","B","B","C","C","C"], n = 2</p>
                  <CodeBlock language="text">{`Tasks: A×3, B×3, C×3 | Cooldown n = 2

Schedule:  A → B → C → A → B → C → A → B → C
Time:      1   2   3   4   5   6   7   8   9

Total = 9 (no idle! Enough task variety to fill cooldown windows)

Key: When we have ≥ n+1 unique tasks, idle time = 0.`}</CodeBlock>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* ── INTUITION TAB ─────────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>📦 Greedy Max-Heap</p>
                      <p className="text-sm leading-relaxed text-default-500">Always execute the most frequent available task. This minimizes idle time by balancing load across tasks and reducing how many times the most-frequent task forces idle gaps.</p>
                      <p className="text-xs text-default-400 mt-3 font-mono">poll() → execute → requeue with (count−1)</p>
                    </div>
                    <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>⏳ Cooldown Queue</p>
                      <p className="text-sm leading-relaxed text-default-500">Tasks that just ran go into a cooldown queue with their availability time. When that time arrives, they re-enter the heap. If the heap is empty while tasks wait in cooldown — that's an idle slot.</p>
                      <p className="text-xs text-default-400 mt-3 font-mono">[task, count, availAt = time + n + 1]</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                  <CodeBlock language="java">{`// 1. Count task frequencies
int[] freq = new int[26];
for (char t : tasks) freq[t - 'A']++;

// 2. Max-heap by frequency
PriorityQueue<Integer> heap =
    new PriorityQueue<>(Collections.reverseOrder());
for (int f : freq) if (f > 0) heap.offer(f);

// 3. Cooldown queue [remaining, availableAt]
Queue<int[]> cooldown = new LinkedList<>();
int time = 0;

while (!heap.isEmpty() || !cooldown.isEmpty()) {
    time++;

    // Release tasks whose cooldown expired
    if (!cooldown.isEmpty() && cooldown.peek()[1] == time)
        heap.offer(cooldown.poll()[0]);

    // Execute most frequent (or idle)
    if (!heap.isEmpty()) {
        int rem = heap.poll() - 1;
        if (rem > 0)
            cooldown.offer(new int[]{rem, time + n + 1});
    }
}
return time;`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key Insight: </span>
                    Cooldown expires at <strong>time + n + 1</strong> (not n). The +1 is because the current execution takes one slot — so next eligible slot is n intervals later.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3">
                    {[
                      { l: "TIME", v: "O(T log k)", s: "T = total time steps, k ≤ 26 unique tasks" },
                      { l: "SPACE", v: "O(k)", s: "freq array (26) + heap + cooldown queue, all bounded by k" },
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 rounded-lg p-4 text-center"
                        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
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

          {/* ── VISUALIZER TAB ────────────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map(p => (
                      <Button key={p.label} size="sm"
                        variant={isActive(p) ? "flat" : "bordered"}
                        color={isActive(p) ? "primary" : "default"}
                        onPress={() => setInput(p.val)}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Input
                    size="sm"
                    placeholder="AAABBB n=2"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    description="Format: TASKS n=COOLDOWN  (e.g. AAABBBCCC n=2)"
                  />
                </CardBody>
              </Card>

              {steps.length > 0 && step && (
                <>
                  {/* Step debugger */}
                  <Card>
                    <CardBody>
                      <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>

                      {/* Step pills */}
                      <div className="flex gap-1.5 mb-4 flex-wrap">
                        {steps.map((s, i) => (
                          <button key={i} onClick={() => setSi(i)}
                            style={{
                              background: i === si ? TEAL : "var(--viz-surface)",
                              border: `1px solid ${i === si ? TEAL : "var(--viz-border)"}`,
                              color: i === si ? "#0b0f0e" : undefined,
                            }}
                            className="px-2.5 py-1 rounded text-xs cursor-pointer">
                            #{i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Status line */}
                      <p className="text-xs text-default-500 mb-4">
                        {step.desc}
                      </p>

                      {/* Live code block */}
                      <div className="rounded-xl overflow-hidden mb-5" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                        <CodeLine highlight annotation={`time = ${step.time}`} annotationColor={TEAL}>
                          <span style={{ color: "var(--code-muted)" }}>time++</span>
                        </CodeLine>
                        <CodeLine
                          highlight={!!step.released}
                          annotation={step.released ? `released: ${step.released}` : "nothing released"}
                          annotationColor={step.released ? TEAL : "var(--code-muted)"}>
                          <span style={{ color: "var(--code-muted)" }}>if (cooldown.peek()[1] == time) heap.offer(...)</span>
                        </CodeLine>
                        <CodeLine
                          highlight={step.executed !== "IDLE"}
                          annotation={step.executed !== "IDLE" ? `executing: ${step.executed}` : ""}
                          annotationColor={TEAL}>
                          <span style={{ color: "var(--code-muted)" }}>if (!heap.isEmpty()) execute(heap.poll())</span>
                        </CodeLine>
                        <CodeLine
                          highlight={step.executed === "IDLE"}
                          annotation={step.executed === "IDLE" ? "no tasks available — idle slot" : ""}
                          annotationColor={GOLD}>
                          <span style={{ color: "var(--code-muted)" }}>{"// else: idle — time increments anyway"}</span>
                        </CodeLine>
                      </div>

                      {/* ── ANIMATED PIPELINE ── */}
                      <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Live Pipeline</p>
                      <div className="rounded-xl p-3 mb-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", position: "relative" }}>
                        <Pipeline step={step} />
                        {/* Back-loop label */}
                        <div style={{ textAlign: "center", marginTop: 4, fontSize: 9, color: "var(--viz-muted)", fontFamily: "monospace" }}>
                          ↺ cooldown → heap when timer expires
                        </div>
                      </div>

                      {/* ── GANTT TIMELINE ── */}
                      <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Task Timeline</p>
                      <div className="rounded-xl p-3 mb-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <GanttGrid
                          timeline={step.timeline}
                          taskLabels={step.taskLabels}
                          currentTime={step.time}
                        />
                      </div>

                      {/* ── HEAP + COOLDOWN PANELS ── */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="rounded-xl p-3" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", minWidth: 0 }}>
                          <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>📦 Heap (ready)</p>
                          <HeapBars heapSnap={step.heapSnap} executed={step.executed} />
                        </div>
                        <div className="rounded-xl p-3" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", minWidth: 0 }}>
                          <p className="text-xs font-bold mb-3" style={{ color: RED }}>⏳ Cooldown Queue</p>
                          <CooldownChips cooldownSnap={step.cooldownSnap} currentTime={step.time} n={step.n} />
                        </div>
                      </div>

                      {/* Prev / Next */}
                      <div className="flex gap-2">
                        <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                          onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                        <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                          onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Final result */}
                  <Card>
                    <CardBody>
                      <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Final Result</p>
                      <p className="text-center text-3xl font-bold mb-1" style={{ color: TEAL }}>
                        {steps[steps.length - 1].time}
                      </p>
                      <p className="text-xs text-default-400 text-center mb-4">total time units</p>
                      {/* Full frozen Gantt */}
                      <div className="rounded-xl p-3" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <GanttGrid
                          timeline={steps[steps.length - 1].timeline}
                          taskLabels={steps[steps.length - 1].taskLabels}
                          currentTime={steps[steps.length - 1].time}
                        />
                      </div>
                    </CardBody>
                  </Card>
                </>
              )}
            </div>
          </Tab>

          {/* ── CODE TAB ──────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Java Solution</p>
                  <CodeBlock language="java">{`public int leastInterval(char[] tasks, int n) {
    // Count frequency of each task (A=0 … Z=25)
    int[] freq = new int[26];
    for (char task : tasks) freq[task - 'A']++;

    // Max-heap stores frequencies in descending order
    PriorityQueue<Integer> maxHeap =
        new PriorityQueue<>(Collections.reverseOrder());
    for (int f : freq) if (f > 0) maxHeap.offer(f);

    // Cooldown queue: [remaining, availableAt]
    Queue<int[]> cooldown = new LinkedList<>();
    int time = 0;

    while (!maxHeap.isEmpty() || !cooldown.isEmpty()) {
        time++;

        // Release tasks whose cooldown just expired
        if (!cooldown.isEmpty() &&
            cooldown.peek()[1] == time)
            maxHeap.offer(cooldown.poll()[0]);

        // Execute highest-frequency available task
        if (!maxHeap.isEmpty()) {
            int rem = maxHeap.poll() - 1;
            if (rem > 0)
                cooldown.offer(new int[]{rem, time + n + 1});
        }
        // else: no tasks ready → idle slot, time still ticks
    }
    return time;
}`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "int[] freq = new int[26]", exp: "Fixed 26-size array — one slot per uppercase letter. Avoids a HashMap entirely." },
                      { line: "PriorityQueue(Collections.reverseOrder())", exp: "Max-heap: largest frequency comes out first. Greedy choice ensures we minimize idle gaps." },
                      { line: "cooldown.peek()[1] == time", exp: "Check if the task at the front of cooldown is ready. Use peek (not isEmpty) so we only release when the timer fires." },
                      { line: "int rem = maxHeap.poll() - 1", exp: "Execute the most frequent task. Decrement count. If rem > 0, it still needs more runs." },
                      { line: "cooldown.offer(new int[]{rem, time + n + 1})", exp: "Schedule the task to re-enter the heap n+1 time units later. +1 because the current slot is already consumed." },
                      { line: "// else: idle slot", exp: "If heap is empty but cooldown isn't, time increments with no work — this is the 'idle' cost." },
                    ].map(({ line, exp }) => (
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono"
                          style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>
                          {line}
                        </code>
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
                      { icon: "📍", color: TEAL, tip: "availAt = time + n + 1. The +1 is critical — the current slot is already taken, so the next earliest is n intervals after." },
                      { icon: "⚠️", color: GOLD, tip: "Idle slots only occur when the heap is empty but cooldown is not. With enough task variety (≥ n+1 types), idle time = 0." },
                      { icon: "🔄", color: BLUE, tip: "The cooldown queue is ordered by availAt, not by task frequency. Use a FIFO (LinkedList) since only one task exits per time unit." },
                      { icon: "💡", color: TEAL, tip: "Formula shortcut: answer = max(tasks.length, (maxFreq - 1) * (n + 1) + countOfMaxFreqTasks). But heap simulation is more robust." },
                      { icon: "🎯", color: GOLD, tip: "Related problems: Course Schedule II (task dependency), Reorganize String (similar greedy), Design Twitter (heap of streams)." },
                    ].map(({ icon, color, tip }) => (
                      <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                        style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
