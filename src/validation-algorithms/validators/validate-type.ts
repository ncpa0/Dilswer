import type { AnyDataType, DataTypeKind } from "@DataTypes/types";
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
import type { Path } from "../path";

const validatorsLookupMap = new Map<
  DataTypeKind,
  (path: Path, type: any, data: unknown) => void
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

export const validateType = (path: Path, type: AnyDataType, data: unknown) => {
  const validator = validatorsLookupMap.get(type.kind);

  return validator!(path, type, data);
};
