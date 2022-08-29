// src/validation-algorithms/validators/validate-enum.ts
import { ValidationError } from "../validation-error/validation-error.mjs";
var validateEnum = (path, type, data) => {
  const isDataEqualToAnyMember = Object.entries(type.enumInstance).some(
    ([key, member]) => isNaN(Number(key)) && member === data
  );
  if (!isDataEqualToAnyMember) {
    throw new ValidationError(path, type, data);
  }
};
export {
  validateEnum
};
