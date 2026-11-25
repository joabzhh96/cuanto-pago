export type Frequency = "semanal" | "quincenal" | "mensual" | "anual" | "personalizada";
export type Schedule = {
  date: string;
  recurring: boolean;
  frequency: Frequency;
  customDays: number;
  endDate?: string;
  paidDates: string[];
};

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const parse = (date: string) => new Date(`${date}T00:00:00Z`);
const dayMs = 86400000;

// Anchor each month to the original day, so January 31 → February 28 → March 31.
export function occurrenceAt(payment: Schedule, index: number): string {
  const anchor = parse(payment.date);
  if (!payment.recurring || index === 0) return payment.date;
  if (payment.frequency === "mensual" || payment.frequency === "anual") {
    const month = anchor.getUTCMonth() + index * (payment.frequency === "anual" ? 12 : 1);
    const lastDay = new Date(Date.UTC(anchor.getUTCFullYear(), month + 1, 0)).getUTCDate();
    return isoDate(
      new Date(Date.UTC(anchor.getUTCFullYear(), month, Math.min(anchor.getUTCDate(), lastDay))),
    );
  }
  const interval =
    payment.frequency === "semanal"
      ? 7
      : payment.frequency === "quincenal"
        ? 14
        : Math.max(1, payment.customDays);
  return isoDate(new Date(anchor.getTime() + index * interval * dayMs));
}

export function datesBetween(payment: Schedule, from: string, to: string): string[] {
  const limit = payment.endDate && payment.endDate < to ? payment.endDate : to;
  if (payment.date > limit) return [];
  if (!payment.recurring) return payment.date >= from ? [payment.date] : [];
  const anchor = parse(payment.date);
  const start = parse(from);
  const monthDifference =
    (start.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    start.getUTCMonth() -
    anchor.getUTCMonth();
  const interval =
    payment.frequency === "semanal"
      ? 7
      : payment.frequency === "quincenal"
        ? 14
        : Math.max(1, payment.customDays);
  let index = Math.max(
    0,
    (payment.frequency === "mensual"
      ? monthDifference
      : payment.frequency === "anual"
        ? Math.floor(monthDifference / 12)
        : Math.floor((start.getTime() - anchor.getTime()) / dayMs / interval)) - 1,
  );
  const dates: string[] = [];
  for (;;) {
    const date = occurrenceAt(payment, index++);
    if (date > limit) break;
    if (date >= from) dates.push(date);
  }
  return dates;
}

export function nextUnpaid(payment: Schedule, from: string): string | undefined {
  if (!payment.recurring)
    return !payment.paidDates.includes(payment.date) ? payment.date : undefined;
  // Search up to a century, including long custom intervals.
  return datesBetween(payment, from, `${Number(from.slice(0, 4)) + 100}${from.slice(4)}`).find(
    (date) => !payment.paidDates.includes(date),
  );
}

export function annualCommitment(payment: Schedule & { amount: number }, from: string): number {
  if (!payment.recurring) return 0;
  const end = parse(from);
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  end.setUTCDate(end.getUTCDate() - 1);
  return datesBetween(payment, from, isoDate(end)).length * payment.amount;
}
