import type { InstanceOf } from "@DataTypes/data-types";
import { BaseDataType, DataType } from "@DataTypes/data-types";
import type {
  AllOf,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  Custom,
  DataTypeVisitor,
  Dict,
  Enum,
  EnumMember,
  Literal,
  OneOf,
  RecordOf,
  RecordOfVisitChild,
  SetOf,
} from "@DataTypes/types";
import { isDefined } from "@JSONSchemaParser/is-defined";
import type { JSONSchema6 } from "json-schema";

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
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Custom?: (
      validateFunction: Custom["custom"],
      original: Custom,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Undefined?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Symbol?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    Function?: (
      dataType: BasicDataType,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
    InstanceOf?: (
      original: InstanceOf<new (...args: any[]) => any>,
      options: ParseToJsonSchemaOptions
    ) => JSONSchema6 | undefined;
  };
};

type R = JSONSchema6 | undefined;

class DataTypeJsonSchemaGenerator implements DataTypeVisitor<R> {
  private incompatibleTypes: Exclude<
    ParseToJsonSchemaOptions["incompatibleTypes"],
    undefined
  >;
  private customParser: Exclude<
    ParseToJsonSchemaOptions["customParser"],
    undefined
  >;

  constructor(private options: ParseToJsonSchemaOptions) {
    this.incompatibleTypes = options.incompatibleTypes ?? "throw";
    this.customParser = options.customParser ?? {};
  }

  private throwIncompatibleTypeError(typeName: string): never {
    throw new Error(
      `Cannot parse type "${typeName}" to JSON Schema. Incompatible types.`
    );
  }

  private assignMetadataToSchema(schema: JSONSchema6, type: AnyDataType) {
    const meta = BaseDataType.getOriginalMetadata(type);

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
        if (this.incompatibleTypes === "throw")
          this.throwIncompatibleTypeError(type.simpleType);
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
        if (this.incompatibleTypes === "throw")
          this.throwIncompatibleTypeError(type.simpleType);
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
        if (this.incompatibleTypes === "throw")
          this.throwIncompatibleTypeError(type.simpleType);
        if (this.incompatibleTypes === "omit") {
          schema = undefined;
          break;
        }
        schema.title ??= "undefined";
        break;
    }

    return schema;
  }

  private parseArrayOf(type: ArrayOf, children?: Array<R>): R {
    const schema: JSONSchema6 = {
      type: "array",
      items: children?.filter(isDefined),
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseRecordOf(
    type: RecordOf,
    children: RecordOfVisitChild<R>[] = []
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

  private parseDict(type: Dict, children?: Array<R>): R {
    const schema: JSONSchema6 = {
      type: "object",
      additionalProperties: {
        anyOf: children?.filter(isDefined),
      },
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseSetOf(type: SetOf, children: Array<R> = []): R {
    if (this.customParser.Set)
      return this.customParser.Set(
        children.filter(isDefined),
        type as any as Set<AnyDataType[]>,
        this.options
      );

    if (this.incompatibleTypes === "throw")
      this.throwIncompatibleTypeError("Set");
    if (this.incompatibleTypes === "omit") return undefined;

    const schema: JSONSchema6 = {
      title: "Set",
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseOneOf(type: OneOf, children: Array<R>): R {
    const schema: JSONSchema6 = {
      anyOf: children.filter(isDefined),
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseAllOf(type: AllOf, children: Array<R>): R {
    const schema: JSONSchema6 = {
      allOf: children.filter(isDefined),
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseLiteral(type: Literal): R {
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
      "Invalid literal type, literals can be only of string, number or boolean type."
    );
  }

  private parseEnum(type: Enum): R {
    const members = Object.entries(type.enumInstance);

    const schema: JSONSchema6 = {
      anyOf: [],
    };

    for (const [key, member] of members) {
      const subSchema = this.parseEnumMember(
        DataType.EnumMember(member as string | number)
      );

      subSchema.title = key;

      schema.anyOf!.push(subSchema);
    }

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseEnumMember(type: EnumMember): JSONSchema6 {
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
      "Invalid enum member type, enum members can be only of string or number type."
    );
  }

  private parseInstanceOf(type: InstanceOf): R {
    if (this.customParser.InstanceOf) {
      return this.customParser.InstanceOf(type, this.options);
    }

    const constructor = type.instanceOf as new () => unknown;

    const schema: JSONSchema6 = {
      type: "object",
      title: constructor.name,
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  private parseCustom(type: Custom): R {
    if (this.customParser.Custom)
      return this.customParser.Custom(type.custom, type, this.options);

    if (this.incompatibleTypes === "throw")
      this.throwIncompatibleTypeError("Custom Validator");
    if (this.incompatibleTypes === "omit") return undefined;

    const schema: JSONSchema6 = {
      title: `Custom Validator (${type.custom.name || "anonymous"})`,
    };

    this.assignMetadataToSchema(schema, type);

    return schema;
  }

  visit(dataType: Exclude<AnyDataType, RecordOf>, children?: R[]): R;
  visit(dataType: RecordOf, children?: RecordOfVisitChild<R>[]): R;
  visit(type: AnyDataType, children?: (R | RecordOfVisitChild<R>)[]): R {
    switch (type.kind) {
      case "simple":
        return this.parsePrimitive(type);
      case "array":
        return this.parseArrayOf(type, children as R[]);
      case "record":
        return this.parseRecordOf(type, children as RecordOfVisitChild<R>[]);
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
    }
  }
}

/** Translates given DataType into a JSON Schema. */
export const toJsonSchema = (
  type: AnyDataType,
  options: ParseToJsonSchemaOptions = {},
  include$schemaProperty = true
): JSONSchema6 | undefined => {
  const visitor = new DataTypeJsonSchemaGenerator(options);

  const schema = type._acceptVisitor(visitor);

  if (include$schemaProperty && schema) {
    schema.$schema = "http://json-schema.org/draft-06/schema#";
  }

  return schema;
};
