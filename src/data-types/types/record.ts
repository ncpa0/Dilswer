import { BaseType } from "@DataTypes/base-type";
import { getStandardSchemaProps } from "@DataTypes/generate-standard-schema";
import type {
  AnyType,
  FieldDescriptor,
  RecordTypeSchema,
  RecordVisitChild,
  TypeVisitor,
} from "@DataTypes/type-types";
import type { InferRecordType, ReWrap } from "@DataTypes/type-utils";
import { isFieldDescriptor } from "@Utilities/is-field-descriptor";
import { Path } from "@Validation/path";
import { ValidationError } from "@Validation/validation-error/validation-error";
import type { StandardSchemaV1 } from "~/standard-schema";

export class RecordType<
  TS extends RecordTypeSchema = RecordTypeSchema,
> extends BaseType {
  /** @internal */
  readonly keys: string[];
  readonly kind = "record";
  private readonly fieldDescriptors: [
    fieldName: string,
    descriptor: FieldDescriptor,
  ][] = [];

  constructor(public readonly recordOf: TS) {
    super();
    this.keys = Object.keys(this.recordOf);

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      let entry = this.recordOf[key];
      Object.freeze(entry);

      if (isFieldDescriptor(entry)) {
        if (entry.required == null) {
          entry = { ...entry, required: true };
        }
        Object.freeze(entry);
        this.fieldDescriptors.push([key, entry]);
      } else {
        const descriptor: FieldDescriptor = { type: entry, required: true };
        Object.freeze(descriptor);
        this.fieldDescriptors.push([key, descriptor]);
      }
    }

    this.fieldDescriptors.sort((a, b) => {
      const aSchema = a[1].type;
      const bSchema = b[1].type;
      const aKind = aSchema.kind;
      const bKind = bSchema.kind;

      const aMaybeDiscriminator = aKind === "literal"
        || aKind === "enumMember"
        || aKind === "stringMatching"
        || (aKind === "union"
          && aSchema.oneOf.every((t: AnyType) =>
            t.kind === "literal" || t.kind === "enumMember"
            || t.kind === "stringMatching"
          ));
      const bMaybeDiscriminator = bKind === "literal"
        || bKind === "enumMember"
        || bKind === "stringMatching"
        || (bKind === "union"
          && bSchema.oneOf.every((t: AnyType) =>
            t.kind === "literal" || t.kind === "enumMember"
            || t.kind === "stringMatching"
          ));
      if (
        aMaybeDiscriminator !== bMaybeDiscriminator
        && (aMaybeDiscriminator || bMaybeDiscriminator)
      ) {
        return aMaybeDiscriminator ? -1 : 1;
      }

      return kindToPriority(aKind) - kindToPriority(bKind);
    });

    Object.freeze(this.keys);
    Object.freeze(this.recordOf);
    Object.freeze(this);
  }

  /** @internal */
  _acceptVisitor<R>(visitor: TypeVisitor<R>, depth = 1): R {
    const children: RecordVisitChild<R>[] = [];

    for (let i = 0; i < this.fieldDescriptors.length; i++) {
      const [key, descriptor] = this.fieldDescriptors[i];
      children.push({
        _isRecordOfVisitChild: true,
        child: descriptor.type._acceptVisitor(visitor, depth + 1),
        propertyName: key,
        required: !!descriptor.required,
      });
    }

    return visitor.visit(this, children, depth);
  }

  get ["~standard"](): StandardSchemaV1.Props<
    any,
    ReWrap<InferRecordType<TS>>
  > {
    return getStandardSchemaProps(this);
  }

  ["~validate"](path: Path, value: unknown): void {
    if (typeof value !== "object" || value === null) {
      throw new ValidationError(path, this, value, "not an object");
    }

    for (let i = 0; i < this.fieldDescriptors.length; i++) {
      const [key, descriptor] = this.fieldDescriptors[i];

      if (!(key in value)) {
        if (descriptor.required !== true) {
          continue;
        } else {
          throw new ValidationError(
            path.concat(key),
            this,
            undefined,
            "missing required field",
          );
        }
      }

      // @ts-expect-error
      const fieldValue: unknown = value[key];

      if (fieldValue === undefined && descriptor.required !== true) {
        continue;
      }

      descriptor.type["~validate"](path.concat(key), fieldValue);
    }
  }

  ["~matches"](value: any): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    for (let i = 0; i < this.fieldDescriptors.length; i++) {
      const [key, descriptor] = this.fieldDescriptors[i];

      if (!(key in value)) {
        if (descriptor.required !== true) {
          continue;
        } else {
          return false;
        }
      }

      const fieldValue: unknown = value[key];

      if (fieldValue === undefined && descriptor.required !== true) {
        continue;
      }

      const matches = descriptor.type["~matches"](fieldValue);
      if (!matches) return false;
    }

    return true;
  }

  toString(): string {
    return `RecordSchema[ ${
      this.fieldDescriptors.map(([key, des]) =>
        `${key}${!des.required ? "?" : ""}=${des.type.toString()}`
      )
        .join("; ")
    } ]`;
  }
}

function kindToPriority(kind: AnyType["kind"]) {
  switch (kind) {
    case "simple":
    case "enumMember":
    case "enumUnion":
    case "stringMatching":
    case "literal":
      return 0;
    case "instanceOf":
      return 1;
    case "tuple":
      return 2;
    case "union":
      return 4;
    case "record":
      return 5;
    case "dictionary":
      return 6;
    case "array":
      return 7;
    case "set":
      return 8;
    case "circular":
      return 9;
    case "circularRef":
      return 10;
    case "intersection":
      return 11;
    case "custom":
      return 12;
  }
}
