/**
 * Centralized duration parsing.
 *
 * Accepts a wide range of human inputs and converts them into a single
 * canonical integer: total minutes. The input is intentionally forgiving
 * because users type things like "2h", "2 hours 30 mins", "1.5 hr",
 * "90 minutes", or "2:30".
 *
 * Returns `null` when the input cannot be parsed into a positive duration.
 */

export type ParsedDuration = {
  totalMinutes: number;
  hours: number;
  minutes: number;
  display: string; // e.g. "2h 30m" or "45m"
};

const MIN_MINUTES = 1;
const MAX_MINUTES = 24 * 60; // cap at 24 hours; tasks longer than a day are unrealistic

const formatMinutesAsDuration = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return "0m";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const buildResult = (totalMinutes: number): ParsedDuration => ({
  totalMinutes,
  hours: Math.floor(totalMinutes / 60),
  minutes: totalMinutes % 60,
  display: formatMinutesAsDuration(totalMinutes),
});

/**
 * Parse a free-text duration string into a canonical minutes count.
 *
 * Supported formats:
 *   "90"            -> 90 minutes (bare number = minutes)
 *   "2h"            -> 120 minutes
 *   "2 hours"       -> 120 minutes
 *   "1.5h"          -> 90 minutes
 *   "30m"           -> 30 minutes
 *   "30 min"        -> 30 minutes
 *   "2h 30m"        -> 150 minutes
 *   "2 hours 30"    -> 150 minutes (trailing bare number = minutes)
 *   "2:30"          -> 150 minutes
 */
export const parseDurationToMinutes = (
  raw: string | number | null | undefined,
): ParsedDuration | null => {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw <= 0) return null;
    const total = Math.round(raw);
    if (total < MIN_MINUTES || total > MAX_MINUTES) return null;
    return buildResult(total);
  }

  const input = raw.trim().toLowerCase();
  if (!input) return null;

  // Reject obvious garbage like "x", "asdf"
  if (!/[0-9]/.test(input)) return null;

  // "2:30" or "2:30:00" -> hours:minutes(:seconds)
  const colonMatch = input.match(/^(\d+):(\d{1,2})(?::\d{1,2})?$/);
  if (colonMatch) {
    const h = Number(colonMatch[1]);
    const m = Number(colonMatch[2]);
    if (m >= 60) return null;
    const total = h * 60 + m;
    if (total < MIN_MINUTES || total > MAX_MINUTES) return null;
    return buildResult(total);
  }

  // Bare number -> interpret as minutes
  const bareNumberMatch = input.match(/^(\d+(?:\.\d+)?)$/);
  if (bareNumberMatch) {
    const total = Math.round(Number(bareNumberMatch[1]));
    if (total < MIN_MINUTES || total > MAX_MINUTES) return null;
    return buildResult(total);
  }

  // Tokenized parse: pull every <number><unit?> chunk in order.
  // Anything that doesn't match the strict pattern is treated as invalid.
  const tokenRegex =
    /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)?/g;
  let totalMinutes = 0;
  let matched = 0;
  let consumed = "";
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(input)) !== null) {
    const value = Number(match[1]);
    const unitRaw = (match[2] || "").trim();
    if (!Number.isFinite(value) || value < 0) return null;

    let minutesForToken: number;
    if (!unitRaw) {
      // Bare number after a hours token = minutes; bare number alone handled above.
      minutesForToken = Math.round(value);
    } else if (unitRaw.startsWith("h")) {
      minutesForToken = Math.round(value * 60);
    } else {
      minutesForToken = Math.round(value);
    }
    totalMinutes += minutesForToken;
    matched += 1;
    consumed += match[0];
  }

  if (matched === 0) return null;

  // Make sure we consumed essentially all of the input (allowing whitespace/commas/"and")
  const leftover = input
    .replace(tokenRegex, "")
    .replace(/[\s,]+|and/g, "")
    .trim();
  if (leftover) return null;

  if (totalMinutes < MIN_MINUTES || totalMinutes > MAX_MINUTES) return null;
  return buildResult(totalMinutes);
};

export { formatMinutesAsDuration };
