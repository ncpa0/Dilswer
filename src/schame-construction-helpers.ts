import { AllDataTypes } from ".";
import type {
  ArrayOf,
  Enum,
  EnumMember,
  FieldDescriptor,
  OneOf,
  RecordOf,
  SetOf,
  TypeSchema,
} from "./types";

export const BasicDataTypes = {
  Unknown: "unknown",
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Symbol: "symbol",
  Function: "function",
} as const;

export const DataType = {
  ...BasicDataTypes,
  RecordOf<TS extends TypeSchema>(args: TS): RecordOf<TS> {
    return { recordOf: args };
  },
  ArrayOf<DT extends AllDataTypes[]>(...args: DT): ArrayOf<DT> {
    return { arrayOf: args };
  },
  SetOf<DT extends AllDataTypes[]>(...args: DT): SetOf<DT> {
    return { setOf: args };
  },
  OneOf<DT extends AllDataTypes[]>(...args: DT): OneOf<DT> {
    return { oneOf: args };
  },
  Enum<T extends string, TEnumValue extends string | number>(enumInstance: {
    [key in T]: TEnumValue;
  }): Enum<TEnumValue> {
    if (typeof enumInstance !== "object" || enumInstance === null) {
      throw Error("Provided argument is not an Enum.");
    }

    // @ts-expect-error
    return { enumInstance };
  },
  EnumMember<M extends number | string>(enumMember: M): EnumMember<M> {
    return { enumMember };
  },
};
