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
  const typeName = type.simpleType;

  const throwError = (): never => {
    throw new ValidationError(path, typeName, data);
  };

  if (typeName === "number") {
    if (typeof data !== "number" || Number.isNaN(data)) return throwError();
    return;
  }

  if (typeName === "integer") {
    if (typeof data !== "number" || !Number.isInteger(data))
      return throwError();
    return;
  }

  if (typeof data === typeName) return;

  if (typeName === "stringnumeral") {
    return validateStringNumeral(path, data);
  }

  if (typeName === "stringinteger") {
    return validateStringInteger(path, data);
  }

  if (typeName === "unknown") return;

  if (typeName === "null" && data === null) return;

  throwError();
};
