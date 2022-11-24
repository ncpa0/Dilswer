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
  mode: TsParsingMode;
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
