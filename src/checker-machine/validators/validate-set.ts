import { AllDataTypes } from "../..";
import { SetOf } from "../../types";
import { ValidationError } from "../validation-error/validation-error";
import { validateOneOf } from "./validate-one-of";
import { validateType } from "./validate-type";

const isSet = (data: unknown): data is Set<unknown> => {
  return (
    typeof data === "object" &&
    data !== null &&
    // @ts-expect-error
    data[Symbol.toStringTag] === "Set"
  );
};

export const validateSet = (
  path: string,
  type: SetOf<AllDataTypes[]>,
  data: unknown
) => {
  if (!isSet(data)) throw new ValidationError(path, type, data);

  for (const elem of data) {
    validateOneOf(`${path}.SET`, { oneOf: type.setOf }, elem);
  }
};
