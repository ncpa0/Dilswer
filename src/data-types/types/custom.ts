import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { GetFnAssertType } from "@DataTypes/type-utils";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class CustomType<
  VF extends (v: any) => v is any = (v: any) => v is unknown,
> extends BaseType {
  readonly kind = "custom";

  constructor(public readonly custom: VF) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, GetFnAssertType<VF>> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (!this.custom(value)) throw new ValidationError(path, this, value);
  }

  ["~matches"](value: any): boolean {
    return this.custom(value);
  }
}
