import type { SimpleDataType } from "@DataTypes/data-types";
import type { BasicDataType } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { TsExternalTypeReference } from "@TsTypeGenerator/type-builders/external-type-reference";
import { TsBooleanBuilder } from "@TsTypeGenerator/type-builders/simple-types/boolean-builder";
import { TsFunctionBuilder } from "@TsTypeGenerator/type-builders/simple-types/function-builder";
import { TsNullBuilder } from "@TsTypeGenerator/type-builders/simple-types/null-builder";
import { TsNumberBuilder } from "@TsTypeGenerator/type-builders/simple-types/number-builder";
import { TsStringBuilder } from "@TsTypeGenerator/type-builders/simple-types/string-builder";
import { TsSymbolBuilder } from "@TsTypeGenerator/type-builders/simple-types/symbol-builder";
import { TsUndefinedBuilder } from "@TsTypeGenerator/type-builders/simple-types/undefined-builder";
import { TsUnknownBuilder } from "@TsTypeGenerator/type-builders/simple-types/unknown-builder";

const parseFunctionType = (
  type: SimpleDataType<"function">,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const { getExternalTypeImport } = options;

  const externalImport = getExternalTypeImport?.(type);

  if (externalImport) {
    fileScope.addTypeImport(externalImport.typeName, externalImport.path);
    const builder = new TsExternalTypeReference(externalImport.typeName);
    tsAddMetadataToBuilder(builder, type);

    if (
      options.mode === "fully-expanded" ||
      (options.mode === "named-expanded" && builder.isTitled)
    ) {
      return fileScope.addType(builder);
    }

    return builder;
  }

  const builder = new TsFunctionBuilder();
  tsAddMetadataToBuilder(builder, type);

  return builder;
};

export const tsParseSimpleType = (
  type: BasicDataType,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
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
    case "function":
      return parseFunctionType(type as any, fileScope, options);
  }

  tsAddMetadataToBuilder(builder, type);

  return builder;
};
