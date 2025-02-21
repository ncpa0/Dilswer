import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyType } from "@DataTypes/types";
import { validatedCircularValues } from "@DataTypes/types/recursive";
import { Path } from "@Validation/path";

const DEFAULT_ROOT = Path.init("$");

/**
 * Checks the provided `data` against the `dataType` type
 * definition and throws an ValidationError if the `data` does
 * not conform to the `dataType`
 */
export const assertType: <DT extends AnyType>(
  type: DT,
  data: unknown,
) => asserts data is ReWrap<ParseDataType<DT>> = (
  dataType: AnyType,
  data: unknown,
) => {
  try {
    return dataType["~validate"](
      DEFAULT_ROOT,
      data,
    );
  } finally {
    validatedCircularValues.clear();
  }
};
