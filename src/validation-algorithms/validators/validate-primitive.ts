import type { BasicDataType, BasicTypeNames } from "@DataTypes/types";
import { ValidationError } from "@Validation/validation-error/validation-error";
import { validateStringInteger } from "@Validation/validators/validate-string-integer";
import { validateStringNumeral } from "@Validation/validators/validate-string-numeral";

const validateUnknown = () => {};

const validateNull = (path: string[], value: unknown) => {
  if (value === null) return;
  throw new ValidationError(path, "null", value);
};

const validateInteger = (path: string[], value: unknown) => {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new ValidationError(path, "integer", value);
  }
};

const validateNumber = (path: string[], value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(path, "number", value);
  }
};

const validateBoolean = (path: string[], value: unknown) => {
  if (typeof value !== "boolean") {
    throw new ValidationError(path, "boolean", value);
  }
};

const validateString = (path: string[], value: unknown) => {
  if (typeof value !== "string") {
    throw new ValidationError(path, "string", value);
  }
};

const validateSymbol = (path: string[], value: unknown) => {
  if (typeof value !== "symbol") {
    throw new ValidationError(path, "symbol", value);
  }
};

const validateUndefined = (path: string[], value: unknown) => {
  if (value !== undefined) {
    throw new ValidationError(path, "undefined", value);
  }
};

const validateFunction = (path: string[], value: unknown) => {
  if (typeof value !== "function") {
    throw new ValidationError(path, "function", value);
  }
};

const primitiveValidatorsLookupMap = new Map<
  BasicTypeNames,
  (path: string[], value: unknown) => void
>([
  ["unknown", validateUnknown],
  ["null", validateNull],
  ["stringnumeral", validateStringNumeral],
  ["stringinteger", validateStringInteger],
  ["integer", validateInteger],
  ["number", validateNumber],
  ["boolean", validateBoolean],
  ["function", validateFunction],
  ["string", validateString],
  ["symbol", validateSymbol],
  ["undefined", validateUndefined],
]);

export const validatePrimitive = (
  path: string[],
  type: BasicDataType,
  data: unknown
) => {
  const validator = primitiveValidatorsLookupMap.get(type.simpleType);

  if (validator) {
    return validator(path, data);
  }

  throw new ValidationError(path, type, data, "Not a valid DataType!");
};
