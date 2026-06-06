export type TimelineParseResult = {
  months?: number;
  min?: number;
  max?: number;
  hasRange: boolean;
  shortLabel?: string;
  longLabel?: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function stripZero(n: number) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(1)));
}

function shortMonthLabel(n: number) {
  return `${stripZero(n)} mo`;
}

function longMonthLabel(n: number) {
  return `${stripZero(n)} month${n === 1 ? "" : "s"}`;
}

export function parseTimelineValue(value: unknown): TimelineParseResult {
  if (isFiniteNumber(value)) {
    return {
      months: value,
      min: value,
      max: value,
      hasRange: false,
      shortLabel: shortMonthLabel(value),
      longLabel: longMonthLabel(value),
    };
  }

  if (typeof value !== "string") {
    return { hasRange: false };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { hasRange: false };
  }

  const nums = (trimmed.match(/(\d+(\.\d+)?)/g) || []).map(Number);
  if (!nums.length) {
    return { hasRange: false };
  }

  if (nums.length >= 2) {
    const min = Math.min(nums[0], nums[1]);
    const max = Math.max(nums[0], nums[1]);
    const months = (min + max) / 2;
    return {
      months,
      min,
      max,
      hasRange: max - min >= 1,
      shortLabel: `${stripZero(min)}–${stripZero(max)} mo`,
      longLabel: `${stripZero(min)}–${stripZero(max)} months`,
    };
  }

  const months = nums[0];
  return {
    months,
    min: months,
    max: months,
    hasRange: false,
    shortLabel: shortMonthLabel(months),
    longLabel: longMonthLabel(months),
  };
}

export function normalizeTimelineValue(value: unknown) {
  const parsed = parseTimelineValue(value);
  return {
    months: parsed.months,
    label: parsed.longLabel,
  };
}

export function hasTimelineValue(months?: number, label?: string) {
  if (isFiniteNumber(months)) return true;
  return Boolean(parseTimelineValue(label).longLabel);
}

export function formatTimelineShort(
  months?: number,
  label?: string,
  fallback = "Varies",
) {
  const parsed = parseTimelineValue(label);
  if (parsed.shortLabel) return parsed.shortLabel;
  if (isFiniteNumber(months)) return shortMonthLabel(months);
  return fallback;
}

export function formatTimelineLong(
  months?: number,
  label?: string,
  fallback = "Varies",
) {
  const parsed = parseTimelineValue(label);
  if (parsed.longLabel) return parsed.longLabel;
  if (isFiniteNumber(months)) return longMonthLabel(months);
  return fallback;
}

export function timelineISODuration(months?: number, label?: string) {
  const parsed = parseTimelineValue(label);
  if (parsed.hasRange) return undefined;
  const value = parsed.months ?? months;
  if (!isFiniteNumber(value)) return undefined;
  return `P${Math.max(0, Math.round(value))}M`;
}
