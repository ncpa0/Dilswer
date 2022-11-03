import { BaseDataType } from "@DataTypes/data-types";
import type { AnyDataType, ArrayOf } from "@DataTypes/types";
import { isDefined } from "@JSONSchemaParser/is-defined";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseArrayOf = (
  type: ArrayOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const union = type.arrayOf as AnyDataType[];

  const schema: JSONSchema6 = {
    type: "array",
    items: union
      .map((type) => toJsonSchema(type, options, false))
      .filter(isDefined),
  };

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  return schema;
};
