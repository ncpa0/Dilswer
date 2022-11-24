import { Enum } from "@DataTypes/types";
import { TsEnumBuilder } from "@TsTypeGenerator/type-builders/enum-builder";

export const tsParseEnum = (type: Enum) => {
  const metadata = Enum.getOriginalMetadata(type);

  if (!metadata.enumName) {
    throw new Error(
      "Enum name is not defined. To be able to parse an Enum DataType `enumName` must be defined."
    );
  }

  const builder = new TsEnumBuilder(metadata.enumName);

  return builder;
};
