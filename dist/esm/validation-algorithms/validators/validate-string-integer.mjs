// src/validation-algorithms/validators/validate-string-integer.ts
import { ValidationError } from "../validation-error/validation-error.mjs";
var STRING_INTEGER_ALLOWED_CHARS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9"
];
var validateStringInteger = (path, type, data) => {
  const throwError = () => {
    throw new ValidationError(path, type, data);
  };
  if (typeof data !== "string")
    throwError();
  if (data.split("").some((char) => !STRING_INTEGER_ALLOWED_CHARS.includes(char)))
    throwError();
  return;
};
export {
  validateStringInteger
};
