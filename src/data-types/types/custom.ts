import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import type { GetFnAssertType } from "@DataTypes/type-utils";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class CustomType<
  VF extends (v: any) => v is any = (v: any) => v is unknown,
> extends BaseType {
  readonly kind = "custom";

  constructor(public readonly custom: VF) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    return visitor.visit(this, undefined, depth);
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
