export const difficulty = 'Easy'
import { useState, useEffect } from "react";
import CodeBlock from '../../../src/CodeBlock';
import { Tabs, Tab } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import { Button } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Input } from "@heroui/react";

import { ArtifactRevisedButton } from '../../../src/ArtifactRevisedButton'

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
  { label: "LC Example", value: "7,1,5,3,6,4" },
  { label: "Falling", value: "7,6,4,3,1" },
  { label: "Late Profit", value: "9,2,1,7,8" },
  { label: "Small Swing", value: "2,4,1" },
];

function parsePrices(value) {
  const parts = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (parts.length < 2) return { error: "Enter at least two comma-separated prices.", prices: [] };
  const prices = parts.map((item) => Number(item));
  if (prices.some((n) => !Number.isInteger(n) || n < 0)) {
    return { error: "Prices must be non-negative integers.", prices: [] };
  }
  return { error: "", prices };
}

function simulate(prices) {
  const steps = [];
  let minPrice = prices[0];
  let minIndex = 0;
  let bestProfit = 0;
  let bestBuy = 0;
  let bestSell = 0;

  steps.push({
    day: 0,
    price: prices[0],
    minPrice,
    minIndex,
    profitToday: 0,
    bestProfit,
    bestBuy,
    bestSell,
    action: "init",
    windowStart: minIndex,
    windowEnd: 0,
    desc: `Start on day 0. Cheapest price so far is ${prices[0]}.`,
  });

  for (let day = 1; day < prices.length; day++) {
    const price = prices[day];
    const profitToday = price - minPrice;
    let action = "scan";
    let desc = `Sell on day ${day}: profit = ${price} - ${minPrice} = ${profitToday}.`;

    if (profitToday > bestProfit) {
      bestProfit = profitToday;
      bestBuy = minIndex;
      bestSell = day;
      action = "best";
      desc = `New best trade: buy day ${bestBuy} at ${prices[bestBuy]}, sell day ${bestSell} at ${price}, profit = ${bestProfit}.`;
    }

    if (price < minPrice) {
      minPrice = price;
      minIndex = day;
      action = "min";
      desc = `New cheapest buy day found at day ${day}: price = ${price}.`;
    }

    steps.push({
      day,
      price,
      minPrice,
      minIndex,
      profitToday,
      bestProfit,
      bestBuy,
      bestSell,
      action,
      windowStart: minIndex,
      windowEnd: day,
      desc,
    });
  }

  steps.push({
    day: prices.length - 1,
    price: prices[prices.length - 1],
    minPrice,
    minIndex,
    profitToday: prices[prices.length - 1] - minPrice,
    bestProfit,
    bestBuy,
    bestSell,
    action: "done",
    windowStart: bestBuy,
    windowEnd: bestSell,
    desc: bestProfit > 0
      ? `Done. Best trade is buy day ${bestBuy}, sell day ${bestSell}, profit ${bestProfit}.`
      : "Done. Prices never go up after a buy, so the answer is 0.",
  });

  return steps;
}

function PriceBars({ prices, step, finalMode }) {
  if (!prices.length || !step) return null;
  const maxPrice = Math.max(...prices);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-3 min-w-max px-2 pb-2">
        {prices.map((price, idx) => {
          const current = !finalMode && idx === step.day;
          const minDay = !finalMode && idx === step.minIndex;
          const bestBuy = idx === step.bestBuy && step.bestProfit > 0;
          const bestSell = idx === step.bestSell && step.bestProfit > 0;
          const height = 42 + (price / maxPrice) * 110;
          let border = "var(--viz-border)";
          let bg = "var(--viz-node-bg)";

          if (current) {
            border = GOLD;
            bg = `${GOLD}22`;
          } else if (minDay) {
            border = TEAL;
            bg = `${TEAL}1c`;
          }

          if (finalMode && bestBuy) {
            border = TEAL;
            bg = `${TEAL}22`;
          }
          if (finalMode && bestSell) {
            border = BLUE;
            bg = `${BLUE}22`;
          }

          return (
            <div key={`${idx}-${price}`} className="flex flex-col items-center gap-2">
              <div className="text-[10px] font-mono" style={{ color: "var(--viz-muted)" }}>
                d{idx}
              </div>
              <div
                className="w-12 rounded-t-lg flex items-start justify-center pt-2 text-xs font-bold transition-all"
                style={{ height, background: bg, border: `1px solid ${border}`, color: current ? GOLD : minDay ? TEAL : "var(--code-text)" }}
              >
                {price}
              </div>
              <div className="text-[10px] font-mono" style={{ color: current ? GOLD : minDay ? TEAL : bestBuy ? TEAL : bestSell ? BLUE : "var(--viz-muted)" }}>
                {current ? "sell?" : minDay && !finalMode ? "min" : finalMode && bestBuy ? "buy" : finalMode && bestSell ? "sell" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Problem");
  const [pricesInput, setPricesInput] = useState("7,1,5,3,6,4");
  const [prices, setPrices] = useState([]);
  const [steps, setSteps] = useState([]);
  const [si, setSi] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const parsed = parsePrices(pricesInput);
    setError(parsed.error);
    if (parsed.error) {
      setPrices([]);
      setSteps([]);
      setSi(0);
      return;
    }
    setPrices(parsed.prices);
    setSteps(simulate(parsed.prices));
    setSi(0);
  }, [pricesInput]);

  const step = steps[si] || null;
  const finalStep = steps[steps.length - 1] || null;

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-divider px-6 py-4 flex items-center gap-3 bg-content1">
        <span className="text-xl">📈</span>
        <h1 className="font-semibold text-base">Best Time to Buy and Sell Stock</h1>
        <Chip size="sm" color="success" variant="flat">Easy</Chip>
        <Chip size="sm" color="primary" variant="flat">Sliding Window</Chip>
      </div>

      <div className="px-4 pt-3">
        <Tabs selectedKey={tab} onSelectionChange={(key) => setTab(String(key))} variant="underlined" color="primary" size="sm">
          <Tab key="Problem" title="Problem">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Problem Statement</p>
                <p className="text-sm text-default-600 leading-relaxed mb-4">
                  Given an array of daily stock prices, choose exactly one day to <strong>buy</strong> and a later day to <strong>sell</strong>. Return the maximum profit you can make. If every later price is smaller, return <strong>0</strong>.
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { sig: "int maxProfit(int[] prices)", desc: "Return the best profit from one buy and one later sell." },
                  ].map(({ sig, desc }) => (
                    <div key={sig} className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                      <code className="text-xs font-mono flex-shrink-0" style={{ color: TEAL }}>{sig}</code>
                      <span className="text-xs text-default-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Example — prices = [7,1,5,3,6,4]</p>
                <CodeBlock language="text">{`Input: prices = [7,1,5,3,6,4]
Expected output: 5

Step-by-step:
Day 0: buy candidate = 7
Day 1: cheaper buy candidate = 1
Day 2: sell at 5 -> profit = 4
Day 3: sell at 3 -> profit = 2
Day 4: sell at 6 -> profit = 5  <- best
Day 5: sell at 4 -> profit = 3

Best trade: buy at 1, sell at 6, profit = 5`}</CodeBlock>
              </CardBody></Card>
            </div>
          </Tab>

          <Tab key="Intuition" title="Intuition">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">The Core Idea</p>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${TEAL}0d`, borderColor: `${TEAL}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: TEAL }}>Track the Cheapest Buy</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      As you scan from left to right, keep the smallest price seen so far. That price is the best buy candidate for every future day.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">minPrice = cheapest day before today</p>
                  </div>
                  <div className="flex-1 min-w-36 rounded-xl p-4 border" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}33` }}>
                    <p className="text-xs font-bold mb-3" style={{ color: GOLD }}>Evaluate Profit on Each Sell Day</p>
                    <p className="text-sm leading-relaxed text-default-500">
                      Each new day is a possible sell. Profit is just <strong>today's price - cheapest earlier price</strong>. Keep the maximum.
                    </p>
                    <p className="text-xs text-default-400 mt-3 font-mono">profit = prices[i] - minPrice</p>
                  </div>
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Algorithm Template</p>
                <CodeBlock>{`int minPrice = prices[0];
int bestProfit = 0;

for (int day = 1; day < prices.length; day++) {
    int profitToday = prices[day] - minPrice;
    bestProfit = Math.max(bestProfit, profitToday);
    minPrice = Math.min(minPrice, prices[day]);
}

return bestProfit;`}</CodeBlock>
                <div className="mt-3 px-4 py-3 rounded-lg border text-xs leading-relaxed text-default-500" style={{ background: `${GOLD}0d`, borderColor: `${GOLD}44` }}>
                  <span style={{ color: GOLD }} className="font-bold">⚠️ Key insight: </span>
                  The buy day must come before the sell day, so only compare today's price with a minimum price seen on earlier days.
                </div>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Complexity</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { l: "TIME", v: "O(n)", s: "One left-to-right scan" },
                    { l: "SPACE", v: "O(1)", s: "Only a few variables" },
                  ].map(({ l, v, s }) => (
                    <div key={l} className="flex-1 rounded-lg p-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
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
                  {PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      size="sm"
                      variant={pricesInput === preset.value ? "flat" : "bordered"}
                      color={pricesInput === preset.value ? "primary" : "default"}
                      onPress={() => setPricesInput(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Input
                  label="Prices"
                  variant="bordered"
                  size="sm"
                  value={pricesInput}
                  onValueChange={setPricesInput}
                />
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
                    Day: <span style={{ color: GOLD }}>{step.day}</span> ·
                    Price: <span style={{ color: GOLD }}>{step.price}</span> ·
                    Min so far: <span style={{ color: TEAL }}>{step.minPrice}</span> ·
                    Best profit: <span style={{ color: BLUE }}>{step.bestProfit}</span> ·
                    <span style={{ color: step.action === "min" ? TEAL : step.action === "best" ? BLUE : step.action === "done" ? GOLD : "var(--viz-muted)" }}>
                      {step.action === "min" ? " new minimum" : step.action === "best" ? " new best trade" : step.action === "done" ? " final answer" : " scan"}
                    </span>
                  </p>

                  <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--code-bg)", border: "1px solid var(--code-border)" }}>
                    <CodeLine highlight={step.action === "init"} annotation={`minPrice = ${step.minPrice}`} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>int minPrice = prices[0]</span>
                    </CodeLine>
                    <CodeLine highlight={step.action !== "done" && step.action !== "init"} annotation={`profitToday = ${step.price} - ${step.minPrice} = ${step.profitToday}`} annotationColor={GOLD}>
                      <span style={{ color: "var(--code-muted)" }}>int profitToday = prices[day] - minPrice</span>
                    </CodeLine>
                    <CodeLine highlight={step.action === "best"} annotation={`bestProfit = ${step.bestProfit}`} annotationColor={BLUE}>
                      <span style={{ color: "var(--code-muted)" }}>bestProfit = Math.max(bestProfit, profitToday)</span>
                    </CodeLine>
                    <CodeLine highlight={step.action === "min"} annotation={`minPrice = ${step.minPrice}`} annotationColor={TEAL}>
                      <span style={{ color: "var(--code-muted)" }}>minPrice = Math.min(minPrice, prices[day])</span>
                    </CodeLine>
                  </div>

                  <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3">Gold = day being evaluated, teal = cheapest buy seen so far.</p>
                    <PriceBars prices={prices} step={step} finalMode={false} />
                  </div>

                  <div className="rounded-lg px-4 py-3 mb-4 text-sm" style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}44` }}>
                    {step.desc}
                  </div>

                  <div className="flex gap-2">
                    <Button fullWidth variant="bordered" size="sm" isDisabled={si === 0} onPress={() => setSi((value) => Math.max(0, value - 1))}>
                      ← Prev
                    </Button>
                    <Button fullWidth color="primary" size="sm" isDisabled={si === steps.length - 1} onPress={() => setSi((value) => Math.min(steps.length - 1, value + 1))}>
                      Next →
                    </Button>
                  </div>
                </CardBody></Card>
              )}

              {finalStep && (
                <Card><CardBody>
                  <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-4">Final State</p>
                  <div className="rounded-xl p-6 mb-4 text-center" style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}33` }}>
                    <p className="text-xs text-default-500 mb-2">Maximum Profit</p>
                    <p className="text-4xl font-bold" style={{ color: TEAL }}>{finalStep.bestProfit}</p>
                    <p className="text-xs text-default-400 mt-2">
                      {finalStep.bestProfit > 0
                        ? `Buy on day ${finalStep.bestBuy}, sell on day ${finalStep.bestSell}`
                        : "No profitable trade exists"}
                    </p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "var(--viz-surface)", border: "1px solid var(--viz-border)" }}>
                    <p className="text-xs text-default-400 mb-3 text-center">Final trade highlight: teal = buy, blue = sell.</p>
                    <PriceBars prices={prices} step={finalStep} finalMode={true} />
                  </div>
                </CardBody></Card>
              )}
            </div>
          </Tab>

          <Tab key="Code" title="Code">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto py-4 pb-10">
              <ArtifactRevisedButton />
              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Full Java Solution</p>
                <CodeBlock>{`public class BestTimeToBuyAndSellStock {
    public int maxProfit(int[] prices) {
        int minPrice = prices[0];
        int bestProfit = 0;

        for (int day = 1; day < prices.length; day++) {
            int profitToday = prices[day] - minPrice;   // sell today
            bestProfit = Math.max(bestProfit, profitToday);
            minPrice = Math.min(minPrice, prices[day]); // better buy?
        }

        return bestProfit;
    }
}`}</CodeBlock>
              </CardBody></Card>

              <Card><CardBody>
                <p className="text-xs font-bold text-default-500 uppercase tracking-wider mb-3">Line-by-line Breakdown</p>
                <div className="flex flex-col divide-y divide-divider">
                  {[
                    { line: "int minPrice = prices[0];", exp: "The best buy candidate starts as the first day." },
                    { line: "int profitToday = prices[day] - minPrice;", exp: "Pretend we sell today and compare with the cheapest earlier buy." },
                    { line: "bestProfit = Math.max(bestProfit, profitToday);", exp: "Keep the best answer seen so far." },
                    { line: "minPrice = Math.min(minPrice, prices[day]);", exp: "Update the cheapest buy candidate for future days." },
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
                    { icon: "📍", color: TEAL, tip: "Track the smallest value so far, not the smallest adjacent pair." },
                    { icon: "⚠️", color: GOLD, tip: "The buy must happen before the sell, so scan left to right exactly once." },
                    { icon: "🔄", color: BLUE, tip: "This is a one-pass sliding window idea: earlier minimum on the left, current sell on the right." },
                    { icon: "💡", color: TEAL, tip: "If prices keep falling, the answer stays 0 because you are allowed to skip trading." },
                    { icon: "🎯", color: BLUE, tip: "Related patterns: maximum difference, running minimum, one-transaction profit problems." },
                  ].map(({ icon, color, tip }) => (
                    <div key={tip} className="flex gap-3 rounded-lg p-3 items-start" style={{ background: "var(--viz-surface)", border: `1px solid var(--viz-border)`, borderLeft: `3px solid ${color}` }}>
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
