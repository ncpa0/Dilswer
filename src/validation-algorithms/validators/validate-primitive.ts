import type { BasicDataType } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateStringInteger } from "@Validation/validators/validate-string-integer";
import { validateStringNumeral } from "@Validation/validators/validate-string-numeral";

export const validatePrimitive = (
  path: string[],
  type: BasicDataType,
  data: unknown
) => {
  const throwError = (): never => {
    throw new ValidationError(path, type.simpleType, data);
  };

  if (type.simpleType === "unknown") return;

  if (type.simpleType === "null" && data === null) return;

  if (type.simpleType === "stringnumeral") {
    return validateStringNumeral(path, type, data);
  }

  if (type.simpleType === "stringinteger") {
    return validateStringInteger(path, type, data);
  }

  if (type.simpleType === "integer") {
    if (typeof data !== "number" || !Number.isInteger(data)) throwError();
    else return;
  }

  if (type.simpleType === "number") {
    if (typeof data !== "number" || Number.isNaN(data)) throwError();
    else return;
  }

  if (typeof data === type.simpleType) return;

  throwError();
};
