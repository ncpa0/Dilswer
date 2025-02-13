import { BaseType } from "@DataTypes/data-types";
import { Type } from "@DataTypes/Type";
import { TypeKindNames } from "@DataTypes/type-kind-names";
import type {
  AnyDataType,
  BasicDataType,
  RecordVisitChild,
  TypeVisitor,
} from "@DataTypes/types";
import type { ArrayType } from "@DataTypes/types/array";
import type { CustomType } from "@DataTypes/types/custom";
import type { DictType } from "@DataTypes/types/dict";
import type { EnumType } from "@DataTypes/types/enum";
import type { EnumMemberType } from "@DataTypes/types/enum-member";
import type { InstanceOfType } from "@DataTypes/types/instance";
import type { IntersectionType } from "@DataTypes/types/intersection";
import type { LiteralType } from "@DataTypes/types/literal";
import type { RecordType } from "@DataTypes/types/record";
import type {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import type { SetType } from "@DataTypes/types/set";
import type { StringMatchingType } from "@DataTypes/types/string-matching";
import type { TupleType } from "@DataTypes/types/tuple";
import type { UnionType } from "@DataTypes/types/union";
import { isDefined } from "@JSONSchemaParser/is-defined";
import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { JSONSchema6, JSONSchema6Definition } from "json-schema";

export type ParseToJsonSchemaOptions = {
  /**
   * Defines how to handle DataTypes that do not have an
   * equivalent type in JSON Schema. (Set's, undefined, Symbols,
   * etc.)
   *
   * - `throw` (default): Throw an error if an incompatible type is
   *   encountered.
   * - `omit`: Omits incompatible properties from the JSON Schema.
   * - `set-as-any`: Adds the type to the schema without a "type"
   *   property but with a name equivalent to the given
   *   DataType.
   *
   * @default "throw"
   */
  incompatibleTypes?: "throw" | "omit" | "set-as-any";
  /**
   * Determines if the schemas generated for Record's should have
   * additional properties set to `true` or `false`.
   */
  additionalProperties?: boolean;
  /**
   * Custom Parser's are methods used to parse incompatible
   * DataTypes to JSON Schema's.
   *
   * By default a strategy defined in `incompatibleTypes` is
   * used, if a method is defined, that method will be used
   * instead.
   */
  customParser?: {
    Set?: (
      setItemsSchemas: JSONSchema6[],
      original: Set<AnyDataType[]>,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Custom?: (
      validateFunction: CustomType["custom"],
      original: CustomType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Undefined?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Symbol?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    Function?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
    InstanceOf?: (
      original: InstanceOfType<new(...args: any[]) => any>,
      options: ParseToJsonSchemaOptions,
    ) => JSONSchema6 | undefined;
  };
};

type R = JSONSchema6 | undefined;

class DataTypeJsonSchemaGenerator implements TypeVisitor<R> {
  private incompatibleTypes: Exclude<
    ParseToJsonSchemaOptions["incompatibleTypes"],
    undefined
  >;
  private customParser: Exclude<
    ParseToJsonSchemaOptions["customParser"],
    undefined
  >;
  private definitionNames: Map<AnyDataType, string> = new Map();
  definitions: Map<string, JSONSchema6Definition> = new Map();

  constructor(private options: ParseToJsonSchemaOptions) {
    this.incompatibleTypes = options.incompatibleTypes ?? "throw";
    this.customParser = options.customParser ?? {};
  }

  private throwIncompatibleTypeError(typeName: string): never {
    throw new Error(
      `Cannot parse type "${typeName}" to JSON Schema. Incompatible types.`,
    );
  }

  private assignMetadataToSchema(schema: JSONSchema6, type: AnyDataType) {
    const meta = BaseType.getOriginalMetadata(type);

    if (meta.title) schema.title = meta.title;
    if (meta.description) schema.description = meta.description;
    if (meta.format) schema.format = meta.format;
  }

  private parsePrimitive(type: BasicDataType): R {
    let schema: R = {};

    this.assignMetadataToSchema(schema, type);

    switch (type.simpleType) {
      case "boolean":
        schema.type = "boolean";
        break;
      case "integer":
        schema.type = "integer";
        break;
      case "null":
        schema.type = "null";
        break;
      case "number":
        schema.type = "number";
        break;
      case "string":
        schema.type = "string";
        break;
      case "stringinteger":
        schema.type = "string";
        schema.pattern = "^-?[0-9]+$";
        break;
      case "stringnumeral":
        schema.type = "string";
        schema.pattern = "^-?[0-9]+(\\.[0-9]+)?$";
        break;
      case "unknown":
        break;
      case "function":
        if (this.customParser.Function) {
          schema = this.customParser.Function(type, this.options);
          break;
        }
        if (this.incompatibleTypes === "throw") {
          this.throwIncompatibleTypeError(type.simpleType);
        }
        if (this.incompatibleTypes === "omit") {
          schema = undefined;
          break;
        }
        schema.title ??= "Function";
        break;
      case "symbol":
        if (this.customParser.Symbol) {
          schema = this.customParser.Symbol(type, this.options);
          break;
        }
        if (this.incompatibleTypes === "throw") {
          this.throwIncompatibleTypeError(type.simpleType);
        }
        if (this.incompatibleTypes === "omit") {
          schema = undefined;
          break;
        }
        schema.title ??= "Symbol";
        break;
      case "undefined":
        if (this.customParser.Undefined) {
          schema = this.customParser.Undefined(type, this.options);
          break;
        }
        if (this.incompatibleTypes === "throw") {
          this.throwIncompatibleTypeError(type.simpleType);
        }
        if (this.incompatibleTypes === "omit") {
          schema = undefined;
          break;
        }
        schema.title ??= "undefined";
        break;
    }

    return schema;
  }

  private parseArrayOf(type: ArrayType, children?: Array<R>): R {
    const schema: JSONSchema6 = {
      type: "array",
      items: children?.filter(isDefined),
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseTuple(type: TupleType, children?: Array<R>): R {
    const items = children?.map((c) => c ?? {}) ?? [];

    const schema: JSONSchema6 = {
      type: "array",
      items,
      required: items.map((_, i) => i.toString()),
      minItems: items.length,
      maxItems: items.length,
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseRecordOf(
    type: RecordType,
    children: RecordVisitChild<R>[] = [],
  ): R {
    const schema: JSONSchema6 = {
      type: "object",
      properties: {},
      required: [],
    };

    this.assignMetadataToSchema(schema, type);

    for (let i = 0; i < children.length; i++) {
      const { child, propertyName, required } = children[i];

      if (child == null) continue;

      Object.assign(schema.properties!, { [propertyName]: child });

      if (required) {
        schema.required!.push(propertyName);
      }
    }

    if (typeof this.options.additionalProperties === "boolean") {
      schema.additionalProperties = this.options.additionalProperties;
    }

    return schema;
  }

  private parseDict(type: DictType, children?: Array<R>): R {
    const schema: JSONSchema6 = {
      type: "object",
      additionalProperties: {
        anyOf: children?.filter(isDefined),
      },
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseSetOf(type: SetType, children: Array<R> = []): R {
    if (this.customParser.Set) {
      return this.customParser.Set(
        children.filter(isDefined),
        type as any as Set<AnyDataType[]>,
        this.options,
      );
    }

    if (this.incompatibleTypes === "throw") {
      this.throwIncompatibleTypeError("Set");
    }
    if (this.incompatibleTypes === "omit") return undefined;

    const schema: JSONSchema6 = {
      title: "Set",
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseOneOf(type: UnionType, children: Array<R>): R {
    const schema: JSONSchema6 = {
      anyOf: children.filter(isDefined),
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseAllOf(type: IntersectionType, children: Array<R>): R {
    const schema: JSONSchema6 = {
      allOf: children.filter(isDefined),
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseLiteral(type: LiteralType): R {
    const schema: JSONSchema6 = {};

    this.assignMetadataToSchema(schema, type);

    if (typeof type.literal === "string") {
      schema.type = "string";
      schema.enum = [type.literal];
      return schema;
    }

    if (typeof type.literal === "number") {
      schema.type = "number";
      schema.enum = [type.literal];
      return schema;
    }

    if (typeof type.literal === "boolean") {
      schema.type = "boolean";
      schema.enum = [type.literal];
      return schema;
    }

    throw new Error(
      "Invalid literal type, literals can be only of string, number or boolean type.",
    );
  }

  private parseEnum(type: EnumType): R {
    const members = Object.entries(type.enumInstance);

    const schema: JSONSchema6 = {
      anyOf: [],
    };

    for (const [key, member] of members) {
      const subSchema = this.parseEnumMember(
        Type.EnumMember(member as string | number),
      );

      subSchema.title = key;

      schema.anyOf!.push(subSchema);
    }

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseEnumMember(type: EnumMemberType): JSONSchema6 {
    const schema: JSONSchema6 = {};

    this.assignMetadataToSchema(schema, type);

    if (typeof type.enumMember === "string") {
      schema.type = "string";
      schema.enum = [type.enumMember];
      return schema;
    }

    if (typeof type.enumMember === "number") {
      schema.type = "number";
      schema.enum = [type.enumMember];
      return schema;
    }

    throw new Error(
      "Invalid enum member type, enum members can be only of string or number type.",
    );
  }

  private parseInstanceOf(type: InstanceOfType): R {
    if (this.customParser.InstanceOf) {
      return this.customParser.InstanceOf(type, this.options);
    }

    const constructor = type.instanceOf as new() => unknown;

    const schema: JSONSchema6 = {
      type: "object",
      title: constructor.name,
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseCustom(type: CustomType): R {
    if (this.customParser.Custom) {
      return this.customParser.Custom(type.custom, type, this.options);
    }

    if (this.incompatibleTypes === "throw") {
      this.throwIncompatibleTypeError("Custom Validator");
    }
    if (this.incompatibleTypes === "omit") return undefined;

    const schema: JSONSchema6 = {
      title: `Custom Validator (${type.custom.name || "anonymous"})`,
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseStringMatching(type: StringMatchingType): R {
    const schema: JSONSchema6 = {
      type: "string",
      pattern: type.pattern.source,
    };

    if (type.pattern.flags) {
      // json schema does not support Regexp flags,
      // but even if JsonSchema validators cannot use this information
      // we store it under a extra property for the sake of completeness
      Object.assign(schema, { patternFlags: type.pattern.flags });
    }

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseCircular(circular: RecursiveType, children: R[]): R {
    const [childSchema] = children;
    const child = circular.type;

    if (this.definitionNames.has(child)) {
      const definitionName = this.definitionNames.get(child)!;
      this.definitions.set(definitionName, childSchema ?? { type: "null" });
      return {
        allOf: [
          {
            $ref: `#/definitions/${definitionName}`,
          },
        ],
      };
    }

    return childSchema;
  }

  private parseCircularRef(type: RecursiveTypeReference): R {
    const referencedType = type._getReferencedType();

    if (this.definitionNames.has(referencedType)) {
      return {
        $ref: `#/definitions/${this.definitionNames.get(referencedType)}`,
      };
    }

    const metadata = BaseType.getOriginalMetadata(referencedType);
    const title = metadata.title;

    if (title) {
      const typeName = NameGenerator.generate(title);
      this.definitionNames.set(referencedType, typeName);
      return {
        $ref: `#/definitions/${typeName}`,
      };
    }

    const typeName = NameGenerator.generate(
      TypeKindNames.get(referencedType.kind) ?? "Circular",
    );
    this.definitionNames.set(referencedType, typeName);
    return {
      $ref: `#/definitions/${typeName}`,
    };
  }

  visit(dataType: Exclude<AnyDataType, RecordType>, children?: R[]): R;
  visit(dataType: RecordType, children?: RecordVisitChild<R>[]): R;
  visit(type: AnyDataType, children?: (R | RecordVisitChild<R>)[]): R {
    switch (type.kind) {
      case "simple":
        return this.parsePrimitive(type);
      case "array":
        return this.parseArrayOf(type, children as R[]);
      case "tuple":
        return this.parseTuple(type, children as R[]);
      case "record":
        return this.parseRecordOf(type, children as RecordVisitChild<R>[]);
      case "dictionary":
        return this.parseDict(type, children as R[]);
      case "set":
        return this.parseSetOf(type, children as R[]);
      case "union":
        return this.parseOneOf(type, children as R[]);
      case "intersection":
        return this.parseAllOf(type, children as R[]);
      case "literal":
        return this.parseLiteral(type);
      case "enumUnion":
        return this.parseEnum(type);
      case "enumMember":
        return this.parseEnumMember(type);
      case "instanceOf":
        return this.parseInstanceOf(type);
      case "custom":
        return this.parseCustom(type);
      case "stringMatching":
        return this.parseStringMatching(type);
      case "circular":
        return this.parseCircular(type, children as R[]);
      case "circularRef":
        return this.parseCircularRef(type);
    }
  }
}

/** Translates given DataType into a JSON Schema. */
export const toJsonSchema = (
  type: AnyDataType,
  options: ParseToJsonSchemaOptions = {},
  include$schemaProperty = true,
): JSONSchema6 | undefined => {
  try {
    const visitor = new DataTypeJsonSchemaGenerator(options);

    const schema = type._acceptVisitor(visitor);

    if (schema && visitor.definitions.size > 0) {
      schema.definitions = Object.fromEntries(visitor.definitions.entries());
    }

    if (include$schemaProperty && schema) {
      schema.$schema = "http://json-schema.org/draft-06/schema#";
    }

    return schema;
  } finally {
    NameGenerator.clear();
  }
};
