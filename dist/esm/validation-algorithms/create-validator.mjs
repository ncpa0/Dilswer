// src/validation-algorithms/create-validator.ts
import { validateType } from "./validators/validate-type.mjs";
var createValidator = (dataType) => {
  const validator = (data) => {
    try {
      validateType("$", dataType, data);
      return true;
    } catch (e) {
      return false;
    }
  };
  return validator;
};
var createChecker = createValidator;
export {
  createChecker,
  createValidator
};
