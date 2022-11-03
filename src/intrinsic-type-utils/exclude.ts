import type { AnyDataType, BasicDataType } from "@DataTypes/types";
import { OneOf } from "@DataTypes/types";
import type { ExcludeOneOf } from "@Intrinsic/types";

/**
 * Excludes given basic Data Types from the OneOf Data Type.
 * Similar to the Typescript's `Exclude<>` utility type.
 */
export const Exclude = <U extends OneOf, E extends BasicDataType>(
  union: U,
  ...excludeTypes: E[]
): ExcludeOneOf<U, E> => {
  return new OneOf(
    union.oneOf.filter(
      (t: AnyDataType) =>
        !("simpleType" in t) ||
        !excludeTypes.some((exc) => exc.simpleType === t.simpleType)
    )
  );
};
