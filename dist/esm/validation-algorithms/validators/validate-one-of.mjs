// src/validation-algorithms/validators/validate-one-of.ts
import { ValidationError } from "../validation-error/validation-error.mjs";
import { validateType } from "./validate-type.mjs";
var validateOneOf = (path, type, data) => {
  let passed = false;
  for (const dataType of type.oneOf) {
    try {
      validateType(path, dataType, data);
      passed = true;
      break;
    } catch (e) {
      continue;
    }
  }
  if (passed)
    return;
  throw new ValidationError(path, type, data);
};
export {
  validateOneOf
};
