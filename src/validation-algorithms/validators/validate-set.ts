import { DataType } from "@DataTypes/data-types";
import type { AnyDataType, SetOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateOneOf } from "@Validation/validators/validate-one-of";

const isSet = (data: unknown): data is Set<unknown> => {
  return (
    typeof data === "object" &&
    data !== null &&
    // @ts-expect-error
    data[Symbol.toStringTag] === "Set"
  );
};

export const validateSet = (
  path: string[],
  type: SetOf<AnyDataType[]>,
  data: unknown
) => {
  if (!isSet(data)) throw new ValidationError(path, type, data);

  for (const elem of data) {
    validateOneOf([...path, "SET_ELEM"], DataType.OneOf(...type.setOf), elem);
  }
};