import type { AnyType, TypeVisitor } from "@DataTypes/types";

export const parseWith = <R>(
  visitor: TypeVisitor<R>,
  type: AnyType,
): R => {
  return type._acceptVisitor(visitor);
};
