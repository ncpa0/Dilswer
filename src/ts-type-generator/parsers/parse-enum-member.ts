import { EnumMember } from "@DataTypes/types";
import { TsEnumMemberBuilder } from "@TsTypeGenerator/type-builders/enum-member-builder";

export const tsParseEnumMember = (type: EnumMember) => {
  const metadata = EnumMember.getOriginalMetadata(type);

  if (!metadata.enumMemberName) {
    throw new Error(
      "Enum member name is not defined. To be able to parse an EnumMember DataType `enumMemberName` must be defined."
    );
  }

  const builder = new TsEnumMemberBuilder(metadata.enumMemberName);

  return builder;
};
