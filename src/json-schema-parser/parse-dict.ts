import { BaseDataType } from "@DataTypes/data-types";
import type { AnyDataType, Dict } from "@DataTypes/types";
import { isDefined } from "@JSONSchemaParser/is-defined";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseDict = (
  type: Dict,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const union = type.dict as AnyDataType[];

  const schema: JSONSchema6 = {
    type: "object",
    additionalProperties: {
      anyOf: union
        .map((type) => toJsonSchema(type, options, false))
        .filter(isDefined),
    },
  };

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  return schema;
};
