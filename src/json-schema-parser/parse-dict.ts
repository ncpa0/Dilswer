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

  return {
    type: "object",
    additionalProperties: {
      anyOf: union
        .map((type) => toJsonSchema(type, options, false))
        .filter(isDefined),
    },
  };
};
