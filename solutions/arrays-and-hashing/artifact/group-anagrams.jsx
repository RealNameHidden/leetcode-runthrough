export const difficulty = 'Medium'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";
import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

// ── Colors ──────────────────────────────────────────────────────────
const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED  = "#ff6b6b";

// ── Reusable Components ──────────────────────────────────────────────
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

// ── Algorithm Simulation ─────────────────────────────────────────────
function simulate(wordsStr) {
  const words = wordsStr.split(',').map(s => s.trim()).filter(Boolean);
  if (words.length === 0) return [];

  const steps = [];
  const map = {};

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const sortedKey = word.split('').sort().join('');

    steps.push({
      phase: 'sort',
      wordIdx: i,
      word,
      sortedKey,
      map: JSON.parse(JSON.stringify(map)),
      desc: `Sort "${word}" alphabetically → key = "${sortedKey}"`,
    });

    if (!map[sortedKey]) map[sortedKey] = [];
    map[sortedKey].push(word);

    steps.push({
      phase: 'insert',
      wordIdx: i,
      word,
      sortedKey,
      map: JSON.parse(JSON.stringify(map)),
      desc: `Add "${word}" to map["${sortedKey}"] → [${map[sortedKey].map(w => `"${w}"`).join(', ')}]`,
    });
  }

  const result = Object.values(map);
  steps.push({
    phase: 'result',
    wordIdx: -1,
    word: null,
    sortedKey: null,
    map: JSON.parse(JSON.stringify(map)),
    result,
    desc: `Complete! ${result.length} anagram group(s) found`,
  });

  return steps;
}

// ── Presets ──────────────────────────────────────────────────────────
const PRESETS = [
  { label: "LC Example", val: "eat,tea,tan,ate,nat,bat" },
  { label: "All Anagrams", val: "abc,bca,cab,xyz,zyx" },
  { label: "Mixed Length", val: "listen,silent,hello,enlist" },
  { label: "Repeated Chars", val: "a,b,a,c,b" },
];

// ── Main Component ───────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]     = useState("Problem");
  const [input, setInput] = useState("eat,tea,tan,ate,nat,bat");
  const [steps, setSteps] = useState([]);
  const [si, setSi]       = useState(0);

  useEffect(() => {
    setSteps(simulate(input));
    setSi(0);
  }, [input]);

  const step  = steps[si] || null;
  const words = input.split(',').map(s => s.trim()).filter(Boolean);
  const GROUP_COLORS = [TEAL, GOLD, BLUE, RED];

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* Header */}
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">🔡</span>
        <h1 className="font-semibold text-base">Group Anagrams</h1>
        <Chip size="sm" color="warning" variant="flat">Medium</Chip>
        <Chip size="sm" color="primary" variant="flat">Arrays & Hashing · Sorting</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs
          selectedKey={tab}
          onSelectionChange={key => setTab(String(key))}
          variant="underlined"
          color="primary"
          size="sm"
        >

          {/* ── PROBLEM TAB ─────────────────────────────────────────── */}
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an array of strings <strong>strs</strong>, group all anagrams together and return
                  them as a list of groups. Two strings are anagrams of each other if they contain the
                  same characters in any order. You may return the groups in any order.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      sig: "List<List<String>> groupAnagrams(String[] strs)",
                      desc: "Group strings that are anagrams of each other. strs.length ≥ 1, each string consists of lowercase English letters.",
                    },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">
                  Example — strs = ["eat","tea","tan","ate","nat","bat"]
                </p>
                <CodeBlock language="text">{`Input:  strs = ["eat","tea","tan","ate","nat","bat"]

Step-by-step:
  "eat" → sort → "aet"  (new group)
  "tea" → sort → "aet"  (joins "eat")
  "tan" → sort → "ant"  (new group)
  "ate" → sort → "aet"  (joins "eat", "tea")
  "nat" → sort → "ant"  (joins "tan")
  "bat" → sort → "abt"  (new group)

HashMap state:
  "aet" → ["eat", "tea", "ate"]
  "ant" → ["tan", "nat"]
  "abt" → ["bat"]

Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Edge Cases</p>
                <CodeBlock language="text">{`strs = ["a"]            → [["a"]]          (single string)
strs = ["abc","bca"]    → [["abc","bca"]]  (two strings, one group)
strs = ["abc","def"]    → [["abc"],["def"]] (no anagrams, two groups)
strs = ["",""]          → [["",""]]        (empty strings are anagrams of each other)`}</CodeBlock>
              </CardBody></Card>

            </div>
          </Tab>

          {/* ── INTUITION TAB ───────────────────────────────────────── */}
          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Canonical Key</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Sort each word's characters to get a <strong>canonical fingerprint</strong>. Every anagram
                      maps to the same sorted form — "eat", "tea", "ate" all become "aet".
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">"eat" → sort → "aet"</p>
                  </div>
                  <div className="flex-1 min-w-48 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>HashMap Grouping</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Use a <code>HashMap&lt;String, List&lt;String&gt;&gt;</code> keyed by the sorted string.
                      Each word appends itself to its group. Return all values at the end.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">map["aet"] → ["eat","tea","ate"]</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`Map<String, List<String>> map = new HashMap<>();

for (String s : strs) {
    // 1. Sort chars → canonical anagram key
    char[] chars = s.toCharArray();
    Arrays.sort(chars);
    String key = new String(chars);

    // 2. Group by key (create list on first encounter)
    map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
}

return new ArrayList<>(map.values());`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                  style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  Sorting gives every anagram group a unique fingerprint. No complex math —
                  just sort and bucket. <code>computeIfAbsent</code> handles the create-or-append pattern in one line.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n · k log k)", s: "n words × sort each word of max length k" },
                    { l: "SPACE", v: "O(n · k)", s: "HashMap stores all characters of all words" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 min-w-28 rounded-lg p-4 text-center"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <p className="text-xs text-default-500 mb-1">{l}</p>
                      <p className="font-bold text-base" style={{ color: TEAL }}>{v}</p>
                      <p className="text-xs text-default-400 mt-1">{s}</p>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

            </div>
          </Tab>

          {/* ── VISUALIZER TAB ──────────────────────────────────────── */}
          <Tab key="Visualizer" title="Visualizer">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">

              {/* Configure */}
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Configure</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {PRESETS.map(p => (
                    <Button
                      key={p.label} size="sm"
                      variant={input === p.val ? "flat" : "bordered"}
                      color={input === p.val ? "primary" : "default"}
                      onPress={() => setInput(p.val)}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Input
                  label="Words (comma-separated)"
                  value={input}
                  onValueChange={v => setInput(v)}
                  placeholder="e.g., eat,tea,tan,ate,nat,bat"
                  variant="bordered"
                  size="sm"
                />
              </CardBody></Card>

              {/* Step-by-Step Debugger */}
              {steps.length > 0 && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Step-by-Step Execution</p>
                  <p className="text-xs font-mono mb-4" style={{ color: TEAL }}>{si + 1}/{steps.length}</p>

                  {/* Status Line */}
                  <p className="text-xs text-default-500 mb-4">
                    {step?.phase === 'sort' && (
                      <>
                        Word: <V color={TEAL}>{step.word}</V> ·
                        Sorted Key: <V color={GOLD}>{step.sortedKey}</V> ·
                        <span style={{ color: BLUE }}> sorting chars…</span>
                      </>
                    )}
                    {step?.phase === 'insert' && (
                      <>
                        Key: <V color={GOLD}>{step.sortedKey}</V> ·
                        Groups: <V color={BLUE}>{Object.keys(step.map).length}</V> ·
                        <span style={{ color: TEAL }}> ✓ inserted</span>
                      </>
                    )}
                    {step?.phase === 'result' && (
                      <>
                        <span style={{ color: TEAL }}>✓ Complete! </span>
                        Groups: <V color={TEAL}>{step.result?.length}</V>
                      </>
                    )}
                  </p>

                  {/* Live Code Block */}
                  <div className="rounded-xl overflow-hidden mb-4"
                    style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine
                      highlight={step?.phase === 'sort'}
                      annotation={step?.phase === 'sort' ? `chars = ['${step?.word?.split('').join("','")}']` : ''}
                      annotationColor={TEAL}
                    >
                      <span style={{ color: "var(--code-muted)" }}>{"char[] chars = s.toCharArray(); Arrays.sort(chars);"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.phase === 'sort'}
                      annotation={step?.phase === 'sort' ? `key = "${step?.sortedKey}"` : ''}
                      annotationColor={GOLD}
                    >
                      <span style={{ color: "var(--code-muted)" }}>{"String key = new String(chars);"}</span>
                    </CodeLine>
                    <CodeLine
                      highlight={step?.phase === 'insert'}
                      annotation={step?.phase === 'insert' ? `map["${step?.sortedKey}"].add("${step?.word}")` : ''}
                      annotationColor={TEAL}
                    >
                      <span style={{ color: "var(--code-muted)" }}>{"map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);"}</span>
                    </CodeLine>
                  </div>

                  {/* Visual Panel */}
                  <div className="rounded-xl p-4 mb-4" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    {/* Words row */}
                    <p className="text-xs text-default-400 mb-2">Input words:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {words.map((w, i) => {
                        const isCurrent = step?.wordIdx === i;
                        const isDone    = step?.phase === 'result' || (step && i < step.wordIdx) ||
                                          (step?.phase === 'insert' && i === step.wordIdx);
                        const mapKeys   = Object.keys(step?.map || {});
                        const myKey     = w.split('').sort().join('');
                        const groupIdx  = mapKeys.indexOf(myKey);
                        const doneColor = groupIdx >= 0 ? GROUP_COLORS[groupIdx % GROUP_COLORS.length] : BLUE;
                        return (
                          <div key={i} className="px-3 py-1 rounded-lg font-mono text-sm transition-all"
                            style={{
                              background: isCurrent ? `${TEAL}28` : isDone ? `${doneColor}18` : "var(--viz-node-bg)",
                              border: `2px solid ${isCurrent ? TEAL : isDone ? doneColor : "var(--viz-border)"}`,
                              color: isCurrent ? TEAL : isDone ? doneColor : "var(--viz-muted)",
                              fontWeight: isCurrent ? 700 : 400,
                            }}>
                            {w}
                          </div>
                        );
                      })}
                    </div>

                    {/* Character sort visualization */}
                    {step?.phase === 'sort' && step.word && (
                      <div className="mb-4 p-3 rounded-lg" style={{ background: "var(--viz-node-bg)", border: `1px solid ${GOLD}33` }}>
                        <p className="text-xs text-default-400 mb-2">
                          Sorting characters of <span style={{ color: TEAL }} className="font-mono font-bold">"{step.word}"</span>:
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex gap-1">
                            {step.word.split('').map((ch, i) => (
                              <div key={i} className="w-7 h-7 rounded flex items-center justify-center text-sm font-mono font-bold"
                                style={{ background: `${TEAL}28`, border: `1px solid ${TEAL}`, color: TEAL }}>
                                {ch}
                              </div>
                            ))}
                          </div>
                          <span style={{ color: GOLD }} className="text-sm font-bold">→ sort →</span>
                          <div className="flex gap-1">
                            {step.sortedKey.split('').map((ch, i) => (
                              <div key={i} className="w-7 h-7 rounded flex items-center justify-center text-sm font-mono font-bold"
                                style={{ background: `${GOLD}28`, border: `1px solid ${GOLD}`, color: GOLD }}>
                                {ch}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HashMap state */}
                    <p className="text-xs text-default-400 mb-2">HashMap state:</p>
                    {Object.keys(step?.map || {}).length === 0 ? (
                      <p className="text-xs text-default-400 italic font-mono">— empty —</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {Object.entries(step?.map || {}).map(([key, group], idx) => {
                          const isActiveKey = step?.sortedKey === key;
                          const color = GROUP_COLORS[idx % GROUP_COLORS.length];
                          return (
                            <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono flex-wrap"
                              style={{
                                background: isActiveKey ? `${color}18` : "var(--viz-node-bg)",
                                border: `1px solid ${isActiveKey ? color : "var(--viz-border)"}`,
                              }}>
                              <span className="font-bold" style={{ color: GOLD }}>"{key}"</span>
                              <span style={{ color: "var(--viz-muted)" }}>→</span>
                              <span style={{ color: isActiveKey ? color : "var(--viz-muted)" }}>
                                [{group.map(w => `"${w}"`).join(', ')}]
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step Description */}
                  <div className="bg-content2 rounded-lg px-4 py-3 mb-4 text-sm font-mono"
                    style={{ borderLeft: `3px solid ${step?.phase === 'result' ? TEAL : step?.phase === 'insert' ? BLUE : GOLD}` }}>
                    {step?.desc}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0}
                      onPress={() => setSi(i => Math.max(0, i - 1))}>← Prev</Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1}
                      onPress={() => setSi(i => Math.min(steps.length - 1, i + 1))}>Next →</Button>
                  </div>
                </CardBody></Card>
              )}

              {/* Final State */}
              {step?.phase === 'result' && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final Anagram Groups</p>
                  <div className="flex flex-col gap-2">
                    {step.result?.map((group, i) => {
                      const color = GROUP_COLORS[i % GROUP_COLORS.length];
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg flex-wrap"
                          style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
                          <span className="text-xs font-mono text-default-500 shrink-0">Group {i + 1}:</span>
                          <span className="text-sm font-mono font-bold" style={{ color }}>
                            [{group.map(w => `"${w}"`).join(', ')}]
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardBody></Card>
              )}

            </div>
          </Tab>

          {/* ── CODE TAB ────────────────────────────────────────────── */}
          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();

        for (String s : strs) {
            // Sort characters to get canonical anagram key
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = new String(chars);

            // Group by sorted key
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        return new ArrayList<>(map.values());
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-Line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    {
                      line: "char[] chars = s.toCharArray(); Arrays.sort(chars);",
                      exp: "Convert string to a mutable char array and sort it. Sorting produces the canonical form shared by all anagrams.",
                    },
                    {
                      line: "String key = new String(chars);",
                      exp: "Convert the sorted char array back to a String. You MUST do this — char[] cannot be used as a HashMap key because arrays don't override equals/hashCode.",
                    },
                    {
                      line: "map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);",
                      exp: "If the key is missing, create a new ArrayList and put it in the map. Then add the original string to the list. One line replaces a 3-line if-check.",
                    },
                    {
                      line: "return new ArrayList<>(map.values());",
                      exp: "Collect all groups (the HashMap's values) into a List and return. Each value is already a List<String> of anagrams.",
                    },
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
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Pattern Memorization</p>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: "📍", color: TEAL, tip: "Sort each string's characters → use as HashMap key. All anagrams share the same sorted form." },
                    { icon: "⚠️", color: GOLD, tip: "Never use char[] as a map key — convert it to String with new String(chars) or toString() won't work as expected." },
                    { icon: "🔄", color: BLUE, tip: "computeIfAbsent is the idiomatic Java one-liner: creates the list if absent, then immediately adds to it." },
                    { icon: "💡", color: TEAL, tip: "Alternative O(k) key: count character frequencies in int[26], use Arrays.toString(count) as the key. Avoids sorting entirely." },
                    { icon: "🎯", color: BLUE, tip: "Related: Valid Anagram (LC 242), Find All Anagrams in a String (LC 438), Minimum Steps to Make Anagram (LC 1347)." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start"
                      style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)", borderLeft: `3px solid ${color}` }}>
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
