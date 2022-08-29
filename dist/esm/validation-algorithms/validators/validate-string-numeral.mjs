// src/validation-algorithms/validators/validate-string-numeral.ts
import { ValidationError } from "../validation-error/validation-error.mjs";
var STRING_NUMERAL_ALLOWED_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "."
];
var validateStringNumeral = (path, type, data) => {
  const throwError = () => {
    throw new ValidationError(path, type, data);
  };
  if (typeof data !== "string")
    throwError();
  if (data.split("").some((char) => !STRING_NUMERAL_ALLOWED_CHARS.includes(char)))
    throwError();
  return;
};
export {
  validateStringNumeral
};
