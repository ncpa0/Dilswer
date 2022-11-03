import { BaseDataType, DataType } from "@DataTypes/data-types";
import type { Enum } from "@DataTypes/types";
import { parseEnumMember } from "@JSONSchemaParser/parse-enum-member";
import type { JSONSchema6 } from "json-schema";

export const parseEnum = (type: Enum): JSONSchema6 => {
  const members = Object.entries(type.enumInstance);

  const schema: JSONSchema6 = {
    anyOf: [],
  };

  for (const [key, member] of members) {
    const subSchema = parseEnumMember(
      DataType.EnumMember(member as string | number)
    );

    subSchema.title = key;

    schema.anyOf!.push(subSchema);
  }

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  return schema;
};
