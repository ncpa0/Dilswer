import { AllDataTypes, BasicDataType } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateArray } from "./validate-array";
import { validateEnum } from "./validate-enum";
import { validateEnumMember } from "./validate-enum-member";
import { validateLiteral } from "./validate-literal";
import { validateOneOf } from "./validate-one-of";
import { validatePrimitive } from "./validate-primitive";
import { validateRecord } from "./validate-record";
import { validateSet } from "./validate-set";

export const validateType = (
  path: string,
  type: AllDataTypes,
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
