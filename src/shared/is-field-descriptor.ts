import { dataTypeSymbol } from "../type-def-helpers";
import type { AllDataTypes, FieldDescriptor } from "../types";

export const isFieldDescriptor = (
  v: FieldDescriptor | AllDataTypes
): v is FieldDescriptor => {
  const isObject = typeof v === "object";

  if (isObject) {
    const hasSymbol = dataTypeSymbol in v;

    if (!hasSymbol) return true;
  }
  return false;
};
