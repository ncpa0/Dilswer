import { BaseType, MetadataSymbol } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeMetadata, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class StringMatchingType<T extends string = string> extends BaseType {
  /** @internal */
  static getOriginalMetadata(dt: StringMatchingType) {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & {
    tsPattern?: string;
  } = {};

  readonly kind = "stringMatching";
  constructor(public readonly pattern: RegExp) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
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

  get ["~standard"](): StandardSchemaV1.Props<any, T> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string" || !this.pattern.test(value)) {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    return typeof value === "string" && this.pattern.test(value);
  }
}
