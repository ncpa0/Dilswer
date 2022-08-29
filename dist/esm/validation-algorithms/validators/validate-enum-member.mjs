// src/validation-algorithms/validators/validate-enum-member.ts
import { ValidationError } from "../validation-error/validation-error.mjs";
var validateEnumMember = (path, type, data) => {
  if (type.enumMember !== data) {
    throw new ValidationError(path, type, data);
  }
};
export {
  validateEnumMember
};
