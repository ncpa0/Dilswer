import type { AnyDataType } from "@DataTypes/types";

export const OptionalField = <D extends AnyDataType>(dataType: D) =>
  ({
    type: dataType,
    required: false,
  } as const);
