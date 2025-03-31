import { BaseType, MetadataSymbol, TypeMetadata } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { Metadata, TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class EnumMemberMetadata<T extends EnumMemberType> extends TypeMetadata<
  T,
  Metadata & { enumName?: string; memberName?: `${string}` }
> {
  /**
   * Sets the metadata for the enum name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  enumName(name: string): T {
    this.container.enumName = name;
    return this.type;
  }

  /**
   * Sets the metadata for the enum member name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  memberName(name: `${string}`): T {
    this.container.memberName = name;
    return this.type;
  }
}

export class EnumMemberType<DT = any> extends BaseType {
  /** @internal */
  static getOriginalMetadata(dt: EnumMemberType) {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: Metadata & {
    memberName?: `${string}`;
    enumName?: string;
  } = {};

  public meta = new EnumMemberMetadata(this, this[MetadataSymbol]);

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
      throw new ValidationError(path, this, value, "not a valid enum member");
    }
  }

  ["~matches"](value: any): boolean {
    return this.enumMember === value;
  }
}
