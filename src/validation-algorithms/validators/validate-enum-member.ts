import type { EnumMember } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateEnumMember = (
  path: Path,
  type: EnumMember<any>,
  data: unknown,
) => {
  if (type.enumMember !== data) {
    throw new ValidationError(path, type, data);
  }
};
