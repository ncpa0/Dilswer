import type {
  AnyDataType,
  BasicTypeNames,
  DataTypeKind,
  DataTypeVisitor,
  RecordOfVisitChild,
  RecordTypeSchema,
  TypeMetadata,
} from "@DataTypes/types";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";

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

export abstract class BaseDataType {
  /** Will return a copy. */
  static getMetadata<T extends Record<any, any>>(
    dt: BaseDataType
  ): TypeMetadata<T> {
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

  /**
   * Sets the extra metadata. The extra metadata can be anything.
   * This metadata is not used by Dilswer, but can be by the
   * Dilswer consumer.
   */
  setExtra<T extends BaseDataType>(this: T, extra: Record<any, any>): T {
    this[MetadataSymbol].extra = extra;
    return this;
  }

  /** @internal */
  abstract _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R;
}

export class SimpleDataType<DT extends BasicTypeNames> extends BaseDataType {
  readonly kind = "simple";
  constructor(public simpleType: DT) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }
}

export class RecordOf<
  TS extends RecordTypeSchema = RecordTypeSchema
> extends BaseDataType {
  /** @internal */
  readonly keys: string[];
  readonly kind = "record";

  constructor(public recordOf: TS) {
    super();
    this.keys = Object.keys(this.recordOf);

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      const entry = this.recordOf[key];

      if (isFieldDescriptor(entry)) {
        Object.freeze(entry);
      }
    }

    Object.freeze(this.keys);
    Object.freeze(this.recordOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: RecordOfVisitChild<R>[] = [];

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      const entry = this.recordOf[key];
      const descriptor = isFieldDescriptor(entry)
        ? { required: true, ...entry }
        : { type: entry, required: true };

      children.push({
        _isRecordOfVisitChild: true,
        child: descriptor.type._acceptVisitor(visitor),
        propertyName: key,
        required: !!descriptor.required,
      });
    }

    return visitor.visit(this, children);
  }
}

export class ArrayOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "array";
  constructor(public arrayOf: DT) {
    super();
    Object.freeze(this.arrayOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.arrayOf.length; i++) {
      children.push(this.arrayOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }
}

export class Tuple<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "tuple";
  constructor(public tuple: DT) {
    super();
    Object.freeze(this.tuple);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.tuple.length; i++) {
      children.push(this.tuple[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }
}

export class Dict<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "dictionary";
  constructor(public dict: DT) {
    super();
    Object.freeze(this.dict);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.dict.length; i++) {
      children.push(this.dict[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }
}

export class SetOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "set";
  constructor(public setOf: DT) {
    super();
    Object.freeze(this.setOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.setOf.length; i++) {
      children.push(this.setOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }
}

export class OneOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "union";
  constructor(public oneOf: DT) {
    super();
    Object.freeze(this.oneOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.oneOf.length; i++) {
      children.push(this.oneOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }
}

export class AllOf<DT extends AnyDataType[] = any[]> extends BaseDataType {
  readonly kind = "intersection";
  constructor(public allOf: DT) {
    super();
    Object.freeze(this.allOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.allOf.length; i++) {
      children.push(this.allOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }
}

export class Literal<
  DT extends string | number | boolean = string | number | boolean
> extends BaseDataType {
  readonly kind = "literal";
  constructor(public literal: DT) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
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
    Object.freeze(this);
  }

  /**
   * Sets the metadata for the enum name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  setEnumName<T extends Enum>(this: T, name: string): T {
    this[MetadataSymbol].enumName = name;
    return this;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }
}

export class EnumMember<DT = any> extends BaseDataType {
  /** @internal */
  static getOriginalMetadata(dt: EnumMember) {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & {
    memberName?: `${string}`;
    enumName?: string;
  } = {};

  readonly kind = "enumMember";
  constructor(public enumMember: DT) {
    super();
    Object.freeze(this);
  }

  /**
   * Sets the metadata for the enum name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  setEnumName<T extends EnumMember>(this: T, name: string): T {
    this[MetadataSymbol].enumName = name;
    return this;
  }

  /**
   * Sets the metadata for the enum member name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  setMemberName<T extends EnumMember>(this: T, name: `${string}`): T {
    this[MetadataSymbol].memberName = name;
    return this;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }
}

export class InstanceOf<
  DT extends new (...args: any[]) => any = any
> extends BaseDataType {
  readonly kind = "instanceOf";
  constructor(public instanceOf: DT) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }
}

export class Custom<
  VF extends (v: any) => v is any = (v: any) => v is unknown
> extends BaseDataType {
  readonly kind = "custom";
  constructor(public custom: VF) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }
}

export class StringMatching<T extends string = string> extends BaseDataType {
  /** @internal */
  static getOriginalMetadata(dt: StringMatching) {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & {
    tsPattern?: string;
  } = {};

  readonly kind = "stringMatching";
  constructor(public pattern: RegExp) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }

  /**
   * Sets the metadata for the TypeScript pattern. This is used
   * for generating appropriate TypeScript declarations (via
   * `toTsType()`).
   *
   * This value must use the same syntax as the type literal
   * types in TypeScript.
   *
   * @example
   *   const type =
   *     DataType.StringMatching<`${string}.${string}`>(
   *       /^.+\..+$/
   *     ).setTsPattern("${string}.${string}");
   */
  setTsPattern(tsPattern: string) {
    this[MetadataSymbol].tsPattern = tsPattern;

    return this;
  }
}

export class CircularRef extends BaseDataType {
  readonly kind = "circularRef";
  private foo!: never;

  /** This is the type this reference points to. */
  get type(): AnyDataType {
    return this.parent.type;
  }

  constructor(private parent: Circular) {
    super();
  }

  /** @internal */
  _getReferencedType(): AnyDataType {
    return this.parent.type;
  }

  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    return visitor.visit(this);
  }
}

export class Circular<DT extends AnyDataType = any> extends BaseDataType {
  readonly kind = "circular";
  type: DT;
  constructor(getDataType: (ref: CircularRef) => DT) {
    super();
    this.type = getDataType(new CircularRef(this));
  }

  /** @internal */
  _acceptVisitor<R>(visitor: DataTypeVisitor<R>): R {
    const c = this.type._acceptVisitor(visitor);
    return visitor.visit(this, [c]);
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
  Tuple<DT extends AnyDataType[]>(...args: DT) {
    return new Tuple(args);
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
  InstanceOf<DT extends new (...args: any[]) => any>(instanceOf: DT) {
    return new InstanceOf(instanceOf);
  },
  Custom<VF extends (v: any) => v is any>(validateFunction: VF) {
    return new Custom(validateFunction);
  },
  StringMatching<T extends string>(pattern: RegExp) {
    return new StringMatching<T>(pattern);
  },
  Circular<DT extends AnyDataType>(getDataType: (ref: CircularRef) => DT) {
    return new Circular(getDataType);
  },
};

/**
 * Retrieves the metadata of a DataType, like title, description
 * or examples.
 *
 * Metadata must be explicitly set on the DataType, otherwise it
 * will be an empty object.
 */
export const getMetadata = <T extends Record<any, any>>(dt: AnyDataType) =>
  BaseDataType.getMetadata<T>(dt);
