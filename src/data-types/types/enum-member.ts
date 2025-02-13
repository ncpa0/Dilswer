import { BaseType, MetadataSymbol } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeMetadata, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class EnumMemberType<DT = any> extends BaseType {
  /** @internal */
  static getOriginalMetadata(dt: EnumMemberType) {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & {
    memberName?: `${string}`;
    enumName?: string;
  } = {};

  readonly kind = "enumMember";
  constructor(public readonly enumMember: DT) {
    super();
    Object.freeze(this);
  }

  /**
   * Sets the metadata for the enum name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  setEnumName<T extends EnumMemberType>(this: T, name: string): T {
    this[MetadataSymbol].enumName = name;
    return this;
  }

  /**
   * Sets the metadata for the enum member name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  setMemberName<T extends EnumMemberType>(this: T, name: `${string}`): T {
    this[MetadataSymbol].memberName = name;
    return this;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, DT> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (this.enumMember !== value) {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    return this.enumMember === value;
  }
}
