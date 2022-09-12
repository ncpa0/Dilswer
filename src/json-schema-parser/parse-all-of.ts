import type { AllOf, AnyDataType } from "@DataTypes/types";
import { isDefined } from "@JSONSchemaParser/is-defined";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseAllOf = (
  type: AllOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const union = type.allOf as AnyDataType[];

  return {
    allOf: union
      .map((type) => toJsonSchema(type, options, false))
      .filter(isDefined),
  };
};
