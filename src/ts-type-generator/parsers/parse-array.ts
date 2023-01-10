import type { AnyDataType, ArrayOf } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { tsParseDataType } from "@TsTypeGenerator/parsers/parse";
import { TsArrayBuilder } from "@TsTypeGenerator/type-builders/array-builder";

export const tsParseArray = (
  type: ArrayOf<AnyDataType[]>,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const builder = new TsArrayBuilder();
  tsAddMetadataToBuilder(builder, type);

  for (const elemType of type.arrayOf) {
    builder.addType(tsParseDataType(elemType, fileScope, options));
  }

  if (
    options.mode === "fully-expanded" ||
    (options.mode === "named-expanded" && builder.isTitled)
  ) {
    return fileScope.addType(builder);
  }

  return builder;
};
