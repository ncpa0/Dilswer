// src/validation-algorithms/validators/validate-array.ts
import { DataType } from "../../data-types/data-types.mjs";
import { ValidationError } from "../validation-error/validation-error.mjs";
import { validateOneOf } from "./validate-one-of.mjs";
var validateArray = (path, type, data) => {
  if (!Array.isArray(data))
    throw new ValidationError(path, type, data);
  for (const [index, elem] of data.entries()) {
    validateOneOf(`${path}.${index}`, DataType.OneOf(...type.arrayOf), elem);
  }
};
export {
  validateArray
};
