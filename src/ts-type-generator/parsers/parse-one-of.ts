import type { AllDataTypes, OneOf } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { tsParseDataType } from "@TsTypeGenerator/parsers/parse";
import { TsUnionBuilder } from "@TsTypeGenerator/type-builders/union-builder";

export const tsParseOneOf = (
  type: OneOf<AllDataTypes[]>,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const builder = new TsUnionBuilder();
  tsAddMetadataToBuilder(builder, type);

  for (const unionType of type.oneOf) {
    builder.addType(tsParseDataType(unionType, fileScope, options));
  }

  if (
    options.mode === "fully-expanded" ||
    (options.mode === "named-expanded" && builder.hasName())
  ) {
    return fileScope.addType(builder);
  }

  return builder;
};
