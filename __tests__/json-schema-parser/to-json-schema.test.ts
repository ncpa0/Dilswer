import Ajv from "ajv";
import { OptionalField, toJsonSchema, Type } from "../../src";

enum Enum {
  A = "A",
  B = "B",
  C = "C",
}

const testDt = Type.Record({
  uuid: Type.String,
  number: Type.Number,
  bool: Type.Boolean,
  stringSet: Type.Set(Type.String),
  stringArray: Type.Array(Type.String),
  unionArray: Type.Array(
    Type.Record({ foo: Type.String }),
    Type.Record({ bar: Type.String }),
  ),
  tuple: Type.Tuple(Type.String, Type.Number),
  literalString: Type.Literal("literal"),
  literalNumber: Type.Literal(1),
  literalBoolean: Type.Literal(true),
  enum: Type.Enum(Enum),
  bMember: Type.EnumMember(Enum.B),
  recordIntersection: Type.AllOf(
    Type.Record({
      a: Type.String,
    }),
    Type.Record({
      b: Type.Number,
    }),
  ),
  dict: Type.Dict(Type.String),
  oneof: Type.OneOf(
    Type.Record({ foo: Type.String }),
    Type.Record({ bar: Type.String }),
  ),
  symbol: Type.Symbol,
  undef: Type.Undefined,
  customValidator: Type.Custom((value: any): value is any => true),
  stringMatching: Type.StringMatching(/^foo$/),
  optionalSelfCopy: {
    required: false,
    type: Type.Record({
      id: { required: false, type: Type.String },
      number: { required: false, type: Type.Number },
      bool: { required: false, type: Type.Boolean },
      stringSet: { required: false, type: Type.Set(Type.String) },
      stringArray: { required: false, type: Type.Array(Type.String) },
      unionArray: {
        required: false,
        type: Type.Array(
          Type.Record({ foo: Type.String }),
          Type.Record({ bar: Type.String }),
        ),
      },
      tuple: {
        required: false,
        type: Type.Tuple(
          Type.Record({
            id: { required: false, type: Type.String },
          }),
          Type.Literal("separator"),
          Type.Boolean,
        ),
      },
      literalString: { required: false, type: Type.Literal("literal") },
      literalNumber: { required: false, type: Type.Literal(1) },
      literalBoolean: { required: false, type: Type.Literal(true) },
      enum: { required: false, type: Type.Enum(Enum) },
      bMember: { required: false, type: Type.EnumMember(Enum.B) },
      recordIntersection: {
        required: false,
        type: Type.AllOf(
          Type.Record({
            a: Type.String,
          }),
          Type.Record({
            b: Type.Number,
          }),
        ),
      },
      dict: { required: false, type: Type.Dict(Type.String) },
      oneof: {
        required: false,
        type: Type.OneOf(
          Type.Record({ foo: Type.String }),
          Type.Record({ bar: Type.String }),
        ),
      },
      stringMatching: {
        required: false,
        type: Type.StringMatching(/foo.+[0-9]$/gi),
      },
    }),
  },
});

describe("toJsonSchema", () => {
  it("should parse to a valid JSONSchema when set to 'omit'", () => {
    const schema = toJsonSchema(testDt, { incompatibleTypes: "omit" }, false);

    expect(schema).toMatchSnapshot();
    expect(schema).toBeDefined();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should parse to a valid JSONSchema when set to 'set-as-any'", () => {
    const schema = toJsonSchema(
      testDt,
      { incompatibleTypes: "set-as-any" },
      false,
    );

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should throw an error when attempting to parse incompatible types when set to 'throw'", () => {
    expect(() => toJsonSchema(testDt, { incompatibleTypes: "throw" }))
      .toThrow();
  });

  it("should set the specified additionalProperty", () => {
    const schema = toJsonSchema(
      testDt,
      { incompatibleTypes: "omit", additionalProperties: false },
      false,
    );

    expect(schema).toMatchSnapshot();
    expect(schema).toBeDefined();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should use the custom parsers", () => {
    const dt = Type.Record({
      custom: Type.Custom((value: any): value is any => true),
      function: Type.Function,
      set: Type.Set(Type.String),
      symbol: Type.Symbol,
      undefined: Type.Undefined,
    });

    const schema = toJsonSchema(
      dt,
      {
        customParser: {
          Custom(validateFunction, original, options) {
            return {
              title: "Custom parser schema for validateFunction",
            };
          },
          Function(dataType, options) {
            return {
              title: "Custom parser schema for Function DataType",
            };
          },
          Set(setItemsSchemas, original, options) {
            return {
              title: "Custom parser schema for Set DataType",
            };
          },
          Symbol(dataType, options) {
            return {
              title: "Custom parser schema for Symbol DataType",
            };
          },
          Undefined(dataType, options) {
            return {
              title: "Custom parser schema for Undefined DataType",
            };
          },
        },
      },
      false,
    );

    expect(schema).toMatchSnapshot();
    expect(schema).toBeDefined();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should copy the properties from metadata", () => {
    const dt = Type.Record({
      date: Type.String.setFormat("date-time"),
      timestamp: Type.Int.setDescription("UNIX timestamp.").setTitle(
        "Creation Timestamp",
      ),
      list: Type.Array(Type.String),
      dictionary: OptionalField(
        Type.Record({ foo: Type.Unknown }).setDescription(
          "This field is optional.",
        ),
      ),
    }).setTitle("Top Record");

    dt.recordOf.list
      .setTitle("List of strings")
      .setDescription("This is a list of strings");

    const schema = toJsonSchema(dt, { incompatibleTypes: "set-as-any" });

    expect(schema).toMatchSnapshot();
  });

  describe("should work correctly with circular type", () => {
    it("simple circular record", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Array(self),
        })
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("simple circular named record", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Array(self),
        }).setTitle("Node")
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("immediately self-referencing record", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          self: OptionalField(self),
        }).setTitle("SelfReferencingRecord")
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("simple circular array", () => {
      const typeDef = Type.Recursive((self) => Type.Array(Type.String, self));

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("deeply nested structure", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Record({
            type: Type.String,
            container: Type.Record({
              name: Type.String,
              children: Type.Array(self),
            }),
          }),
        }).setTitle("Node")
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("deeply nested structure of named types", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Array(
            Type.Record({
              name: Type.Literal("span"),
              children: Type.Array(self),
            }).setTitle("SpanNode"),
          ).setTitle("SpanNodeList"),
        }).setTitle("Node")
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("deeply nested circular types", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Recursive((self2) =>
            Type.Array(
              self,
              Type.Record({
                nested: Type.Literal(true),
                items: self2,
              }),
            )
          ),
        })
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with dicts", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Dict(self),
        })
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with direct dicts", () => {
      const typeDef = Type.Recursive((self) => Type.Dict(self, Type.String));

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with tuples", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: OptionalField(
            Type.OneOf(
              Type.Tuple(self),
              Type.Tuple(self, self),
              Type.Tuple(self, self, self),
            ),
          ),
        })
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with direct tuples", () => {
      const typeDef = Type.Recursive((self) => Type.Tuple(self, Type.String));

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with unions", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: OptionalField(
            Type.OneOf(
              self,
              Type.Record({
                name: Type.String,
                children: self,
              }),
            ),
          ),
        })
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with direct unions", () => {
      const typeDef = Type.Recursive((self) => Type.OneOf(self, Type.String));

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });

    it("works with intersections", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: OptionalField(
            Type.AllOf(
              self,
              Type.Record({
                type: Type.String,
              }),
            ),
          ),
        })
      );

      const schema = toJsonSchema(typeDef, {}, false);

      expect(schema).toMatchSnapshot();

      const isValid = new Ajv().validateSchema(schema!);

      expect(isValid).toEqual(true);
    });
  });
});
