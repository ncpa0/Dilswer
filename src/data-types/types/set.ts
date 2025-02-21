import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { ParseDataType, ReWrap } from "@DataTypes/type-utils";
import type { AnyType, TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";
import { UnionType } from "./union";

export class SetType<DT extends AnyType[] = any[]> extends BaseType {
  readonly kind = "set";
  private readonly union;

  constructor(public readonly setOf: DT) {
    super();
    this.union = new UnionType(setOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    const children: R[] = [];

    for (let i = 0; i < this.setOf.length; i++) {
      children.push(this.setOf[i]._acceptVisitor(visitor));
    }

    return visitor.visit(this, children);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    Set<ReWrap<ParseDataType<DT[number]>>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (
      typeof value !== "object"
      || value === null
      || value[Symbol.toStringTag] !== "Set"
    ) {
      throw new ValidationError(path, this, value);
    }

    for (const elem of value as Set<unknown>) {
      this.union["~validate"](path.concat("SET_ELEMENT"), elem);
    }
  }

  ["~matches"](value: any): boolean {
    if (
      typeof value !== "object"
      || value === null
      || value[Symbol.toStringTag] !== "Set"
    ) {
      return false;
    }

    for (const elem of value as Set<unknown>) {
      if (!this.union["~matches"](elem)) {
        return false;
      }
    }
    return true;
  }
}
