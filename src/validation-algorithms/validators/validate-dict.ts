import type { Dict } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { DataType } from "../..";
import type { Path } from "../path";
import { validateOneOf } from "./validate-one-of";

export const validateDict = (path: Path, type: Dict, data: unknown) => {
  if (typeof data !== "object" || data === null || Array.isArray(data))
    throw new ValidationError(path, type, data);

  const keys = Object.keys(data);

  const elemType = DataType.OneOf(...type.dict);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    validateOneOf(
      path.concat(key),
      elemType,
      (data as Record<string, unknown>)[key]
    );
  }
};
