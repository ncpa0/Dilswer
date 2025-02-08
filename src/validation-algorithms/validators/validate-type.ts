import type { DataTypeKind } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { validateAllOf } from "@Validation/validators/validate-all-of";
import { validateArray } from "@Validation/validators/validate-array";
import {
  validateCircular,
  validateCircularRef,
} from "@Validation/validators/validate-circular";
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

export function getValidator(
  type: DataTypeKind,
): (path: Path, type: any, data: unknown) => void {
  switch (type) {
    case "simple":
      return validatePrimitive;
    case "array":
      return validateArray;
    case "tuple":
      return validateTuple;
    case "record":
      return validateRecord;
    case "dictionary":
      return validateDict;
    case "union":
      return validateOneOf;
    case "intersection":
      return validateAllOf;
    case "literal":
      return validateLiteral;
    case "enumMember":
      return validateEnumMember;
    case "enumUnion":
      return validateEnum;
    case "set":
      return validateSet;
    case "instanceOf":
      return validateInstanceOf;
    case "custom":
      return validateCustom;
    case "stringMatching":
      return validateStringMatching;
    case "circular":
      return validateCircular;
    case "circularRef":
      return validateCircularRef;
  }
}
