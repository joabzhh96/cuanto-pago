import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = ts.transpileModule(
  readFileSync(new URL("../src/paymentSchedule.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } },
).outputText;
const { datesBetween, occurrenceAt, nextUnpaid, annualCommitment } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const payment = {
  date: "2025-09-16",
  recurring: true,
  frequency: "mensual",
  customDays: 30,
  paidDates: [],
  amount: 219,
};
assert.equal(annualCommitment(payment, "2025-09-01"), 2628);
assert.equal(annualCommitment({ ...payment, recurring: false }, "2025-09-01"), 0);
assert.deepEqual(datesBetween({ ...payment, recurring: false }, "2025-10-01", "2025-10-31"), []);
assert.deepEqual(datesBetween({ ...payment, recurring: false }, "2025-09-01", "2025-09-30"), [
  "2025-09-16",
]);
assert.deepEqual(datesBetween({ ...payment, frequency: "semanal" }, "2025-09-01", "2025-09-30"), [
  "2025-09-16",
  "2025-09-23",
  "2025-09-30",
]);
assert.deepEqual(datesBetween({ ...payment, frequency: "quincenal" }, "2025-09-01", "2025-10-31"), [
  "2025-09-16",
  "2025-09-30",
  "2025-10-14",
  "2025-10-28",
]);
assert.equal(occurrenceAt({ ...payment, date: "2025-01-31" }, 1), "2025-02-28");
assert.equal(occurrenceAt({ ...payment, date: "2025-01-31" }, 2), "2025-03-31");
assert.equal(occurrenceAt({ ...payment, date: "2024-02-29", frequency: "anual" }, 1), "2025-02-28");
assert.equal(
  occurrenceAt({ ...payment, frequency: "personalizada", customDays: 10 }, 2),
  "2025-10-06",
);
assert.equal(nextUnpaid({ ...payment, paidDates: ["2025-09-16"] }, "2025-09-01"), "2025-10-16");
assert.equal(
  nextUnpaid({ ...payment, recurring: false, paidDates: ["2025-09-16"] }, "2025-09-01"),
  undefined,
);
assert.deepEqual(datesBetween({ ...payment, endDate: "2025-10-16" }, "2025-09-01", "2025-12-31"), [
  "2025-09-16",
  "2025-10-16",
]);
assert.equal(annualCommitment({ ...payment, endDate: "2025-08-01" }, "2025-09-01"), 0);
assert.equal(annualCommitment({ ...payment, endDate: "2025-10-16" }, "2025-09-01"), 438);
assert.equal(annualCommitment({ ...payment, frequency: "anual" }, "2025-09-01"), 219);
assert.deepEqual(
  datesBetween(
    { ...payment, date: "2024-01-01", frequency: "personalizada", customDays: 1 },
    "2025-02-01",
    "2025-02-28",
  ).length,
  28,
);
console.log(
  "17 schedule assertions passed: single, weekly, fortnightly, monthly, annual, custom, paid history, end dates and leap years.",
);
