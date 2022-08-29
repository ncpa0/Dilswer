// src/validation-algorithms/validators/validate-type.ts
import { validateArray } from "./validate-array.mjs";
import { validateEnum } from "./validate-enum.mjs";
import { validateEnumMember } from "./validate-enum-member.mjs";
import { validateLiteral } from "./validate-literal.mjs";
import { validateOneOf } from "./validate-one-of.mjs";
import { validatePrimitive } from "./validate-primitive.mjs";
import { validateRecord } from "./validate-record.mjs";
import { validateSet } from "./validate-set.mjs";
var validateType = (path, type, data) => {
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
export {
  validateType
};
