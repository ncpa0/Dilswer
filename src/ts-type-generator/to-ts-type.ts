/* eslint-disable @typescript-eslint/restrict-plus-operands */
import type { AnyDataType } from "@DataTypes/types";
import { TsFileScope } from "@TsTypeGenerator/file-scope";
import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import { tsParseDataType } from "@TsTypeGenerator/parsers/parse";

export const toTsType = (
  dt: AnyDataType,
  options?: Partial<TsParsingOptions>
): string => {
  try {
    const opt: TsParsingOptions = {
      mode: options?.mode ?? "compact",
      onDuplicateName: options?.onDuplicateName ?? "error",
    };

    const fileScope = new TsFileScope(opt);

    const builder = tsParseDataType(dt, fileScope, opt);

    fileScope.addRootType(builder);

    return fileScope.build().trim() + "\n";
  } finally {
    NameGenerator.clear();
  }
};
