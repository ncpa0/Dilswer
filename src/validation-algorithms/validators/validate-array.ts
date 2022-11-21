import { DataType } from "@DataTypes/data-types";
import type { AnyDataType, ArrayOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateOneOf } from "@Validation/validators/validate-one-of";
import type { Path } from "../path";

export const validateArray = (
  path: Path,
  type: ArrayOf<AnyDataType[]>,
  data: unknown
) => {
  if (!Array.isArray(data)) throw new ValidationError(path, type, data);

  for (let index = 0; index < data.length; index++) {
    validateOneOf(
      path.concat(index.toString()),
      DataType.OneOf(...type.arrayOf),
      data[index]
    );
  }
};
