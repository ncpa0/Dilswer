import type { InstanceOf } from "@DataTypes/data-types";
import { BaseDataType } from "@DataTypes/data-types";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseInstanceOf = (
  type: InstanceOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const { customParser } = options;

  if (customParser?.InstanceOf) {
    return customParser.InstanceOf(type, options);
  }

  const constructor = type.instanceOf as new () => unknown;

  const schema: JSONSchema6 = {
    type: "object",
    title: constructor.name,
  };

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;

  return schema;
};
