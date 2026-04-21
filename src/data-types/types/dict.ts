import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { AnyType, TypeVisitor } from "@DataTypes/type-types";
import type { InferDType, ReWrap } from "@DataTypes/type-utils";
import { UnionType } from "@DataTypes/types/union";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class DictType<DT extends AnyType[] = any[]> extends BaseType {
  readonly kind = "dictionary";
  private readonly union;

  constructor(public readonly dict: DT) {
    super();
    this.union = new UnionType(this.dict);
    Object.freeze(this.dict);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    const children: R[] = [];

    for (let i = 0; i < this.dict.length; i++) {
      children.push(this.dict[i]._acceptVisitor(visitor, depth + 1));
    }

    return visitor.visit(this, children, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    Record<string | number, ReWrap<InferDType<DT[number]>>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (
      typeof value !== "object"
      || value === null
      || Array.isArray(value)
    ) {
      throw new ValidationError(path, this, value, "not an object");
    }

    const keys = Object.keys(value);

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      this.union["~validate"](path.concat(key), value[key]);
    }
  }

  ["~matches"](value: any): boolean {
    if (
      typeof value !== "object"
      || value === null
      || Array.isArray(value)
    ) {
      return false;
    }

    const keys = Object.keys(value);

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const match = this.union["~matches"](value[key]);
      if (!match) return false;
    }
    return true;
  }
}
