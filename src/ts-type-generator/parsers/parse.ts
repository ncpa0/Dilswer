import type { AnyDataType } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsParseAllOf } from "@TsTypeGenerator/parsers/parse-all-of";
import { tsParseArray } from "@TsTypeGenerator/parsers/parse-array";
import { tsParseCustom } from "@TsTypeGenerator/parsers/parse-custom";
import { tsParseDict } from "@TsTypeGenerator/parsers/parse-dict";
import { tsParseEnum } from "@TsTypeGenerator/parsers/parse-enum";
import { tsParseEnumMember } from "@TsTypeGenerator/parsers/parse-enum-member";
import { tsParseLiteralType } from "@TsTypeGenerator/parsers/parse-literal";
import { tsParseOneOf } from "@TsTypeGenerator/parsers/parse-one-of";
import { tsParseRecord } from "@TsTypeGenerator/parsers/parse-record";
import { tsParseSet } from "@TsTypeGenerator/parsers/parse-set";
import { tsParseSimpleType } from "@TsTypeGenerator/parsers/parse-simple-type";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";

export type TsParsingMode = "compact" | "fully-expanded" | "named-expanded";
export type TsParsingOptions = {
  /**
   * Defines how to parse the type.
   *
   * - `compact` - the type will be parsed into a single type
   *   definition
   * - `fully-expanded` - the type will be split into multiple type
   *   definitions, and the main DataType type definition will
   *   reference them.
   * - `named-expanded` - similar to `fully-expanded`, but only the
   *   types that have titles assigned will be split into
   *   separate type definitions.
   */
  mode: TsParsingMode;
  /**
   * Defines how to export the generated types.
   *
   * - `main` - only the main DataType type will be exported
   * - `all` - all types generated will be exported
   * - `none` - nothing will be exported
   */
  exports: "main" | "all" | "none";
  /**
   * Defines how to handle duplicate names.
   *
   * - `error` - will throw an error if a duplicate name is
   *   encountered
   * - `rename` - will rename the duplicate type
   */
  onDuplicateName: "error" | "rename";
};

export const tsParseDataType = (
  type: AnyDataType,
  fileScope: TsFileScope,
  options: TsParsingOptions
): TsBuilder => {
  switch (type.kind) {
    case "array":
      return tsParseArray(type, fileScope, options);
    case "dictionary":
      return tsParseDict(type, fileScope, options);
    case "intersection":
      return tsParseAllOf(type as any, fileScope, options);
    case "record":
      return tsParseRecord(type, fileScope, options);
    case "set":
      return tsParseSet(type, fileScope, options);
    case "simple":
      return tsParseSimpleType(type);
    case "union":
      return tsParseOneOf(type as any, fileScope, options);
    case "literal":
      return tsParseLiteralType(type);
    case "custom":
      return tsParseCustom(type);
    case "enumMember":
      return tsParseEnumMember(type);
    case "enumUnion":
      return tsParseEnum(type);
  }
};
