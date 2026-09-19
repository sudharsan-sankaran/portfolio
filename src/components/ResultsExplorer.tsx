"use client";

import { useEffect, useState } from "react";
import { matrix } from "@/data/report";

type Focus = "precision" | "recall" | "f1";
const { tp, fp, fn, tn } = matrix;
const values = {
  precision: { label: "Precision", value: tp / (tp + fp), count: "1,602 / 1,705", title: "When it raises a flag, how often is it right?", body: "Of 1,705 flagged observations, 1,602 were labelled suspicious and 103 were labelled licit in the test set.", formula: "True positives ÷ all positive predictions" },
  recall: { label: "Recall", value: tp / (tp + fn), count: "1,602 / 2,100", title: "How much of the suspicious activity does it find?", body: "The model caught 1,602 of the 2,100 observations labelled suspicious. It missed the other 498.", formula: "True positives ÷ all actual positives" },
  f1: { label: "F1 score", value: 2 * tp / (2 * tp + fp + fn), count: "2 × 1,602 / 3,805", title: "How do precision and recall balance?", body: "F1 combines precision and recall. It does not describe the cost of an investigation or prove that a model is ready for operational use.", formula: "Twice the true positives ÷ (twice the true positives + false positives + false negatives)" },
} as const;
const fmt = (value: number) => (value * 100).toFixed(2);

export function ResultsExplorer() {
  const [focus, setFocus] = useState<Focus>("precision");
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const current = values[focus];
  const included = (cell: keyof typeof matrix) => cell === "tp" || (cell === "fp" && focus !== "recall") || (cell === "fn" && focus !== "precision");

  return <div className="results-explorer">
    <div className="explorer-topline"><p>Gradient Boosting</p><span>Reported test results</span></div>
    <fieldset className="metric-choices"><legend className="sr-only">Choose a metric to explain</legend>
      {(Object.keys(values) as Focus[]).map(key => <label className={`metric-choice ${focus === key ? "selected" : ""}`} key={key}>
        <input type="radio" name="metric" value={key} checked={focus === key} disabled={!interactive} onChange={() => setFocus(key)} />
        <span>{values[key].label}</span><strong className="numeral">{fmt(values[key].value)}<span className="percent">%</span></strong>
      </label>)}
    </fieldset>
    <div className="explorer-grid">
      <div className="metric-explanation" aria-live="polite" aria-atomic="true">
        <p className="muted">Reading the result</p><h3>{current.title}</h3><p>{current.body}</p>
        <div className="fraction numeral">{current.count}</div><div className="fraction-bar" aria-hidden="true"><span style={{ width: `${current.value * 100}%` }} /></div><p className="formula">{current.formula}</p>
      </div>
      <div className="matrix-wrap"><table className="confusion-matrix"><caption>Confusion matrix <span className="muted">— select a metric to inspect</span></caption>
        <thead><tr><td /><th scope="col">Predicted<br />suspicious</th><th scope="col">Predicted<br />licit</th></tr></thead>
        <tbody><tr><th scope="row">Actual<br />suspicious</th><td className={included("tp") ? "included" : ""}><strong className="numeral">{tp.toLocaleString("en-GB")}</strong><span>True positive</span></td><td className={included("fn") ? "included" : ""}><strong className="numeral">{fn}</strong><span>False negative</span></td></tr>
          <tr><th scope="row">Actual<br />licit</th><td className={included("fp") ? "included" : ""}><strong className="numeral">{fp}</strong><span>False positive</span></td><td className={included("tn") ? "included" : ""}><strong className="numeral">{tn}</strong><span>True negative</span></td></tr></tbody>
      </table><p className="matrix-note"><span className="numeral">3,155</span> test observations. Outlined cells enter the selected calculation.</p></div>
    </div>
    <noscript><p className="no-js-note">Precision is shown above. Recall is 1,602 ÷ 2,100; F1 is 3,204 ÷ 3,805. The complete matrix and model comparison remain available without JavaScript.</p></noscript>
    <p className="result-source">Source: submitted COM747 group report. These figures have not been independently reproduced. They describe the report’s sampled test set, not performance on the full Bitcoin network.</p>
  </div>;
}
