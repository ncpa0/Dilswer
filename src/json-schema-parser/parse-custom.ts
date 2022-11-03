import { BaseDataType } from "@DataTypes/data-types";
import type { Custom } from "@DataTypes/types";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseCustom = (
  type: Custom,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const { incompatibleTypes = "throw", customParser = {} } = options;

  if (customParser.Custom)
    return customParser.Custom(type.custom, type, options);

  const throwIncompatibleTypeError = (): never => {
    throw new Error(
      "Cannot parse type Custom Validator to JSON Schema. Incompatible types."
    );
  };

  if (incompatibleTypes === "throw") throwIncompatibleTypeError();
  if (incompatibleTypes === "omit") return undefined;

  const schema: JSONSchema6 = {
    title: `Custom Validator (${type.custom.name || "anonymous"})`,
  };

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  return schema;
};
