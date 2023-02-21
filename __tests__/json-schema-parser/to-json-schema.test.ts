import Ajv from "ajv";
import { DataType, OptionalField, toJsonSchema } from "../../src";

enum Enum {
  A = "A",
  B = "B",
  C = "C",
}

const testDt = DataType.RecordOf({
  uuid: DataType.String,
  number: DataType.Number,
  bool: DataType.Boolean,
  stringSet: DataType.SetOf(DataType.String),
  stringArray: DataType.ArrayOf(DataType.String),
  unionArray: DataType.ArrayOf(
    DataType.RecordOf({ foo: DataType.String }),
    DataType.RecordOf({ bar: DataType.String })
  ),
  tuple: DataType.Tuple(DataType.String, DataType.Number),
  literalString: DataType.Literal("literal"),
  literalNumber: DataType.Literal(1),
  literalBoolean: DataType.Literal(true),
  enum: DataType.Enum(Enum),
  bMember: DataType.EnumMember(Enum.B),
  recordIntersection: DataType.AllOf(
    DataType.RecordOf({
      a: DataType.String,
    }),
    DataType.RecordOf({
      b: DataType.Number,
    })
  ),
  dict: DataType.Dict(DataType.String),
  oneof: DataType.OneOf(
    DataType.RecordOf({ foo: DataType.String }),
    DataType.RecordOf({ bar: DataType.String })
  ),
  symbol: DataType.Symbol,
  undef: DataType.Undefined,
  customValidator: DataType.Custom((value: any): value is any => true),
  stringMatching: DataType.StringMatching(/^foo$/),
  optionalSelfCopy: {
    required: false,
    type: DataType.RecordOf({
      id: { required: false, type: DataType.String },
      number: { required: false, type: DataType.Number },
      bool: { required: false, type: DataType.Boolean },
      stringSet: { required: false, type: DataType.SetOf(DataType.String) },
      stringArray: { required: false, type: DataType.ArrayOf(DataType.String) },
      unionArray: {
        required: false,
        type: DataType.ArrayOf(
          DataType.RecordOf({ foo: DataType.String }),
          DataType.RecordOf({ bar: DataType.String })
        ),
      },
      tuple: {
        required: false,
        type: DataType.Tuple(
          DataType.RecordOf({
            id: { required: false, type: DataType.String },
          }),
          DataType.Literal("separator"),
          DataType.Boolean
        ),
      },
      literalString: { required: false, type: DataType.Literal("literal") },
      literalNumber: { required: false, type: DataType.Literal(1) },
      literalBoolean: { required: false, type: DataType.Literal(true) },
      enum: { required: false, type: DataType.Enum(Enum) },
      bMember: { required: false, type: DataType.EnumMember(Enum.B) },
      recordIntersection: {
        required: false,
        type: DataType.AllOf(
          DataType.RecordOf({
            a: DataType.String,
          }),
          DataType.RecordOf({
            b: DataType.Number,
          })
        ),
      },
      dict: { required: false, type: DataType.Dict(DataType.String) },
      oneof: {
        required: false,
        type: DataType.OneOf(
          DataType.RecordOf({ foo: DataType.String }),
          DataType.RecordOf({ bar: DataType.String })
        ),
      },
      stringMatching: {
        required: false,
        type: DataType.StringMatching(/foo.+[0-9]$/gi),
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
      false
    );

    expect(schema).toBeDefined();
    expect(schema).toMatchSnapshot();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should throw an error when attempting to parse incompatible types when set to 'throw'", () => {
    expect(() =>
      toJsonSchema(testDt, { incompatibleTypes: "throw" })
    ).toThrow();
  });

  it("should set the specified additionalProperty", () => {
    const schema = toJsonSchema(
      testDt,
      { incompatibleTypes: "omit", additionalProperties: false },
      false
    );

    expect(schema).toMatchSnapshot();
    expect(schema).toBeDefined();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should use the custom parsers", () => {
    const dt = DataType.RecordOf({
      custom: DataType.Custom((value: any): value is any => true),
      function: DataType.Function,
      set: DataType.SetOf(DataType.String),
      symbol: DataType.Symbol,
      undefined: DataType.Undefined,
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
      false
    );

    expect(schema).toMatchSnapshot();
    expect(schema).toBeDefined();

    const isValid = new Ajv().validateSchema(schema!);

    expect(isValid).toEqual(true);
  });

  it("should copy the properties from metadata", () => {
    const dt = DataType.RecordOf({
      date: DataType.String.setFormat("date-time"),
      timestamp:
        DataType.Int.setDescription("UNIX timestamp.").setTitle(
          "Creation Timestamp"
        ),
      list: DataType.ArrayOf(DataType.String),
      dictionary: OptionalField(
        DataType.RecordOf({ foo: DataType.Unknown }).setDescription(
          "This field is optional."
        )
      ),
    }).setTitle("Top Record");

    dt.recordOf.list
      .setTitle("List of strings")
      .setDescription("This is a list of strings");

    const schema = toJsonSchema(dt, { incompatibleTypes: "set-as-any" });

    expect(schema).toMatchSnapshot();
  });
});
