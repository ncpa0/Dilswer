import type { RecordOf } from "@DataTypes/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";

export const validateRecord = (
  path: string[],
  type: RecordOf,
  data: unknown
) => {
  if (typeof data !== "object" || data === null || Array.isArray(data))
    throw new ValidationError(path, type, data);

  const keys = Object.keys(type.recordOf);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const fieldDescriptor = type.recordOf[key];

    const isADescriptor = isFieldDescriptor(fieldDescriptor);
    const fieldType = isADescriptor ? fieldDescriptor.type : fieldDescriptor;

    if (!(key in data)) {
      if (isADescriptor) {
        if (fieldDescriptor.required === false) {
          continue;
        } else {
          throw new ValidationError(path, type, data);
        }
      } else {
        throw new ValidationError(path, type, data);
      }
    }

    // @ts-expect-error
    const value: unknown = data[key];

    validateType([...path, key], fieldType, value);
  }
};
