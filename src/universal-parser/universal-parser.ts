import type { AnyDataType, DataTypeVisitor } from "@DataTypes/types";

export const parseWith = <R>(
  visitor: DataTypeVisitor<R>,
  type: AnyDataType,
): R => {
  return type._acceptVisitor(visitor);
};
