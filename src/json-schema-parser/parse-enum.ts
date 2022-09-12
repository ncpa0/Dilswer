import { DataType } from "@DataTypes/data-types";
import type { Enum } from "@DataTypes/types";
import { parseEnumMember } from "@JSONSchemaParser/parse-enum-member";
import type { JSONSchema6 } from "json-schema";

export const parseEnum = (type: Enum): JSONSchema6 => {
  const members = Object.entries(type.enumInstance);

  const enumSchema: JSONSchema6 = {
    anyOf: [],
  };

  for (const [key, member] of members) {
    const schema = parseEnumMember(
      DataType.EnumMember(member as string | number)
    );

    schema.title = key;

    enumSchema.anyOf!.push(schema);
  }

  return enumSchema;
};
