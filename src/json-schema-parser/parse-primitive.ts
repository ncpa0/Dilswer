import type { BasicDataType } from "@DataTypes/types";
import type { ParseToJsonSchemaOptions } from "@JSONSchemaParser/to-json-schema";
import type { JSONSchema6 } from "json-schema";

export const parsePrimitive = (
  type: BasicDataType,
  options: ParseToJsonSchemaOptions
): JSONSchema6 | undefined => {
  const { incompatibleTypes = "throw", customParser = {} } = options;

  const throwIncompatibleTypeError = (): never => {
    throw new Error(
      `Cannot parse type "${type}" to JSON Schema. Incompatible types.`
    );
  };

  switch (type) {
    case "boolean":
      return { type: "boolean" };
    case "integer":
      return { type: "integer" };
    case "null":
      return { type: "null" };
    case "number":
      return { type: "number" };
    case "string":
      return { type: "string" };
    case "stringinteger":
      return { type: "string", pattern: "^[0-9]+$" };
    case "stringnumeral":
      return { type: "string", pattern: "^[0-9]+(\\.[0-9]+)?$" };
    case "unknown":
      return {};
    case "function":
      if (customParser.Function) return customParser.Function(type, options);
      if (incompatibleTypes === "throw") throwIncompatibleTypeError();
      if (incompatibleTypes === "omit") return undefined;
      return {
        title: "Function",
      };
    case "symbol":
      if (customParser.Symbol) return customParser.Symbol(type, options);
      if (incompatibleTypes === "throw") throwIncompatibleTypeError();
      if (incompatibleTypes === "omit") return undefined;
      return {
        title: "Symbol",
      };
    case "undefined":
      if (customParser.Undefined) return customParser.Undefined(type, options);
      if (incompatibleTypes === "throw") throwIncompatibleTypeError();
      if (incompatibleTypes === "omit") return undefined;
      return {
        title: "undefined",
      };
  }
};
