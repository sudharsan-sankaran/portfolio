// Source: submitted COM747 group report, page 4, Gradient Boosting matrix.
// These counts are reported results, not an independently reproduced run.
// This module contains aggregate values only: no node IDs or row predictions.
export const matrix = { tp: 1602, fp: 103, fn: 498, tn: 952 } as const;
export const reportMetrics = [
  { model: "Logistic Regression", precision: "94.10", recall: "75.95", f1: "84.06" },
  { model: "Random Forest", precision: "98.25", recall: "64.10", f1: "77.58" },
  { model: "Gradient Boosting", precision: "93.96", recall: "76.29", f1: "84.20" },
] as const;
