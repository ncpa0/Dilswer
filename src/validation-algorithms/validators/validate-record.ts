import type { RecordOf } from "@DataTypes/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { getValidator } from "@Validation/validators/validate-type";

export const validateRecord = (path: Path, type: RecordOf, data: unknown) => {
  if (
    typeof data !== "object"
    || data === null
    || Array.isArray(data)
    // @ts-expect-error
    || data[Symbol.toStringTag] === "Set"
  ) {
    throw new ValidationError(path, type, data);
  }

  const keys = type.keys;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const fieldDescriptor = type.recordOf[key];

    const isADescriptor = isFieldDescriptor(fieldDescriptor);
    const descriptor = isADescriptor
      ? { required: true, ...fieldDescriptor }
      : { type: fieldDescriptor, required: true };

    if (!(key in data)) {
      if (descriptor.required !== true) {
        continue;
      } else {
        throw new ValidationError(path.concat(key), type, undefined);
      }
    }

    // @ts-expect-error
    const value: unknown = data[key];

    if (value === undefined && descriptor.required !== true) {
      continue;
    }

    getValidator(descriptor.type.kind)!(
      path.concat(key),
      descriptor.type,
      value,
    );
  }
};
