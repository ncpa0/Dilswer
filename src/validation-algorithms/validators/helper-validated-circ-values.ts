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
export const validatedCircularValues = new Set();
