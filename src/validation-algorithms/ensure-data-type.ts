import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { validatedCircularValues } from "@Validation/validators/helper-validated-circ-values";
import { validatorsLookupMap } from "@Validation/validators/validate-type";

const DEFAULT_ROOT = Path.init("$");

/**
 * Checks the provided `data` against the `dataType` type
 * definition and throws an ValidationError if the `data` does
 * not conform to the `dataType`
 */
export const ensureDataType: <DT extends AnyDataType>(
  dataType: DT,
  data: unknown,
) => asserts data is ReWrap<ParseDataType<DT>> = (
  dataType: AnyDataType,
  data: unknown,
) => {
  try {
    return validatorsLookupMap.get(dataType.kind)!(
      DEFAULT_ROOT,
      dataType,
      data,
    );
  } finally {
    validatedCircularValues.clear();
  }
};
