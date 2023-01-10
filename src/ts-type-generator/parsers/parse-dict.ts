import type { AnyDataType, Dict } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { tsParseDataType } from "@TsTypeGenerator/parsers/parse";
import { TsDictBuilder } from "@TsTypeGenerator/type-builders/dictionary-builder";

export const tsParseDict = (
  type: Dict<AnyDataType[]>,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const builder = new TsDictBuilder();
  tsAddMetadataToBuilder(builder, type);

  for (const elemType of type.dict) {
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
