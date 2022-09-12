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

  const recordSchema: JSONSchema6 = {
    type: "object",
    properties: {},
    required: [],
  };

  for (const [key, descriptor] of entries) {
    const fieldSchema = toJsonSchema(descriptor.type, options, false);
    if (fieldSchema === undefined) continue;

    Object.assign(recordSchema.properties!, { [key]: fieldSchema });

    if (descriptor.required) {
      recordSchema.required!.push(key);
    }
  }

  return recordSchema;
};
