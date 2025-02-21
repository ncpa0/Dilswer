import { DataTypeSymbol } from "@DataTypes/data-types";
import type { AnyType, FieldDescriptor } from "@DataTypes/types";

export const isFieldDescriptor = (
  v: FieldDescriptor | AnyType,
): v is FieldDescriptor => {
  const isObject = typeof v === "object";

  if (isObject) {
    const hasSymbol = DataTypeSymbol in v;

    if (!hasSymbol) return true;
  }
  return false;
};
