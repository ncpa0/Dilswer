import type { AnyDataType, OneOf } from "@DataTypes/types";
import { isDefined } from "@JSONSchemaParser/is-defined";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseOneOf = (
  type: OneOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const union = type.oneOf as AnyDataType[];

  return {
    anyOf: union
      .map((type) => toJsonSchema(type, options, false))
      .filter(isDefined),
  };
};
