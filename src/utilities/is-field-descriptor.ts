import { DataTypeSymbol } from "@DataTypes/data-types";
import type { AnyDataType, FieldDescriptor } from "@DataTypes/types";

export const isFieldDescriptor = (
  v: FieldDescriptor | AnyDataType,
): v is FieldDescriptor => {
  const isObject = typeof v === "object";

  if (isObject) {
    const hasSymbol = DataTypeSymbol in v;

    if (!hasSymbol) return true;
  }
  return false;
};
