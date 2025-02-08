import type { Tuple } from "@DataTypes/data-types";
import type { AnyDataType } from "@DataTypes/types";
import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { getValidator } from "@Validation/validators/validate-type";

export const validateTuple = (
  path: Path,
  type: Tuple<AnyDataType[]>,
  data: unknown,
) => {
  if (!Array.isArray(data) || data.length !== type.tuple.length) {
    throw new ValidationError(path, type, data);
  }

  for (let index = 0; index < type.tuple.length; index++) {
    const elem = data[index];
    const elemtType = type.tuple[index];
    getValidator(elemtType.kind)!(
      path.concat(index),
      elemtType,
      elem,
    );
  }
};
