import type { BasicDataType } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateStringInteger } from "@Validation/validators/validate-string-integer";
import { validateStringNumeral } from "@Validation/validators/validate-string-numeral";
import type { Path } from "../path";

export const validatePrimitive = (
  path: Path,
  type: BasicDataType,
  data: unknown
) => {
  const throwError = (): never => {
    throw new ValidationError(path, type.simpleType, data);
  };

  if (type.simpleType === "number") {
    if (typeof data !== "number" || Number.isNaN(data)) return throwError();
    return;
  }

  if (type.simpleType === "integer") {
    if (typeof data !== "number" || !Number.isInteger(data))
      return throwError();
    return;
  }

  if (typeof data === type.simpleType) return;

  if (type.simpleType === "stringnumeral") {
    return validateStringNumeral(path, data);
  }

  if (type.simpleType === "stringinteger") {
    return validateStringInteger(path, data);
  }

  if (type.simpleType === "unknown") return;

  if (type.simpleType === "null" && data === null) return;

  throwError();
};
