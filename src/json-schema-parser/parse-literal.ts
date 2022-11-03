import { BaseDataType } from "@DataTypes/data-types";
import type { Literal } from "@DataTypes/types";
import type { JSONSchema6 } from "json-schema";

export const parseLiteral = (type: Literal): JSONSchema6 => {
  const schema: JSONSchema6 = {};

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  if (typeof type.literal === "string") {
    schema.type = "string";
    schema.enum = [type.literal];
    return schema;
  }

  if (typeof type.literal === "number") {
    schema.type = "number";
    schema.enum = [type.literal];
    return schema;
  }

  if (typeof type.literal === "boolean") {
    schema.type = "boolean";
    schema.enum = [type.literal];
    return schema;
  }

  throw new Error(
    "Invalid literal type, literals can be only of string, number or boolean type."
  );
};
