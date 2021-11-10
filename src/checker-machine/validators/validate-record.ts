import { RecordOf } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateType } from "./validate-type";

export const validateRecord = (path: string, type: RecordOf, data: unknown) => {
  if (typeof data !== "object" || data === null)
    throw new ValidationError(path, type, data);

  for (const [key, fieldDescriptor] of Object.entries(type.recordOf)) {
    if (!(key in data)) {
      if (
        fieldDescriptor.required === true ||
        fieldDescriptor.required === undefined
      ) {
        throw new ValidationError(path, type, data);
      } else {
        continue;
      }
    }

    // @ts-expect-error
    const value: unknown = data[key];

    validateType(`${path}.${key}`, fieldDescriptor.type, value);
  }
};
