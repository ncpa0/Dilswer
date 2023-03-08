import type { AnyDataType } from "@DataTypes/types";

/**
 * Collection of values that have been ran through the validator
 * already, and were expected to possibly contain circular
 * references.
 *
 * Tracking these values via this collection allows the
 * validators to skip a value if it was encountered more than
 * once. This prevents infinite recursion that would cause
 * `Maximum call stack size exceeded` errors.
 *
 * This Set should be cleared after each validation pass.
 */
export const validatedCircularValues = new Map<AnyDataType, Set<any>>();

export const wasCircValidated = (type: AnyDataType, data: unknown) => {
  let set = validatedCircularValues.get(type);

  if (!set) {
    set = new Set([data]);
    validatedCircularValues.set(type, set);
    return false;
  }

  if (set.has(data)) {
    return true;
  }

  set.add(data);
  return false;
};
