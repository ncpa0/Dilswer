import { BaseDataType } from "@DataTypes/data-types";
import type { EnumMember } from "@DataTypes/types";
import type { JSONSchema6 } from "json-schema";

export const parseEnumMember = (type: EnumMember): JSONSchema6 => {
  const schema: JSONSchema6 = {};

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  if (typeof type.enumMember === "string") {
    schema.type = "string";
    schema.enum = [type.enumMember];
    return schema;
  }

  if (typeof type.enumMember === "number") {
    schema.type = "number";
    schema.enum = [type.enumMember];
    return schema;
  }

  throw new Error(
    "Invalid enum member type, enum members can be only of string or number type."
  );
};
