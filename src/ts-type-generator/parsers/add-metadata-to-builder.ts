import { BaseDataType } from "@DataTypes/data-types";
import type { AnyDataType } from "@DataTypes/types";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

export const tsAddMetadataToBuilder = (
  builder: TsBaseBuilder,
  type: AnyDataType
) => {
  const metadata = BaseDataType.getOriginalMetadata(type);

  if (metadata.title) {
    builder.setName(metadata.title);
  }

  if (metadata.description) {
    builder.setDescription(metadata.description);
  }

  return metadata;
};
