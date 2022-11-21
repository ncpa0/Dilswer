import type { AnyDataType, OneOf } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";
import { validatorsLookupMap } from "./validate-type";

export const validateOneOf = (
  path: Path,
  type: OneOf<AnyDataType[]>,
  data: unknown
): void => {
  if (type.oneOf.length === 1) {
    const oneOfType = type.oneOf[0];
    return validatorsLookupMap.get(oneOfType.kind)!(path, oneOfType, data);
  }

  for (let i = 0; i < type.oneOf.length; i++) {
    try {
      const oneOfType = type.oneOf[i];
      validatorsLookupMap.get(oneOfType.kind)!(path, oneOfType, data);
      return;
    } catch (error) {
      continue;
    }
  }

  throw new ValidationError(path, type, data);
};
