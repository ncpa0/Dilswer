import { DataType } from "@DataTypes/data-types";
import type { AnyDataType, ArrayOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateOneOf } from "@Validation/validators/validate-one-of";

export const validateArray = (
  path: string,
  type: ArrayOf<AnyDataType[]>,
  data: unknown
) => {
  if (!Array.isArray(data)) throw new ValidationError(path, type, data);

  for (const [index, elem] of data.entries()) {
    validateOneOf(`${path}.${index}`, DataType.OneOf(...type.arrayOf), elem);
  }
};
