import type { DataTypeKind, TypeMetadata, TypeVisitor } from "@DataTypes/types";
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

export abstract class BaseType {
  /** Will return a copy. */
  static getMetadata<T extends Record<any, any>>(
    dt: BaseType,
  ): TypeMetadata<T> {
    return {
      ...dt[MetadataSymbol],
    };
  }

  /** @internal */
  static getOriginalMetadata(dt: BaseType): TypeMetadata {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata = {};
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

  /**
   * Sets a metadata `description` property. This property can be
   * later read by `getMetadata` and is also used by
   * `toJsonSchema` to generate a JSON Schema.
   */
  setDescription<T extends BaseType>(this: T, description: string): T {
    this[MetadataSymbol].description = description;
    return this;
  }

  /**
   * Sets a metadata `title` property. This property can be later
   * read by `getMetadata` and is also used by `toJsonSchema` to
   * generate a JSON Schema.
   */
  setTitle<T extends BaseType>(this: T, name: string): T {
    this[MetadataSymbol].title = name;
    return this;
  }

  /**
   * Sets a metadata `format` property. This property can be
   * later read by `getMetadata` and is also used by
   * `toJsonSchema` to generate a JSON Schema.
   */
  setFormat<T extends BaseType>(this: T, format: string): T {
    this[MetadataSymbol].format = format;
    return this;
  }

  /**
   * Sets the extra metadata. The extra metadata can be anything.
   * This metadata is not used by Dilswer, but can be by the
   * Dilswer consumer.
   */
  setExtra<T extends BaseType>(this: T, extra: Record<any, any>): T {
    this[MetadataSymbol].extra = extra;
    return this;
  }

  /** @internal */
  abstract _acceptVisitor<R>(visitor: TypeVisitor<R>): R;

  /**
   * Compiles a fast validator to be used via interfaces that support the Standard Schema
   * (through the `~standard` property.)
   *
   * Compiled validator is much faster than default, but provides less informations in
   * case of validation failure.
   */
  compileStd() {
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
