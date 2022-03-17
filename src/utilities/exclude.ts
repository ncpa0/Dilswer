import type { BasicDataType, OneOf } from "../types";
import type { ExcludeOneOf } from "./types";

/**
 * Excludes given basic Data Types from the OneOf Data Type.
 * Similar to the Typescript's `Exclude<>` utility type.
 */
export const Exclude = <U extends OneOf, E extends BasicDataType>(
  union: U,
  ...excludeTypes: E[]
): ExcludeOneOf<U, E> => {
  return {
    oneOf: union.oneOf.filter((t) => !excludeTypes.includes(t)),
  };
};
