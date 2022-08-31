import type { AnyDataType } from "@DataTypes/types";
import { validateArray } from "@Validation/validators/validate-array";
import { validateEnum } from "@Validation/validators/validate-enum";
import { validateEnumMember } from "@Validation/validators/validate-enum-member";
import { validateLiteral } from "@Validation/validators/validate-literal";
import { validateOneOf } from "@Validation/validators/validate-one-of";
import { validatePrimitive } from "@Validation/validators/validate-primitive";
import { validateRecord } from "@Validation/validators/validate-record";
import { validateSet } from "@Validation/validators/validate-set";

export const validateType = (
  path: string,
  type: AnyDataType,
  data: unknown
) => {
  if (typeof type === "string") {
    return validatePrimitive(path, type, data);
  }

  if ("recordOf" in type) {
    return validateRecord(path, type, data);
  }

  if ("arrayOf" in type) {
    return validateArray(path, type, data);
  }

  if ("setOf" in type) {
    return validateSet(path, type, data);
  }

  if ("oneOf" in type) {
    return validateOneOf(path, type, data);
  }

  if ("literal" in type) {
    return validateLiteral(path, type, data);
  }

  if ("enumMember" in type) {
    return validateEnumMember(path, type, data);
  }

  if ("enumInstance" in type) {
    return validateEnum(path, type, data);
  }
};
