import type { BasicDataType } from "../../types";
import { ValidationError } from "../validation-error/validation-error";

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

export const validateStringInteger = (
  path: string,
  type: BasicDataType,
  data: unknown
) => {
  const throwError = () => {
    throw new ValidationError(path, type, data);
  };

  if (typeof data !== "string") throwError();

  if (
    (data as string)
      .split("")
      .some((char) => !STRING_INTEGER_ALLOWED_CHARS.includes(char))
  )
    throwError();

  return;
};
