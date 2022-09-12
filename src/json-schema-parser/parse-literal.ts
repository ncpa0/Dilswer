import type { Literal } from "@DataTypes/types";
import type { JSONSchema6 } from "json-schema";

export const parseLiteral = (type: Literal): JSONSchema6 => {
  if (typeof type.literal === "string") {
    return {
      type: "string",
      enum: [type.literal],
    };
  }

  if (typeof type.literal === "number") {
    return {
      type: "number",
      enum: [type.literal],
    };
  }

  if (typeof type.literal === "boolean") {
    return {
      type: "boolean",
      enum: [type.literal],
    };
  }

  throw new Error(
    "Invalid literal type, literals can be only of string, number or boolean type."
  );
};
