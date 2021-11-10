import { BasicDataType } from "../../types";
import { ValidationError } from "../validation-error/validation-error";

export const validatePrimitive = (
  path: string,
  type: BasicDataType,
  data: unknown
) => {
  if (type === "unknown") return;

  const dataType = typeof data;

  if (dataType === type) return;

  throw new ValidationError(path, type, data);
};
