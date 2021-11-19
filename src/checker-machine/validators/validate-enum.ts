import type { Enum } from "../../types";
import { ValidationError } from "../validation-error/validation-error";

export const validateEnum = (path: string, type: Enum<any>, data: unknown) => {
  const isDataEqualToAnyMember = Object.entries(type.enumInstance).some(
    ([key, member]) => isNaN(Number(key)) && member === data
  );

  if (!isDataEqualToAnyMember) {
    throw new ValidationError(path, type, data);
  }
};
