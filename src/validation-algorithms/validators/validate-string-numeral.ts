import { ValidationError } from "@Validation/validation-error/validation-error";
import type { Path } from "../path";

const AllowedChars = new Set([
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
  ".",
]);

export const validateStringNumeral = (path: Path, data: unknown) => {
  const throwError = (): never => {
    throw new ValidationError(path, "stringnumeral", data);
  };

  if (typeof data !== "string") throwError();

  for (let i = 0; i < (data as string).length; i++) {
    if (!AllowedChars.has((data as string)[i])) {
      throwError();
    }
  }

  // if data contains more than one dot
  if ((data as string).split(".").length > 2) throwError();

  if ((data as string).length === 0) throwError();

  return;
};
