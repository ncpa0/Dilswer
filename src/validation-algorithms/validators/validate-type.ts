import type { AnyDataType } from "@DataTypes/types";
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

export const validateType = (
  path: string[],
  type: AnyDataType,
  data: unknown
) => {
  switch (type.kind) {
    case "simple":
      return validatePrimitive(path, type, data);
    case "array":
      return validateArray(path, type, data);
    case "record":
      return validateRecord(path, type, data);
    case "dictionary":
      return validateDict(path, type, data);
    case "set":
      return validateSet(path, type, data);
    case "union":
      return validateOneOf(path, type, data);
    case "intersection":
      return validateAllOf(path, type, data);
    case "literal":
      return validateLiteral(path, type, data);
    case "enumUnion":
      return validateEnum(path, type, data);
    case "enumMember":
      return validateEnumMember(path, type, data);
    case "custom":
      return validateCustom(path, type, data);
  }
};
