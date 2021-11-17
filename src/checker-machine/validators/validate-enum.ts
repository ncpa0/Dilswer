import { Enum } from "../../types";
import { ValidationError } from "../validation-error/validation-error";

export const validateEnum = (path: string, type: Enum<any>, data: unknown) => {
  const isDataEqualToAnyMember = Object.values(type.enumInstance).some(
    (member) => member === data
  );

  if (!isDataEqualToAnyMember) {
    throw new ValidationError(path, type, data);
  }
};
