import type { Custom } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { TsExternalTypeReference } from "@TsTypeGenerator/type-builders/external-type-reference";
import { TsUnknownBuilder } from "@TsTypeGenerator/type-builders/simple-types/unknown-builder";

export const tsParseCustom = (
  type: Custom,
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

  const builder = new TsUnknownBuilder();
  tsAddMetadataToBuilder(builder, type);

  return builder;
};
