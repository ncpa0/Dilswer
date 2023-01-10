import { DataType, toTsType } from "../../src/index";

enum Enum {
  A = "A",
  B = "B",
  C = "C",
}

const testDt = DataType.RecordOf({
  uuid: DataType.String.setDescription("User unique identifier"),
  number: DataType.Number,
  bool: DataType.Boolean,
  stringSet: DataType.SetOf(DataType.String),
  stringArray: DataType.ArrayOf(DataType.String),
  unionArray: DataType.ArrayOf(
    DataType.RecordOf({ foo: DataType.String }),
    DataType.RecordOf({ bar: DataType.String })
  ).setDescription("Array of two possible record types"),
  literalString: DataType.Literal("literal"),
  literalNumber: DataType.Literal(1),
  literalBoolean: DataType.Literal(true),
  enum: DataType.Enum(Enum).setEnumName("Enum"),
  bMember: DataType.EnumMember(Enum.B).setEnumMemberName("Enum.B"),
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
    DataType.RecordOf({ foo: DataType.String }).setTitle("Foo Container"),
    DataType.RecordOf({ bar: DataType.String }).setTitle("Bar Container")
  ),
  symbol: DataType.Symbol,
  undef: DataType.Undefined,
  customValidator: DataType.Custom((value: any): value is any => true),
  optionalSelfCopy: {
    required: false,
    type: DataType.RecordOf({
      id: { required: false, type: DataType.String },
      number: { required: false, type: DataType.Number },
      bool: { required: false, type: DataType.Boolean },
      stringSet: { required: false, type: DataType.SetOf(DataType.String) },
      stringArray: {
        required: false,
        type: DataType.ArrayOf(DataType.String),
      },
      unionArray: {
        required: false,
        type: DataType.ArrayOf(
          DataType.RecordOf({ foo: DataType.String }).setTitle("Foo Container"),
          DataType.RecordOf({ bar: DataType.String })
        ),
      },
      literalString: { required: false, type: DataType.Literal("literal") },
      literalNumber: { required: false, type: DataType.Literal(1) },
      literalBoolean: { required: false, type: DataType.Literal(true) },
      enum: {
        required: false,
        type: DataType.Enum(Enum).setEnumName("Enum"),
      },
      bMember: {
        required: false,
        type: DataType.EnumMember(Enum.B).setEnumMemberName("Enum.B"),
      },
      recordIntersection: {
        required: false,
        type: DataType.AllOf(
          DataType.RecordOf({
            a: DataType.String,
          }),
          DataType.RecordOf({
            b: DataType.Number,
          })
        ).setTitle("SomeIntersection"),
      },
      dict: { required: false, type: DataType.Dict(DataType.String) },
      oneof: {
        required: false,
        type: DataType.OneOf(
          DataType.RecordOf({ foo: DataType.String }),
          DataType.RecordOf({ bar: DataType.String })
        ),
      },
    })
      .setTitle("Optional Test Record")
      .setDescription(
        "A record identical to the parent record, but with all fields optional"
      ),
  },
}).setTitle("Test Record");

describe("toTsType", () => {
  it("should correctly generate a complex type with 'compact' mode", () => {
    const tsType = toTsType(testDt);

    expect(tsType).toMatchSnapshot();
  });

  it("should correctly generate a complex type with 'named-expanded' mode", () => {
    const tsType = toTsType(testDt, {
      mode: "named-expanded",
      onDuplicateName: "rename",
    });

    expect(tsType).toMatchSnapshot();
  });

  it("should correctly generate a complex type with 'fully-expanded' mode", () => {
    const tsType = toTsType(testDt, {
      mode: "fully-expanded",
      onDuplicateName: "rename",
    });

    expect(tsType).toMatchSnapshot();
  });

  describe("should correctly generate a type referencing a class", () => {
    it("in compact mode with global FooBar", () => {
      class FooBar {}

      const dt = DataType.RecordOf({
        foobar: DataType.InstanceOf(FooBar),
      });

      const tsType = toTsType(dt);

      expect(tsType).toMatchSnapshot();
    });

    it("in fully-expanded mode with global FooBar", () => {
      class FooBar {}

      const dt = DataType.RecordOf({
        foobar: DataType.InstanceOf(FooBar),
      });

      const tsType = toTsType(dt, { mode: "fully-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("in fully-expanded mode with global FooBar", () => {
      class FooBar {}

      const dt = DataType.RecordOf({
        foobar: DataType.InstanceOf(FooBar).setTitle("FooBar"),
      });

      const tsType = toTsType(dt, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("in compact mode with imported FooBar", () => {
      class FooBar {}

      const dt = DataType.RecordOf({
        foobar: DataType.InstanceOf(FooBar),
      });

      const tsType = toTsType(dt, {
        getExternalTypeImport(type) {
          if (type.kind === "instanceOf" && type.instanceOf === FooBar) {
            return {
              path: "./foo-bar",
              typeName: "FooBar",
            };
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("in fully-expanded mode with imported FooBar", () => {
      class FooBar {}

      const dt = DataType.RecordOf({
        foobar: DataType.InstanceOf(FooBar),
      });

      const tsType = toTsType(dt, {
        mode: "fully-expanded",
        getExternalTypeImport(type) {
          if (type.kind === "instanceOf" && type.instanceOf === FooBar) {
            return {
              path: "./foo-bar",
              typeName: "FooBar",
            };
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("in fully-expanded mode with imported FooBar", () => {
      class FooBar {}

      const dt = DataType.RecordOf({
        foobar: DataType.InstanceOf(FooBar).setTitle("FooBar"),
      });

      const tsType = toTsType(dt, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          if (type.kind === "instanceOf" && type.instanceOf === FooBar) {
            return {
              path: "./foo-bar",
              typeName: "FooBar",
            };
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });
  });
});
