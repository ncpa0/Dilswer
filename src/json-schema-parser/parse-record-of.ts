import { BaseDataType } from "@DataTypes/data-types";
import type { FieldDescriptor, RecordOf } from "@DataTypes/types";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";
import type { JSONSchema6 } from "json-schema";

export const parseRecordOf = (
  type: RecordOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 => {
  const entries = Object.entries(type.recordOf).map(([key, value]) => {
    let descriptor = isFieldDescriptor(value)
      ? value
      : { type: value, required: true };

    if (descriptor.required === undefined)
      descriptor = { ...descriptor, required: true };

    return [key, descriptor as Required<FieldDescriptor>] as const;
  });

  const schema: JSONSchema6 = {
    type: "object",
    properties: {},
    required: [],
  };

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  for (const [key, descriptor] of entries) {
    const fieldSchema = toJsonSchema(descriptor.type, options, false);
    if (fieldSchema === undefined) continue;

    Object.assign(schema.properties!, { [key]: fieldSchema });

    if (descriptor.required) {
      schema.required!.push(key);
    }
  }

  if (typeof options.additionalProperties === "boolean") {
    schema.additionalProperties = options.additionalProperties;
  }

  return schema;
};
