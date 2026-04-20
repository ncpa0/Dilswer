import { BaseType, MetadataSymbol, TypeMetadata } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { Metadata, TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class EnumMetadata<T extends EnumType>
  extends TypeMetadata<T, Metadata & { enumName?: string }>
{
  /**
   * Sets the metadata for the enum name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  enumName(name: string): T {
    this.container.enumName = name;
    return this.type;
  }
}

export class EnumType<
  TEnumValue extends string | number = any,
> extends BaseType {
  /** @internal */
  static getOriginalMetadata(
    dt: EnumType,
  ): Metadata & { enumName?: string } {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: Metadata & { enumName?: string } = {};

  readonly kind = "enumUnion";
  readonly enumInstance: Record<TEnumValue, any>;
  readonly memberNames: TEnumValue[];

  public meta = new EnumMetadata(this, this[MetadataSymbol]);

  constructor(enumInstance: any) {
    super();
    this.enumInstance = enumInstance;
    this.memberNames = Object.keys(enumInstance).filter(name =>
      Number.isNaN(Number(name))
    ) as TEnumValue[];
    Object.freeze(this);
  }

  /**
   * Sets the metadata for the enum name. This is used for
   * generating appropriate TypeScript declarations (via
   * `toTsType()`).
   */
  setEnumName<T extends EnumType>(this: T, name: string): T {
    this[MetadataSymbol].enumName = name;
    return this;
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    TEnumValue
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    for (let i = 0; i < this.memberNames.length; i++) {
      const name = this.memberNames[i];
      const member = this.enumInstance[name];

      if (member === value) {
        return;
      }
    }

    throw new ValidationError(path, this, value, "not a valid enum value");
  }

  ["~matches"](value: any): boolean {
    for (let i = 0; i < this.memberNames.length; i++) {
      const name = this.memberNames[i];
      const member = this.enumInstance[name];

      if (member === value) {
        return true;
      }
    }

    return false;
  }
}
