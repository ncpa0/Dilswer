import type { AnyDataType, SetOf } from "@DataTypes/types";
import { isDefined } from "@JSONSchemaParser/is-defined";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import { toJsonSchema } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseSetOf = (
  type: SetOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const { incompatibleTypes, customParser = {} } = options;

  if (customParser.Set)
    return customParser.Set(
      type.setOf.map((e) => toJsonSchema(e, options, false)).filter(isDefined),
      type as any as Set<AnyDataType[]>,
      options
    );

  const throwIncompatibleTypeError = (): never => {
    throw new Error(
      "Cannot parse type Set to JSON Schema. Incompatible types."
    );
  };

  if (incompatibleTypes === "throw") throwIncompatibleTypeError();
  if (incompatibleTypes === "omit") return undefined;
  return {
    title: "Set",
  };
};
