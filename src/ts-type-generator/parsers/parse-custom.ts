import type { Custom } from "@DataTypes/types";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import { TsUnknownBuilder } from "@TsTypeGenerator/type-builders/simple-types/unknown-builder";

export const tsParseCustom = (type: Custom) => {
  const builder = new TsUnknownBuilder();
  tsAddMetadataToBuilder(builder, type);

  return builder;
};
