import type { DataTypeKind, Metadata, TypeVisitor } from "@DataTypes/types";
import { compileFastValidator } from "@Validation/compile-fast-validator";
import { Path } from "@Validation/path";

import type { StandardSchemaV1 } from "../standard-schema";

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

export class TypeMetadata<T extends BaseType, M extends Metadata = Metadata> {
  constructor(public type: T, public container: M) {
  }

  /**
   * Retrieves the metadata of a DataType, like title, description
   * or examples.
   *
   * Metadata must be explicitly set on the DataType, otherwise it
   * will be an empty object.
   */
  get<Extra>(): Omit<M, "extra"> & { extra?: Extra } {
    const copy = { ...this.container };
    if (copy.extra) {
      copy.extra = { ...copy.extra };
    }
    return copy as any;
  }

  /**
   * Sets a metadata `description` property. This property can be
   * later read by `getMetadata` and is also used by
   * `toJsonSchema` to generate a JSON Schema.
   */
  description(description: string): T {
    this.container.description = description;
    return this.type;
  }

  /**
   * Sets a metadata `title` property. This property can be later
   * read by `getMetadata` and is also used by `toJsonSchema` to
   * generate a JSON Schema.
   */
  title(name: string): T {
    this.container.title = name;
    return this.type;
  }

  /**
   * Sets a metadata `format` property. This property can be
   * later read by `getMetadata` and is also used by
   * `toJsonSchema` to generate a JSON Schema.
   */
  format(format: string): T {
    this.container.format = format;
    return this.type;
  }

  /**
   * Sets the extra metadata. The extra metadata can be anything.
   * This metadata is not used by Dilswer, but can be by the
   * Dilswer consumer.
   */
  extra(extra: Record<any, any>): T {
    this.container.extra = extra;
    return this.type;
  }
}

export abstract class BaseType {
  /** @internal */
  static getOriginalMetadata(dt: BaseType): Metadata {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: Metadata = {};
  protected [DataTypeSymbol] = true;
  readonly kind!: DataTypeKind;
  private compiledValidatorRef: {
    fn?: (
      value: any,
    ) => StandardSchemaV1.Result<any>;
  } = {};

  protected copy<T extends BaseType>(this: T): T {
    const proto = Object.getPrototypeOf(this);
    const copy = Object.create(proto);
    Object.assign(copy, this);
    copy[MetadataSymbol] = {
      ...this[MetadataSymbol],
    };
    return copy;
  }

  public meta = new TypeMetadata(this, this[MetadataSymbol]);

  /** @internal */
  abstract _acceptVisitor<R>(visitor: TypeVisitor<R>): R;

  /**
   * Compiles a fast validator to be used via interfaces that support the Standard Schema
   * (through the `~standard` property.)
   *
   * Compiled validator is much faster than default, but provides less informations in
   * case of validation failure.
   */
  compile() {
    const fastValidator = compileFastValidator(this as any);
    this.compiledValidatorRef.fn = (value: any) => {
      if (fastValidator(value)) {
        return { value };
      } else {
        return {
          issues: [{
            message:
              "Value does not conform the data type structure definition.",
          }],
        };
      }
    };
    return this;
  }

  abstract ["~matches"](value: any): boolean;
  abstract ["~validate"](path: Path, value: any): void;
}
