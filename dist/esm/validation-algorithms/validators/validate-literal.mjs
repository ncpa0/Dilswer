// src/validation-algorithms/validators/validate-literal.ts
import { ValidationError } from "../validation-error/validation-error.mjs";
var validateLiteral = (path, type, data) => {
  if (type.literal === data)
    return;
  throw new ValidationError(path, type, data);
};
export {
  validateLiteral
};
