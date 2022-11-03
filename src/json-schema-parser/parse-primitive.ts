import { BaseDataType } from "@DataTypes/data-types";
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
      `Cannot parse type "${type.simpleType}" to JSON Schema. Incompatible types.`
    );
  };

  const schema: JSONSchema6 = {};

  const meta = BaseDataType.getOriginalMetadata(type);

  if (meta.title) schema.title = meta.title;
  if (meta.description) schema.description = meta.description;
  if (meta.format) schema.format = meta.format;

  switch (type.simpleType) {
    case "boolean":
      schema.type = "boolean";
      return schema;
    case "integer":
      schema.type = "integer";
      return schema;
    case "null":
      schema.type = "null";
      return schema;
    case "number":
      schema.type = "number";
      return schema;
    case "string":
      schema.type = "string";
      return schema;
    case "stringinteger":
      schema.type = "string";
      schema.pattern = "^-?[0-9]+$";
      return schema;
    case "stringnumeral":
      schema.type = "string";
      schema.pattern = "^-?[0-9]+(\\.[0-9]+)?$";
      return schema;
    case "unknown":
      return schema;
    case "function":
      if (customParser.Function) return customParser.Function(type, options);
      if (incompatibleTypes === "throw") throwIncompatibleTypeError();
      if (incompatibleTypes === "omit") return undefined;
      schema.title ??= "Function";
      return schema;
    case "symbol":
      if (customParser.Symbol) return customParser.Symbol(type, options);
      if (incompatibleTypes === "throw") throwIncompatibleTypeError();
      if (incompatibleTypes === "omit") return undefined;
      schema.title ??= "Symbol";
      return schema;
    case "undefined":
      if (customParser.Undefined) return customParser.Undefined(type, options);
      if (incompatibleTypes === "throw") throwIncompatibleTypeError();
      if (incompatibleTypes === "omit") return undefined;
      schema.title ??= "undefined";
      return schema;
  }
};
