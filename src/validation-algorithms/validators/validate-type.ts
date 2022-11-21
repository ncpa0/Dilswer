import type { AnyDataType, DataTypeKind } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateAllOf } from "@Validation/validators/validate-all-of";
import { validateArray } from "@Validation/validators/validate-array";
import { validateCustom } from "@Validation/validators/validate-custom";
import { validateDict } from "@Validation/validators/validate-dict";
import { validateEnum } from "@Validation/validators/validate-enum";
import { validateEnumMember } from "@Validation/validators/validate-enum-member";
import { validateLiteral } from "@Validation/validators/validate-literal";
import { validateOneOf } from "@Validation/validators/validate-one-of";
import { validatePrimitive } from "@Validation/validators/validate-primitive";
import { validateRecord } from "@Validation/validators/validate-record";
import { validateSet } from "@Validation/validators/validate-set";

const validatorsLookupMap = new Map<
  DataTypeKind,
  (path: string[], type: any, data: unknown) => void
>([
  ["array", validateArray],
  ["custom", validateCustom],
  ["dictionary", validateDict],
  ["enumMember", validateEnumMember],
  ["enumUnion", validateEnum],
  ["intersection", validateAllOf],
  ["literal", validateLiteral],
  ["record", validateRecord],
  ["set", validateSet],
  ["simple", validatePrimitive],
  ["union", validateOneOf],
]);

export const validateType = (
  path: string[],
  type: AnyDataType,
  data: unknown
) => {
  const validator = validatorsLookupMap.get(type.kind);

  if (validator) {
    return validator(path, type, data);
  }

  throw new ValidationError(path, type, data, "Not a valid DataType!");
};
