import type {
  AnyDataType,
  ArrayOf,
  Enum,
  EnumMember,
  Literal,
  OneOf,
  RecordOf,
  RecordTypeSchema,
  SetOf,
} from "@DataTypes/types";

export const dataTypeSymbol: unique symbol = Symbol();

export const BasicDataTypes = {
  Unknown: "unknown",
  String: "string",
  Number: "number",
  Int: "integer",
  Boolean: "boolean",
  Symbol: "symbol",
  Function: "function",
  Null: "null",
  Undefined: "undefined",
  StringNumeral: "stringnumeral",
  StringInt: "stringinteger",
} as const;

export const DataType = {
  ...BasicDataTypes,
  RecordOf<TS extends RecordTypeSchema>(args: TS): RecordOf<TS> {
    return {
      [dataTypeSymbol]: true,
      recordOf: args,
    };
  },
  ArrayOf<DT extends AnyDataType[]>(...args: DT): ArrayOf<DT> {
    return {
      [dataTypeSymbol]: true,
      arrayOf: args,
    };
  },
  SetOf<DT extends AnyDataType[]>(...args: DT): SetOf<DT> {
    return {
      [dataTypeSymbol]: true,
      setOf: args,
    };
  },
  OneOf<DT extends AnyDataType[]>(...args: DT): OneOf<DT> {
    return {
      [dataTypeSymbol]: true,
      oneOf: args,
    };
  },
  Literal<V extends string | number | boolean>(value: V): Literal<V> {
    return {
      [dataTypeSymbol]: true,
      literal: value,
    };
  },
  EnumMember<M extends number | string>(enumMember: M): EnumMember<M> {
    return {
      [dataTypeSymbol]: true,
      enumMember,
    };
  },
  Enum<T extends string, TEnumValue extends string | number>(enumInstance: {
    [key in T]: TEnumValue;
  }): Enum<TEnumValue> {
    return {
      [dataTypeSymbol]: true,
      // @ts-expect-error
      enumInstance,
    };
  },
};
