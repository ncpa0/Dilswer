import { isFieldDescriptor } from "../../shared/is-field-descriptor";
import type { AllDataTypes, FieldDescriptor, RecordOf } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateType } from "./validate-type";

const getType = (v: FieldDescriptor | AllDataTypes) => {
  if (isFieldDescriptor(v)) return v.type;
  return v;
};

export const validateRecord = (path: string, type: RecordOf, data: unknown) => {
  if (typeof data !== "object" || data === null)
    throw new ValidationError(path, type, data);

  for (const [key, fieldDescriptor] of Object.entries(type.recordOf)) {
    if (!(key in data)) {
      if (isFieldDescriptor(fieldDescriptor)) {
        if (
          fieldDescriptor.required === true ||
          fieldDescriptor.required === undefined
        ) {
          throw new ValidationError(path, type, data);
        } else {
          continue;
        }
      } else {
        throw new ValidationError(path, type, data);
      }
    }

    // @ts-expect-error
    const value: unknown = data[key];

    validateType(`${path}.${key}`, getType(fieldDescriptor), value);
  }
};
