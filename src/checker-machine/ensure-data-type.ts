import type { AllDataTypes } from "..";
import { validateType } from "./validators/validate-type";

/**
 * Checks the provided `data` against the `dataType` type
 * definition and throws an ValidationError if the `data` does
 * not conform to the `dataType`
 */
export const ensureDataType = <DT extends AllDataTypes>(
  dataType: DT,
  data: unknown
): void => validateType("$", dataType, data);
