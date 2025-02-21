import type { AnyType, BasicType } from "@DataTypes/types";
import { UnionType } from "@DataTypes/types/union";
import type { ExcludeOneOf } from "@Intrinsic/types";

/**
 * Excludes given basic Data Types from the OneOf Data Type.
 * Similar to the Typescript's `Exclude<>` utility type.
 */
export const Exclude = <U extends UnionType, E extends BasicType>(
  union: U,
  ...excludeTypes: E[]
): ExcludeOneOf<U, E> => {
  return new UnionType(
    union.oneOf.filter(
      (t: AnyType) =>
        !("simpleType" in t)
        || !excludeTypes.some((exc) => exc.simpleType === t.simpleType),
    ),
  );
};
