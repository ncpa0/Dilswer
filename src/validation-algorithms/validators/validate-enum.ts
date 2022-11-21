import type { Enum } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";

export const validateEnum = (path: Path, type: Enum<any>, data: unknown) => {
  const isDataEqualToAnyMember = Object.entries(type.enumInstance).some(
    ([key, member]) => isNaN(Number(key)) && member === data
  );

  if (!isDataEqualToAnyMember) {
    throw new ValidationError(path, type, data);
  }
};
