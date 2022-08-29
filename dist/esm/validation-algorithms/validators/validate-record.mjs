// src/validation-algorithms/validators/validate-record.ts
import { isFieldDescriptor } from "../../utilities/is-field-descriptor.mjs";
import { ValidationError } from "../validation-error/validation-error.mjs";
import { validateType } from "./validate-type.mjs";
var getType = (v) => {
  if (isFieldDescriptor(v))
    return v.type;
  return v;
};
var validateRecord = (path, type, data) => {
  if (typeof data !== "object" || data === null)
    throw new ValidationError(path, type, data);
  for (const [key, fieldDescriptor] of Object.entries(type.recordOf)) {
    if (!(key in data)) {
      if (isFieldDescriptor(fieldDescriptor)) {
        if (fieldDescriptor.required === true || fieldDescriptor.required === void 0) {
          throw new ValidationError(path, type, data);
        } else {
          continue;
        }
      } else {
        throw new ValidationError(path, type, data);
      }
    }
    const value = data[key];
    validateType(`${path}.${key}`, getType(fieldDescriptor), value);
  }
};
export {
  validateRecord
};
