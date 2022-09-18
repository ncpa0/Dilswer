import type { Dict } from "@DataTypes/types";
import { concatObjectPath } from "@Utilities/concat-object-path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";
import { DataType } from "../..";

export const validateDict = (path: string, type: Dict, data: unknown) => {
  if (typeof data !== "object" || data === null || Array.isArray(data))
    throw new ValidationError(path, type, data);

  for (const [key, value] of Object.entries(data)) {
    validateType(
      concatObjectPath(path, key),
      DataType.OneOf(...type.dict),
      value
    );
  }
};
