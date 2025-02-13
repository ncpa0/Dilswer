import { BaseType } from "@DataTypes/data-types";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type { TypeVisitor } from "@DataTypes/types";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "standard-schema";

export class FunctionType extends BaseType {
  readonly kind = "simple";
  public readonly simpleType: "function" = "function";

  constructor() {
    super();
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>): R {
    return visitor.visit(this);
  }

  get ["~standard"](): StandardSchemaV1.Props<any, (...args: any) => any> {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: any): void {
    if (typeof value !== "function") {
      throw new ValidationError(path, this, value);
    }
  }

  ["~matches"](value: any): boolean {
    return typeof value === "function";
  }
}
