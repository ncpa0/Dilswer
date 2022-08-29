import type { BasicDataType } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateStringInteger } from "@Validation/validators/validate-string-integer";
import { validateStringNumeral } from "@Validation/validators/validate-string-numeral";

export const validatePrimitive = (
  path: string,
  type: BasicDataType,
  data: unknown
) => {
  const throwError = (): never => {
    throw new ValidationError(path, type, data);
  };

  if (type === "unknown") return;

  if (type === "null" && data === null) return;

  if (type === "stringnumeral") {
    return validateStringNumeral(path, type, data);
  }

  if (type === "stringinteger") {
    return validateStringInteger(path, type, data);
  }

  if (type === "integer") {
    if (typeof data !== "number" || !Number.isInteger(data)) throwError();
    else return;
  }

  if (type === "number") {
    if (typeof data !== "number" || Number.isNaN(data)) throwError();
    else return;
  }

  if (typeof data === type) return;

  throwError();
};
