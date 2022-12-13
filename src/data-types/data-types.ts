import type {
  AnyDataType,
  BasicTypeNames,
  DataTypeKind,
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

export class BaseDataType {
  /** Will return a copy. */
  static getMetadata(dt: BaseDataType): TypeMetadata {
    return {
      ...dt[MetadataSymbol],
    };
  }

  /** @internal */
  static getOriginalMetadata(dt: BaseDataType): TypeMetadata {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata = {};
  protected [DataTypeSymbol] = true;
  readonly kind!: DataTypeKind;

  protected copy<T extends BaseDataType>(this: T): T {
    const proto = Object.getPrototypeOf(this);
    const copy = Object.create(proto);
    Object.assign(copy, this);
    copy[MetadataSymbol] = {
      ...this[MetadataSymbol],
    };
    return copy;
  }

  /**
   * Sets a metadata `description` property. This property can be
   * later read by `getMetadata` and is also used by
   * `toJsonSchema` to generate a JSON Schema.
   */
  setDescription<T extends BaseDataType>(this: T, description: string): T {
    this[MetadataSymbol].description = description;
    return this;
  }

  /**
   * Sets a metadata `title` property. This property can be later
   * read by `getMetadata` and is also used by `toJsonSchema` to
   * generate a JSON Schema.
   */
  setTitle<T extends BaseDataType>(this: T, name: string): T {
    this[MetadataSymbol].title = name;
    return this;
  }

  /**
   * Sets a metadata `format` property. This property can be
   * later read by `getMetadata` and is also used by
   * `toJsonSchema` to generate a JSON Schema.
   */
  setFormat<T extends BaseDataType>(this: T, format: string): T {
    this[MetadataSymbol].format = format;
    return this;
  }
}

export class SimpleDataType<DT extends BasicTypeNames> extends BaseDataType {
  readonly kind = "simple";
  constructor(public simpleType: DT) {
    super();
  }
}

export class RecordOf<
  TS extends RecordTypeSchema = RecordTypeSchema
> extends BaseDataType {
  readonly kind = "record";
  constructor(public recordOf: TS) {
    super();
  }
}

export class ArrayOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "array";
  constructor(public arrayOf: DT) {
    super();
  }
}

export class Dict<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "dictionary";
  constructor(public dict: DT) {
    super();
  }
}

export class SetOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "set";
  constructor(public setOf: DT) {
    super();
  }
}

export class OneOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "union";
  constructor(public oneOf: DT) {
    super();
  }
}

export class AllOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "intersection";
  constructor(public allOf: DT) {
    super();
  }
}

export class Literal<
  DT extends string | number | boolean = string | number | boolean
> extends BaseDataType {
  readonly kind = "literal";
  constructor(public literal: DT) {
    super();
  }
}

export class Enum<
  TEnumValue extends string | number = any
> extends BaseDataType {
  /** @internal */
  static getOriginalMetadata(dt: Enum): TypeMetadata & { enumName?: string } {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & { enumName?: string } = {};

  readonly kind = "enumUnion";
  enumInstance: TEnumValue;

  constructor(enumInstance: any) {
    super();

    this.enumInstance = enumInstance;
  }

  setEnumName<T extends Enum>(this: T, name: string): T {
    this[MetadataSymbol].enumName = name;
    return this;
  }
}

export class EnumMember<DT = any> extends BaseDataType {
  /** @internal */
  static getOriginalMetadata(
    dt: EnumMember
  ): TypeMetadata & { enumMemberName?: `${string}.${string}` } {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & {
    enumMemberName?: `${string}.${string}`;
  } = {};

  readonly kind = "enumMember";
  constructor(public enumMember: DT) {
    super();
  }

  setEnumMemberName<T extends EnumMember>(
    this: T,
    name: `${string}.${string}`
  ): T {
    this[MetadataSymbol].enumMemberName = name;
    return this;
  }
}

export class Custom<
  VF extends (v: any) => boolean = (v: any) => v is unknown
> extends BaseDataType {
  readonly kind = "custom";
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
    return new Enum<TEnumValue>(enumInstance);
  },
  Custom<VF extends (v: any) => boolean>(validateFunction: VF) {
    return new Custom(validateFunction);
  },
};

/**
 * Retrieves the metadata of a DataType, like title, description
 * or examples.
 *
 * Metadata must be explicitly set on the DataType, otherwise it
 * will be an empty object.
 */
export const getMetadata = (dt: AnyDataType) => BaseDataType.getMetadata(dt);
