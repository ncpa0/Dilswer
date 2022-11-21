import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyDataType } from "@DataTypes/types";
import { validateType } from "@Validation/validators/validate-type";
import { Path } from "./path";

/**
 * Checks the provided `data` against the `dataType` type
 * definition and throws an ValidationError if the `data` does
 * not conform to the `dataType`
 */
export const ensureDataType: <DT extends AnyDataType>(
  dataType: DT,
  data: unknown
) => asserts data is ReWrap<ParseDataType<DT>> = (
  dataType: AnyDataType,
  data: unknown
) => validateType(Path.init("$"), dataType, data);
