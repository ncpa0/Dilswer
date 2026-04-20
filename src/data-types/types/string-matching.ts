import { BaseType, MetadataSymbol, TypeMetadata } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { Metadata, TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class StringMetadata<T extends StringMatchingType>
  extends TypeMetadata<T, Metadata & { tsPattern?: string }>
{
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
  tsPattern(name: string): T {
    this.container.tsPattern = name;
    return this.type;
  }
}

export class StringMatchingType<T extends string = string> extends BaseType {
  /** @internal */
  static getOriginalMetadata(dt: StringMatchingType) {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: Metadata & {
    tsPattern?: string;
  } = {};

  public meta = new StringMetadata(this, this[MetadataSymbol]);

  readonly kind = "stringMatching";
  constructor(public readonly pattern: RegExp) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  setTsPattern(tsPattern: string) {
    this[MetadataSymbol].tsPattern = tsPattern;

    return this;
  }

  get ["~standard"](): StandardSchemaV1.Props<any, T> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "string") {
      throw new ValidationError(path, this, value, "not a string");
    }
    if (!this.pattern.test(value)) {
      throw new ValidationError(
        path,
        this,
        value,
        "does not match the pattern",
      );
    }
  }

  ["~matches"](value: any): boolean {
    return typeof value === "string" && this.pattern.test(value);
  }
}
