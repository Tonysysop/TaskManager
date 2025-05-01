import { z } from "zod";

export const futureDateSchema = z.preprocess(
  (arg) => {
    if (typeof arg === "string" || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  },
  z.date()  // 👈 output will be a valid `Date`
)
.refine(
  (date) => {
    if (!date) return false;  // ❌ reject if no valid date
    const now = new Date();
    return date.setHours(0, 0, 0, 0) >= now.setHours(0, 0, 0, 0);  // ✅ allow only today or future dates
  },
  { message: "Due date cannot be in the past" }
);
