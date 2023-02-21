import type { DataTypeKind } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { validateAllOf } from "@Validation/validators/validate-all-of";
import { validateArray } from "@Validation/validators/validate-array";
import { validateCustom } from "@Validation/validators/validate-custom";
import { validateDict } from "@Validation/validators/validate-dict";
import { validateEnum } from "@Validation/validators/validate-enum";
import { validateEnumMember } from "@Validation/validators/validate-enum-member";
import { validateInstanceOf } from "@Validation/validators/validate-instance-of";
import { validateLiteral } from "@Validation/validators/validate-literal";
import { validateOneOf } from "@Validation/validators/validate-one-of";
import { validatePrimitive } from "@Validation/validators/validate-primitive";
import { validateRecord } from "@Validation/validators/validate-record";
import { validateSet } from "@Validation/validators/validate-set";
import { validateStringMatching } from "@Validation/validators/validate-string-matching";
import { validateTuple } from "@Validation/validators/validate-tuple";

export const validatorsLookupMap = new Map<
  DataTypeKind,
  (path: Path, type: any, data: unknown) => void
>([
  ["simple", validatePrimitive],
  ["array", validateArray],
  ["tuple", validateTuple],
  ["record", validateRecord],
  ["dictionary", validateDict],
  ["union", validateOneOf],
  ["intersection", validateAllOf],
  ["literal", validateLiteral],
  ["enumMember", validateEnumMember],
  ["enumUnion", validateEnum],
  ["set", validateSet],
  ["instanceOf", validateInstanceOf],
  ["custom", validateCustom],
  ["stringMatching", validateStringMatching],
]);
