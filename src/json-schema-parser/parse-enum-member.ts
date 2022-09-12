import type { EnumMember } from "@DataTypes/types";
import type { JSONSchema6 } from "json-schema";

export const parseEnumMember = (type: EnumMember): JSONSchema6 => {
  if (typeof type.enumMember === "string") {
    return {
      type: "string",
      enum: [type.enumMember],
    };
  }

  if (typeof type.enumMember === "number") {
    return {
      type: "number",
      enum: [type.enumMember],
    };
  }

  throw new Error(
    "Invalid enum member type, enum members can be only of string or number type."
  );
};
