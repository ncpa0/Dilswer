import { AllDataTypes } from "../..";
import { OneOf } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateType } from "./validate-type";

export const validateOneOf = (
  path: string,
  type: OneOf<AllDataTypes[]>,
  data: unknown
) => {
  let passed = false;

  for (const dataType of type.oneOf) {
    try {
      validateType(path, dataType, data);
      passed = true;
      break;
    } catch (e) {}
  }

  if (passed) return;

  throw new ValidationError(path, type, data);
};
