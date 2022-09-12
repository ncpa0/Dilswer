import type { SetOf } from "@DataTypes/types";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseSetOf = (
  type: SetOf,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const { incompatibleTypes } = options;

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
