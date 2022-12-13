import type { BasicDataType } from "@DataTypes/types";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { TsBooleanBuilder } from "@TsTypeGenerator/type-builders/simple-types/boolean-builder";
import { TsFunctionBuilder } from "@TsTypeGenerator/type-builders/simple-types/function-builder";
import { TsNullBuilder } from "@TsTypeGenerator/type-builders/simple-types/null-builder";
import { TsNumberBuilder } from "@TsTypeGenerator/type-builders/simple-types/number-builder";
import { TsStringBuilder } from "@TsTypeGenerator/type-builders/simple-types/string-builder";
import { TsSymbolBuilder } from "@TsTypeGenerator/type-builders/simple-types/symbol-builder";
import { TsUndefinedBuilder } from "@TsTypeGenerator/type-builders/simple-types/undefined-builder";
import { TsUnknownBuilder } from "@TsTypeGenerator/type-builders/simple-types/unknown-builder";

export const tsParseSimpleType = (type: BasicDataType) => {
  let builder: TsBaseBuilder & TsBuilder;

  switch (type.simpleType) {
    case "string":
    case "stringinteger":
    case "stringnumeral":
      builder = new TsStringBuilder();
      break;
    case "number":
    case "integer":
      builder = new TsNumberBuilder();
      break;
    case "boolean":
      builder = new TsBooleanBuilder();
      break;
    case "function":
      builder = new TsFunctionBuilder();
      break;
    case "symbol":
      builder = new TsSymbolBuilder();
      break;
    case "undefined":
      builder = new TsUndefinedBuilder();
      break;
    case "unknown":
      builder = new TsUnknownBuilder();
      break;
    case "null":
      builder = new TsNullBuilder();
      break;
  }

  tsAddMetadataToBuilder(builder, type);

  return builder;
};
