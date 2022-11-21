import type { Dict } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateType } from "@Validation/validators/validate-type";
import { DataType } from "../..";
import type { Path } from "../path";

export const validateDict = (path: Path, type: Dict, data: unknown) => {
  if (typeof data !== "object" || data === null || Array.isArray(data))
    throw new ValidationError(path, type, data);

  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    validateType(
      path.concat(key),
      DataType.OneOf(...type.dict),
      (data as Record<string, unknown>)[key]
    );
  }
};
