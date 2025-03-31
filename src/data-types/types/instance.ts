import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/type-types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class InstanceOfType<
  DT = any,
> extends BaseType {
  readonly kind = "instanceOf";
  readonly _t!: DT;

  constructor(public readonly instanceOf: new(...args: any[]) => DT) {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, DT> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (!(value instanceof this.instanceOf)) {
      throw new ValidationError(
        path,
        this,
        value,
        "not an instance of " + this.instanceOf.name,
      );
    }
  }

  ["~matches"](value: any): boolean {
    return value instanceof this.instanceOf;
  }
}
