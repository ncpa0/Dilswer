import type {
  AnyDataType,
  BasicTypeNames,
  RecordTypeSchema,
  TypeMetadata,
} from "@DataTypes/types";

export const DataTypeSymbol: unique symbol = Symbol();
export const MetadataSymbol = Symbol("metadata");

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

class BaseDataType {
  protected [MetadataSymbol]: TypeMetadata = {};
  protected [DataTypeSymbol] = true;

  protected copy<T extends BaseDataType>(this: T): T {
    const proto = Object.getPrototypeOf(this);
    const copy = Object.create(proto);
    Object.assign(copy, this);
    copy[MetadataSymbol] = { ...this[MetadataSymbol] };
    return copy;
  }
}

export class SimpleDataType<DT extends BasicTypeNames> extends BaseDataType {
  constructor(public simpleType: DT) {
    super();
  }
}

export class RecordOf<
  TS extends RecordTypeSchema = RecordTypeSchema
> extends BaseDataType {
  constructor(public recordOf: TS) {
    super();
  }
}

export class ArrayOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  constructor(public arrayOf: DT) {
    super();
  }
}

export class Dict<DT extends AnyDataType[] = any[]> extends BaseDataType {
  constructor(public dict: DT) {
    super();
  }
}

export class SetOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  constructor(public setOf: DT) {
    super();
  }
}

export class OneOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  constructor(public oneOf: DT) {
    super();
  }
}

export class AllOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  constructor(public allOf: DT) {
    super();
  }
}

export class Literal<
  DT extends string | number | boolean = string | number | boolean
> extends BaseDataType {
  constructor(public literal: DT) {
    super();
  }
}

export class Enum<
  T extends string = string,
  TEnumValue extends string | number = any
> extends BaseDataType {
  enumInstance: TEnumValue;

  constructor(enumInstance: {
    [key in T]: TEnumValue;
  }) {
    super();

    this.enumInstance = enumInstance as any;
  }
}

export class EnumMember<DT = any> extends BaseDataType {
  constructor(public enumMember: DT) {
    super();
  }
}

export class Custom<
  VF extends (v: any) => boolean = (v: any) => v is unknown
> extends BaseDataType {
  constructor(public custom: VF) {
    super();
  }
}

export const DataType = {
  get Unknown() {
    return new SimpleDataType(BasicDataTypes.Unknown);
  },
  get String() {
    return new SimpleDataType(BasicDataTypes.String);
  },
  get Number() {
    return new SimpleDataType(BasicDataTypes.Number);
  },
  get Int() {
    return new SimpleDataType(BasicDataTypes.Int);
  },
  get Boolean() {
    return new SimpleDataType(BasicDataTypes.Boolean);
  },
  get Symbol() {
    return new SimpleDataType(BasicDataTypes.Symbol);
  },
  get Function() {
    return new SimpleDataType(BasicDataTypes.Function);
  },
  get Null() {
    return new SimpleDataType(BasicDataTypes.Null);
  },
  get Undefined() {
    return new SimpleDataType(BasicDataTypes.Undefined);
  },
  get StringNumeral() {
    return new SimpleDataType(BasicDataTypes.StringNumeral);
  },
  get StringInt() {
    return new SimpleDataType(BasicDataTypes.StringInt);
  },
  RecordOf<TS extends RecordTypeSchema>(args: TS) {
    return new RecordOf(args);
  },
  Dict<DT extends AnyDataType[]>(...args: DT) {
    return new Dict(args);
  },
  ArrayOf<DT extends AnyDataType[]>(...args: DT) {
    return new ArrayOf(args);
  },
  SetOf<DT extends AnyDataType[]>(...args: DT) {
    return new SetOf(args);
  },
  OneOf<DT extends AnyDataType[]>(...args: DT) {
    return new OneOf(args);
  },
  AllOf<DT extends AnyDataType[]>(...args: DT) {
    return new AllOf(args);
  },
  Literal<V extends string | number | boolean>(value: V) {
    return new Literal(value);
  },
  EnumMember<M extends number | string>(enumMember: M) {
    return new EnumMember(enumMember);
  },
  Enum<T extends string, TEnumValue extends string | number>(enumInstance: {
    [key in T]: TEnumValue;
  }) {
    return new Enum(enumInstance);
  },
  Custom<VF extends (v: any) => boolean>(validateFunction: VF) {
    return new Custom(validateFunction);
  },
};
