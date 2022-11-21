import type { EnumMember } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";

export const validateEnumMember = (
  path: Path,
  type: EnumMember<any>,
  data: unknown
) => {
  if (type.enumMember !== data) {
    throw new ValidationError(path, type, data);
  }
};
