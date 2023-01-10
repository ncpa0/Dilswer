import { Enum } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { TsEnumBuilder } from "@TsTypeGenerator/type-builders/enum-builder";

export const tsParseEnum = (
  type: Enum,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const { getExternalTypeImport } = options;

  const metadata = Enum.getOriginalMetadata(type);

  let typeName = metadata.enumName;

  const externalImport = getExternalTypeImport?.(type);

  if (externalImport) {
    fileScope.addTypeImport(externalImport.typeName, externalImport.path);

    typeName = externalImport.typeName;
  }

  if (!typeName) {
    throw new Error(
      "Enum name is not defined. To be able to parse an Enum DataType `enumName` must be defined."
    );
  }

  const builder = new TsEnumBuilder(typeName);
  tsAddMetadataToBuilder(builder, type);

  return builder;
};
