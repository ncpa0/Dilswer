import type { Enum } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateEnum = (path: Path, type: Enum<any>, data: unknown) => {
  const enumKeys = Object.keys(type.enumInstance);

  for (let i = 0; i < enumKeys.length; i++) {
    const key = enumKeys[i];
    const member = type.enumInstance[key];

    if (Number.isNaN(Number(key)) && member === data) {
      return;
    }
  }

  throw new ValidationError(path, type, data);
};
