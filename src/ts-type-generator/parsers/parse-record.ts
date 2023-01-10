import type { RecordOf } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsAddMetadataToBuilder } from "@TsTypeGenerator/parsers/add-metadata-to-builder";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { tsParseDataType } from "@TsTypeGenerator/parsers/parse";
import { TsRecordBuilder } from "@TsTypeGenerator/type-builders/record-builder";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

export const tsParseRecord = (
  type: RecordOf,
  fileScope: TsFileScope,
  options: TsParsingOptions
) => {
  const builder = new TsRecordBuilder();
  tsAddMetadataToBuilder(builder, type);

  for (const [propName, descriptor] of Object.entries(type.recordOf)) {
    const propType = isFieldDescriptor(descriptor)
      ? descriptor.type
      : descriptor;
    const isOptional = !!(
      isFieldDescriptor(descriptor) && descriptor.required === false
    );

    builder.addProperty(
      propName,
      tsParseDataType(propType, fileScope, options),
      isOptional
    );
  }

  if (
    options.mode === "fully-expanded" ||
    (options.mode === "named-expanded" && builder.isTitled)
  ) {
    return fileScope.addType(builder);
  }

  return builder;
};
