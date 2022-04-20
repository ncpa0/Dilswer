import type { AllDataTypes } from "../..";
import { DataType } from "../../schame-construction-helpers";
import type { ArrayOf } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateOneOf } from "./validate-one-of";

export const validateArray = (
  path: string,
  type: ArrayOf<AllDataTypes[]>,
  data: unknown
) => {
  if (!Array.isArray(data)) throw new ValidationError(path, type, data);

  for (const [index, elem] of data.entries()) {
    validateOneOf(`${path}.${index}`, DataType.OneOf(...type.arrayOf), elem);
  }
};
