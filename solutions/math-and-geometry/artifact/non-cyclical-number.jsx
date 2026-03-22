export const difficulty = 'Easy';
import { useState } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Chip } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton';

const TEAL = "#4ecca3";
const GOLD = "#f6c90e";
const BLUE = "#5dade2";
const RED = "#ff6b6b";

export default function App() {
  const [tab, setTab] = useState("Problem");

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1 flex-wrap">
        <span className="text-xl">😊</span>
        <h1 className="font-semibold text-base">Happy Number</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="primary" variant="flat">Math &amp; Geometry · Simulation</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={key => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-4">
                    A <strong>happy number</strong> is a positive integer defined by this process: replace the number by the <strong>sum of the squares of its digits</strong>, and repeat until the value becomes <strong>1</strong> (then it stays 1 forever) or the process <strong>enters a cycle that does not include 1</strong>. Return <strong>true</strong> if <code>n</code> is happy and <strong>false</strong> otherwise.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { sig: "boolean isHappy(int n)", desc: "Return whether repeated digit-square-sum reaches 1. Constraints: 1 ≤ n ≤ 2³¹ − 1." },
                    ].map(({ sig, desc }) => (
                      <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5 flex-wrap" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                        <code className="text-xs font-mono shrink-0 min-w-0 break-all" style={{ color: TEAL }}>{sig}</code>
                        <span className="text-xs text-default-500 leading-relaxed min-w-[6rem] flex-1">{desc}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — n = 19 (happy)</p>
                  <CodeBlock language="text">{`Input:  n = 19

Process:
  1² + 9² = 1 + 81 = 82
  8² + 2² = 64 + 4   = 68
  6² + 8² = 36 + 64 = 100
  1² + 0² + 0² = 1   → stop, happy ✓

Output: true`}</CodeBlock>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — n = 2 (unhappy)</p>
                  <CodeBlock language="text">{`Input:  n = 2

The sequence eventually enters the classic cycle:
  4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → …
Never hits 1.

Output: false`}</CodeBlock>
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
                      <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Define the next value f(n)</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Write n in base 10 as digits d<sub>k</sub>…d<sub>0</sub>. One step is <strong>f(n) = Σ d<sub>i</sub>²</strong>. Happy ⇔ iterating f eventually lands on 1.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">f(19) = 82</p>
                    </div>
                    <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                      <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Cycles, not infinite descent</p>
                      <p className="text-sm leading-relaxed text-default-500">
                        Values can repeat. If you see a number you have seen before in <em>this</em> chain, you are in a loop. If that loop is not 1→1→…, n is unhappy.
                      </p>
                      <p className="text-xs text-default-400 mt-3 font-mono">HashSet = “seen this value”</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Formulas &amp; digit mechanics</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-3">
                    To compute f(n) without strings: peel off the last digit with division and remainder. For n &gt; 0, repeatedly take <code>digit = n % 10</code>, add <code>digit²</code>, then <code>n /= 10</code> until n is 0.
                  </p>
                  <CodeBlock language="text">{`Let n be a positive integer.

  f(n) = sum over digits d of (d²)

Example: n = 1005
  digits: 1, 0, 0, 5
  f(1005) = 1² + 0² + 0² + 5² = 1 + 25 = 26

Why only finitely many successors for bounded n?
  If n has D digits, n < 10^D, but each digit is at most 9, so
  f(n) ≤ D · 9² = 81D.
  For a fixed input range (e.g. 32-bit), repeated f cannot grow without bound;
  the orbit must eventually repeat → cycle detection is valid.`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">The standard unhappy cycle</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-3">
                    Every unhappy starting point eventually reaches the same <span style={{ color: RED }}>8-cycle</span> below (you do not need to memorize it for coding—only that a non-1 repeat implies unhappy):
                  </p>
                  <CodeBlock language="text">{`4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 → …`}</CodeBlock>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm template</p>
                  <CodeBlock>{`boolean isHappy(int n) {
  Set<Integer> seen = new HashSet<>();
  while (!seen.contains(n)) {
    seen.add(n);
    n = sumOfSquaresOfDigits(n);
    if (n == 1) return true;
  }
  return false;   // left loop without hitting 1
}`}</CodeBlock>
                  <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500"
                    style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                    <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                    You do not need to know the cycle explicitly. <strong>Any</strong> repeated value while 1 has not been reached means the process will never reach 1 on this path—so return false immediately.
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Alternative: O(1) extra space (Floyd)</p>
                  <p className="text-sm text-default-600 leading-relaxed mb-3">
                    Treat f as a linked list from n → f(n) → f(f(n)) → … . If there is a cycle not containing 1, Floyd’s “tortoise and hare” (slow = one f-step, fast = two f-steps) will detect a meeting point without a set. Same logic as cycle detection in a list.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { l: "TIME", v: "O(log n)", s: "Each sum-of-squares pass is O(number of digits); only O(1) distinct values possible before a repeat for fixed-width ints in practice." },
                      { l: "SPACE", v: "O(k)", s: "HashSet holds at most k distinct values along the chain before repeat; k is bounded for 32-bit n." },
                    ].map(({ l, v, s }) => (
                      <div key={l} className="flex-1 min-w-36 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
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

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                  <CodeBlock language="java">{`/*
 * LeetCode 202 — Happy Number
 *
 * A happy number is a positive integer where repeated replacement of the number
 * by the sum of the squares of its digits eventually reaches 1. If it loops
 * without hitting 1, it is unhappy.
 *
 * Approach: Track each value seen in a HashSet; if we repeat a value, we're in
 * a cycle that is not the singleton {1}, so return false. If we reach 1, true.
 *
 * Complexity:
 *   Time:  O(log n) per transformation × O(k) steps — k is bounded for 32-bit inputs
 *   Space: O(k) — size of the visited set
 */

import java.util.HashSet;
import java.util.Set;

public class NonCyclicalNumber {

    public boolean isHappy(int n) {
        Set<Integer> visit = new HashSet<>();

        while (!visit.contains(n)) {
            visit.add(n);
            n = sumOfSquares(n);
            if (n == 1) {
                return true;
            }
        }
        return false;
    }

    private int sumOfSquares(int n) {
        int output = 0;

        while (n > 0) {
            int digit = n % 10;
            digit = digit * digit;
            output += digit;
            n /= 10;
        }
        return output;
    }
}`}</CodeBlock>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                  <div className="flex flex-col divide-y divide-divider">
                    {[
                      { line: "while (!visit.contains(n))", exp: "Stop as soon as the current value was seen before: that means a cycle; if we never saw 1, the cycle is unhappy." },
                      { line: "visit.add(n)", exp: "Record this value so a future repeat is detected." },
                      { line: "n = sumOfSquares(n)", exp: "One happiness step: replace n by the sum of squares of its decimal digits." },
                      { line: "if (n == 1) return true", exp: "Reached the fixed point of happy numbers; no need to continue." },
                      { line: "return false", exp: "Exited the loop because n repeated and we never returned true—unhappy." },
                      { line: "digit = n % 10; … n /= 10", exp: "Standard digit extraction: least significant digit first, then shift right in base 10." },
                    ].map(({ line, exp }) => (
                      <div key={line} className="py-3 flex gap-3 items-start">
                        <code className="text-[11px] px-2 py-1 rounded flex-shrink-0 font-mono max-w-[48%] break-all" style={{ background: "var(--viz-surface)", color: TEAL, border: "1px solid var(--viz-border)" }}>{line}</code>
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
                      { icon: "📍", color: TEAL, tip: "f(n) = sum of squares of digits; happy ⇔ iterate f to 1." },
                      { icon: "⚠️", color: GOLD, tip: "A repeat in the sequence (before seeing 1) always means unhappy—do not confuse with “visited digit positions.”" },
                      { icon: "🔄", color: BLUE, tip: "Floyd cycle detection on f gives O(1) extra space; same idea as linked list cycle." },
                      { icon: "🔢", color: TEAL, tip: "For math drills: the unhappy orbit always hits the 4 → … → 4 cycle; happy paths end at 1." },
                      { icon: "🎯", color: BLUE, tip: "Related: detecting cycles in functional graphs, linked list cycle II, finding duplicate numbers." },
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
