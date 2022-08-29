// src/validation-algorithms/validators/validate-set.ts
import { DataType } from "../../data-types/data-types.mjs";
import { ValidationError } from "../validation-error/validation-error.mjs";
import { validateOneOf } from "./validate-one-of.mjs";
var isSet = (data) => {
  return typeof data === "object" && data !== null && data[Symbol.toStringTag] === "Set";
};
var validateSet = (path, type, data) => {
  if (!isSet(data))
    throw new ValidationError(path, type, data);
  for (const elem of data) {
    validateOneOf(`${path}.SET`, DataType.OneOf(...type.setOf), elem);
  }
};
export {
  validateSet
};
