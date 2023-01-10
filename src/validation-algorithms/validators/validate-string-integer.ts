import type { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";

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
]);

export const validateStringInteger = (path: Path, data: unknown) => {
  const throwError = () => {
    throw new ValidationError(path, "stringinteger", data);
  };

  if (typeof data !== "string") throwError();

  for (let i = 0; i < (data as string).length; i++) {
    if (!AllowedChars.has((data as string)[i])) {
      throwError();
    }
  }

  if ((data as string).length === 0) throwError();

  return;
};
