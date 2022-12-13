import type { AllDataTypes, AllOf } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { tsParseDataType } from "@TsTypeGenerator/parsers/parse";
import { TsIntersectionBuilder } from "@TsTypeGenerator/type-builders/intersection-builder";

export const tsParseAllOf = (
  type: AllOf<AllDataTypes[]>,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const builder = new TsIntersectionBuilder();
  tsAddMetadataToBuilder(builder, type);

  for (const unionType of type.allOf) {
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
