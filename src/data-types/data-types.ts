import type {
  AllOf,
  AnyDataType,
  ArrayOf,
  Custom,
  Dict,
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
  Unknown: { simpleType: "unknown" },
  String: { simpleType: "string" },
  Number: { simpleType: "number" },
  Int: { simpleType: "integer" },
  Boolean: { simpleType: "boolean" },
  Symbol: { simpleType: "symbol" },
  Function: { simpleType: "function" },
  Null: { simpleType: "null" },
  Undefined: { simpleType: "undefined" },
  StringNumeral: { simpleType: "stringnumeral" },
  StringInt: { simpleType: "stringinteger" },
} as const;

export const DataType = {
  get Unknown() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Unknown } as const;
  },
  get String() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.String } as const;
  },
  get Number() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Number } as const;
  },
  get Int() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Int } as const;
  },
  get Boolean() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Boolean } as const;
  },
  get Symbol() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Symbol } as const;
  },
  get Function() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Function } as const;
  },
  get Null() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Null } as const;
  },
  get Undefined() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.Undefined } as const;
  },
  get StringNumeral() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.StringNumeral } as const;
  },
  get StringInt() {
    return { [dataTypeSymbol]: true, ...BasicDataTypes.StringInt } as const;
  },
  RecordOf<TS extends RecordTypeSchema>(args: TS): RecordOf<TS> {
    return {
      [dataTypeSymbol]: true,
      recordOf: args,
    };
  },
  Dict<DT extends AnyDataType[]>(...args: DT): Dict<DT> {
    return {
      [dataTypeSymbol]: true,
      dict: args,
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
  AllOf<DT extends AnyDataType[]>(...args: DT): AllOf<DT> {
    return {
      [dataTypeSymbol]: true,
      allOf: args,
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
  Custom<VF extends (v: any) => boolean>(validateFunction: VF): Custom<VF> {
    return {
      [dataTypeSymbol]: true,
      custom: validateFunction,
    };
  },
};
