import type { AnyDataType, FieldDescriptor, RecordOf } from "@DataTypes/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";

const getType = (v: FieldDescriptor | AnyDataType) => {
  if (isFieldDescriptor(v)) return v.type;
  return v;
};

export const validateRecord = (path: string, type: RecordOf, data: unknown) => {
  if (typeof data !== "object" || data === null || Array.isArray(data))
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
