import type { BasicDataType } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateStringInteger } from "./validate-string-integer";
import { validateStringNumeral } from "./validate-string-numeral";

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
