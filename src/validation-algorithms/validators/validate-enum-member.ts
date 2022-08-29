import type { EnumMember } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";

export const validateEnumMember = (
  path: string,
  type: EnumMember<any>,
  data: unknown
) => {
  if (type.enumMember !== data) {
    throw new ValidationError(path, type, data);
  }
};
