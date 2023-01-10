import type { InstanceOf } from "@DataTypes/data-types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { TsInstanceOfBuilder } from "@TsTypeGenerator/type-builders/instanceof-builder";
import { capitalize } from "@Utilities/capitalize";

export const tsParseInstanceOf = (
  type: InstanceOf,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const { getExternalTypeImport } = options;

  const constructor = type.instanceOf as new () => unknown;

  let typeName = constructor.name;

  const externalImport = getExternalTypeImport?.(type);

  if (externalImport) {
    fileScope.addTypeImport(externalImport.typeName, externalImport.path);

    typeName = externalImport.typeName;
  }

  const builder = new TsInstanceOfBuilder(typeName);
  tsAddMetadataToBuilder(builder, type);

  if (builder.getName() === typeName) {
    builder.setName(`Alias${capitalize(builder.getName()!)}`);
  }

  if (
    options.mode === "fully-expanded" ||
    (options.mode === "named-expanded" && builder.hasName())
  ) {
    return fileScope.addType(builder);
  }

  return builder;
};
