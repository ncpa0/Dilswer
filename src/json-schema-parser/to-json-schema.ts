import type { AnyDataType } from "@DataTypes/types";
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
  incompatibleTypes?: "throw" | "omit" | "set-as-any";
};

/** Translates given DataType into a JSON Schema */
export const toJsonSchema = (
  type: AnyDataType,
  options: ParseToJsonSchemaOptions = {},
  _includeSchema = true
): JSONSchema6 | undefined => {
  let schema: JSONSchema6 | undefined;

  if (typeof type === "string") {
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

  if (_includeSchema && schema) {
    schema.$schema = "http://json-schema.org/draft-06/schema#";
  }

  return schema;
};
