import type { DataTypeKind } from "@DataTypes/types";

export const TypeKindNames = new Map<DataTypeKind, string>([
  ["array", "Array"],
  ["circular", "Circular"],
  ["circularRef", "CircularReference"],
  ["custom", "Custom"],
  ["dictionary", "Dictionary"],
  ["enumMember", "EnumMember"],
  ["enumUnion", "Enum"],
  ["instanceOf", "InstanceOf"],
  ["intersection", "AllOf"],
  ["literal", "Literal"],
  ["record", "Record"],
  ["set", "SetOf"],
  ["stringMatching", "StringMatching"],
  ["tuple", "Tuple"],
  ["union", "OneOf"],
  ["simple", "Primitive"],
]);
