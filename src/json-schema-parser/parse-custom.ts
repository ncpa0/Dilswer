import type { Custom } from "@DataTypes/types";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parseCustom = (
  type: Custom,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const { incompatibleTypes = "throw" } = options;

  const throwIncompatibleTypeError = (): never => {
    throw new Error(
      "Cannot parse type Custom Validator to JSON Schema. Incompatible types."
    );
  };

  if (incompatibleTypes === "throw") throwIncompatibleTypeError();
  if (incompatibleTypes === "omit") return undefined;
  return {
    title: `Custom Validator (${type.custom.name || "anonymous"})`,
  };
};
