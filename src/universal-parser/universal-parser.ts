import type { AnyDataType, TypeVisitor } from "@DataTypes/types";

export const parseWith = <R>(
  visitor: TypeVisitor<R>,
  type: AnyDataType,
): R => {
  return type._acceptVisitor(visitor);
};
