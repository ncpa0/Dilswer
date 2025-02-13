import { BaseType, MetadataSymbol } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeMetadata, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class EnumType<
  TEnumValue extends string | number = any,
> extends BaseType {
  /** @internal */
  static getOriginalMetadata(
    dt: EnumType,
  ): TypeMetadata & { enumName?: string } {
    return dt[MetadataSymbol];
  }

  protected [MetadataSymbol]: TypeMetadata & { enumName?: string } = {};

  readonly kind = "enumUnion";
  readonly enumInstance: Record<TEnumValue, any>;
  readonly memberNames: TEnumValue[];

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
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
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

    throw new ValidationError(path, this, value);
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
