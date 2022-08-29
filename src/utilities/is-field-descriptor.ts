import { dataTypeSymbol } from "@DataTypes/data-types";
import type { AllDataTypes, FieldDescriptor } from "@DataTypes/types";

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
