import type { Literal } from "@DataTypes/types";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import { TsLiteralBuilder } from "@TsTypeGenerator/type-builders/literal-builder";

export const tsParseLiteralType = (type: Literal) => {
  const builder = new TsLiteralBuilder(type.literal);
  tsAddMetadataToBuilder(builder, type);

  return builder;
};
