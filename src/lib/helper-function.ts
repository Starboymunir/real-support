
export const sanitizeFields = <T extends object>(
  obj: T,
  fieldsToSanitize: ReadonlyArray<keyof T> // Accept readonly arrays
): T => {
  const sanitized = { ...obj };
  fieldsToSanitize.forEach((field) => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      if (typeof sanitized[field] === "string") {
        sanitized[field] = String(sanitized[field])
          .toUpperCase()
          .replace(/\s+/g, "") as any;
      } else if (Array.isArray(sanitized[field])) {
        sanitized[field] = (sanitized[field] as unknown[]).map((item) =>
          typeof item === "string"
            ? item.toUpperCase().replace(/\s+/g, "")
            : item
        ) as any;
      }
    }
  });
  return sanitized;
};

export const parseValidDate = (
  value: string | Date | null | undefined
): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

export const formatNumber = (value: number | undefined | null): number =>
  value != null && !isNaN(value) ? parseFloat(value.toFixed(2)) : 0;

export const formatDistance = (distance: number): string => {
  if (distance < 0) {
    throw new Error("Distance cannot be negative.");
  }

  const miles = distance / 1609.34;
  const formatted = miles.toFixed(2);

  return `${formatted} mile${parseFloat(formatted) === 1 ? "" : "s"}`;
};


export const formatDuration = (durationInSeconds: number): string => {
  if (durationInSeconds < 0) {
    throw new Error("Duration cannot be negative.");
  }

  const totalMinutes = Math.floor(durationInSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0 && minutes === 0) return "0 minutes";

  const hourText = hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "";
  const minuteText =
    minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""}` : "";

  return [hourText, minuteText].filter(Boolean).join(" ");
};

export function formattedDateTime(date: Date, time: string): string {
  const padZero = (num: number) => (num < 10 ? `0${num}` : num);

  const year = date.getFullYear();
  const month = date.getMonth(); // Date.UTC expects 0-based month
  const day = date.getDate();

  const [hoursStr = "00", minutesStr = "00", secondsStr = "00"] =
    time?.split(":") || [];

  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const seconds = parseInt(secondsStr, 10);

  const combinedDate = new Date(
    Date.UTC(year, month, day, hours, minutes, seconds)
  );

  return combinedDate.toISOString();
}

export function getChangedFields<T extends Record<string, any>>(
  values: T,
  currentData: T
): Partial<T> {
  const changed: Partial<T> = {};
  (Object.keys(values) as (keyof T)[]).forEach((key) => {
    if (typeof values[key] === "object" && values[key] !== null) {
      if (JSON.stringify(values[key]) !== JSON.stringify(currentData[key])) {
        changed[key] = values[key];
      }
    } else if (values[key] !== currentData[key]) {
      changed[key] = values[key];
    }
  });
  return changed;
}
