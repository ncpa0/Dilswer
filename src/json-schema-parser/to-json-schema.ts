import type { AnyDataType, BasicDataType, Custom } from "@DataTypes/types";
import { parseAllOf } from "@JSONSchemaParser/parse-all-of";
import { parseArrayOf } from "@JSONSchemaParser/parse-array-of";
import { parseCustom } from "@JSONSchemaParser/parse-custom";
import { parseDict } from "@JSONSchemaParser/parse-dict";
import { parseEnum } from "@JSONSchemaParser/parse-enum";
import { parseEnumMember } from "@JSONSchemaParser/parse-enum-member";
import { parseLiteral } from "@JSONSchemaParser/parse-literal";
import { parseOneOf } from "@JSONSchemaParser/parse-one-of";
import { parsePrimitive } from "@JSONSchemaParser/parse-primitive";
import { parseRecordOf } from "@JSONSchemaParser/parse-record-of";
import { parseSetOf } from "@JSONSchemaParser/parse-set-of";
import type { JSONSchema6 } from "json-schema";

export type ParseToJsonSchemaOptions = {
  /**
   * Defines how to handle DataTypes that do not have an
   * equivalent type in JSON Schema. (Set's, undefined, Symbols, etc.)
   *
   * - `throw` (default): Throw an error if an incompatible type is
   *   encountered.
   * - `omit`: Omits incompatible properties from the JSON Schema.
   * - `set-as-any`: Adds the type to the schema without a "type"
   *   property but with a name equivalent to the given DataType.
   */
  incompatibleTypes?: "throw" | "omit" | "set-as-any";
  /**
   * Determines if the schemas generated for Record's should have
   * additional properties set to `true` or `false`.
   */
  additionalProperties?: boolean;
  /**
   * Custom Parser's are methods used to parse incompatible
   * DataTypes to JSON Schema's.
   *
   * By default a strategy defined in `incompatibleTypes` is
   * used, if a method is defined, that method will be used instead.
   */
  customParser?: {
    Set?: (
      setItemsSchemas: JSONSchema6[],
      original: Set<AnyDataType[]>,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Custom?: (
      validateFunction: Custom["custom"],
      original: Custom,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Undefined?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Symbol?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Function?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
  };
};

/** Translates given DataType into a JSON Schema. */
export const toJsonSchema = (
  type: AnyDataType,
  options: ParseToJsonSchemaOptions = {},
  include$schemaProperty = true
): JSONSchema6 | undefined => {
  let schema: JSONSchema6 | undefined;

  if ("simpleType" in type) {
    schema = parsePrimitive(type, options);
  } else if ("recordOf" in type) {
    schema = parseRecordOf(type, options);
  } else if ("dict" in type) {
    schema = parseDict(type, options);
  } else if ("arrayOf" in type) {
    schema = parseArrayOf(type, options);
  } else if ("setOf" in type) {
    schema = parseSetOf(type, options);
  } else if ("oneOf" in type) {
    schema = parseOneOf(type, options);
  } else if ("allOf" in type) {
    schema = parseAllOf(type, options);
  } else if ("literal" in type) {
    schema = parseLiteral(type);
  } else if ("enumMember" in type) {
    schema = parseEnumMember(type);
  } else if ("enumInstance" in type) {
    schema = parseEnum(type);
  } else if ("custom" in type) {
    schema = parseCustom(type, options);
  }

  if (include$schemaProperty && schema) {
    schema.$schema = "http://json-schema.org/draft-06/schema#";
  }

  return schema;
};
