import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";

const STRING_INTEGER_ALLOWED_CHARS = [
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
];

export const validateStringInteger = (path: Path, data: unknown) => {
  const throwError = () => {
    throw new ValidationError(path, "stringinteger", data);
  };

  if (typeof data !== "string") throwError();

  if (
    (data as string)
      .split("")
      .some((char) => !STRING_INTEGER_ALLOWED_CHARS.includes(char))
  )
    throwError();

  if ((data as string).length === 0) throwError();

  return;
};
