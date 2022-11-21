import { DataType } from "@DataTypes/data-types";
import type { AnyDataType, SetOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateOneOf } from "@Validation/validators/validate-one-of";
import type { Path } from "../path";

export const validateSet = (
  path: Path,
  type: SetOf<AnyDataType[]>,
  data: unknown
) => {
  if (
    !(
      typeof data === "object" &&
      data !== null &&
      // @ts-expect-error
      data[Symbol.toStringTag] === "Set"
    )
  )
    throw new ValidationError(path, type, data);

  for (const elem of data as Set<unknown>) {
    validateOneOf(
      path.concat("SET_ELEMENT"),
      DataType.OneOf(...type.setOf),
      elem
    );
  }
};
