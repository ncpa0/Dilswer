import { ExternalTypeImport } from "@TsTypeGenerator/parser-options";
import {
  DataType,
  getMetadata,
  OptionalField,
  toTsType,
} from "../../src/index";

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
    DataType.RecordOf({ bar: DataType.String }),
  ).setDescription("Array of two possible record types"),
  tuple: DataType.Tuple(DataType.String, DataType.Number),
  namedTuple: DataType.Tuple(
    DataType.ArrayOf(DataType.String),
    DataType.Enum(Enum).setEnumName("Enum"),
  )
    .setTitle("A Tuple")
    .setDescription("A tuple with a named type"),
  literalString: DataType.Literal("literal"),
  literalNumber: DataType.Literal(1),
  literalBoolean: DataType.Literal(true),
  enum: DataType.Enum(Enum).setEnumName("Enum"),
  bMember: DataType.EnumMember(Enum.B).setEnumName("Enum").setMemberName("B"),
  recordIntersection: DataType.AllOf(
    DataType.RecordOf({
      a: DataType.String,
    }),
    DataType.RecordOf({
      b: DataType.Number,
    }),
  ),
  dict: DataType.Dict(DataType.String),
  oneof: DataType.OneOf(
    DataType.RecordOf({ foo: DataType.String }).setTitle("Foo Container"),
    DataType.RecordOf({ bar: DataType.String }).setTitle("Bar Container"),
  ),
  symbol: DataType.Symbol,
  undef: DataType.Undefined,
  customValidator: DataType.Custom((value: any): value is any => true),
  stringMatching: DataType.StringMatching(/^foo$/),
  namedStringMatching: DataType.StringMatching(/^'foo'\..+$/)
    .setTitle("Foo Matcher")
    .setTsPattern("'foo'.${string}"),
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
          DataType.RecordOf({ bar: DataType.String }),
        ),
      },
      tuple: {
        required: false,
        type: DataType.Tuple(DataType.String, DataType.Number),
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
        type: DataType.EnumMember(Enum.B)
          .setEnumName("Enum")
          .setMemberName("B"),
      },
      recordIntersection: {
        required: false,
        type: DataType.AllOf(
          DataType.RecordOf({
            a: DataType.String,
          }),
          DataType.RecordOf({
            b: DataType.Number,
          }),
        ).setTitle("SomeIntersection"),
      },
      dict: { required: false, type: DataType.Dict(DataType.String) },
      oneof: {
        required: false,
        type: DataType.OneOf(
          DataType.RecordOf({ foo: DataType.String }),
          DataType.RecordOf({ bar: DataType.String }),
        ),
      },
    })
      .setTitle("Optional Test Record")
      .setDescription(
        "A record identical to the parent record, but with all fields optional",
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

  describe("should correctly add export statements", () => {
    describe("when exporting only main", () => {
      it("should not add `declare`", () => {
        const dt = DataType.RecordOf({
          foo: DataType.ArrayOf(DataType.String).setTitle("FooList"),
        }).setTitle("Main");

        const tsType = toTsType(dt, {
          declaration: false,
          exports: "main",
          mode: "named-expanded",
          onDuplicateName: "rename",
        });

        expect(tsType).toMatchSnapshot();
      });

      it("should add `declare`", () => {
        const dt = DataType.RecordOf({
          foo: DataType.ArrayOf(DataType.String).setTitle("FooList"),
        }).setTitle("Main");

        const tsType = toTsType(dt, {
          declaration: true,
          exports: "main",
          mode: "named-expanded",
          onDuplicateName: "rename",
        });

        expect(tsType).toMatchSnapshot();
      });
    });

    describe("when exporting only named", () => {
      it("should not add `declare`", () => {
        const dt = DataType.RecordOf({
          unnamed: DataType.ArrayOf(DataType.Number),
          foo: DataType.ArrayOf(DataType.String).setTitle("FooList"),
        }).setTitle("Main");

        const tsType = toTsType(dt, {
          declaration: false,
          exports: "named",
          mode: "fully-expanded",
          onDuplicateName: "rename",
        });

        expect(tsType).toMatchSnapshot();
      });

      it("should add `declare`", () => {
        const dt = DataType.RecordOf({
          unnamed: DataType.ArrayOf(DataType.Number),
          foo: DataType.ArrayOf(DataType.String).setTitle("FooList"),
        }).setTitle("Main");

        const tsType = toTsType(dt, {
          declaration: true,
          exports: "named",
          mode: "fully-expanded",
          onDuplicateName: "rename",
        });

        expect(tsType).toMatchSnapshot();
      });
    });

    describe("when exporting all", () => {
      it("should not add `declare`", () => {
        const dt = DataType.RecordOf({
          unnamed: DataType.ArrayOf(DataType.Number),
          foo: DataType.ArrayOf(DataType.String).setTitle("FooList"),
        }).setTitle("Main");

        const tsType = toTsType(dt, {
          declaration: false,
          exports: "all",
          mode: "fully-expanded",
          onDuplicateName: "rename",
        });

        expect(tsType).toMatchSnapshot();
      });

      it("should add `declare`", () => {
        const dt = DataType.RecordOf({
          unnamed: DataType.ArrayOf(DataType.Number),
          foo: DataType.ArrayOf(DataType.String).setTitle("FooList"),
        }).setTitle("Main");

        const tsType = toTsType(dt, {
          declaration: true,
          exports: "all",
          mode: "fully-expanded",
          onDuplicateName: "rename",
        });

        expect(tsType).toMatchSnapshot();
      });
    });
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

  describe("should correctly add external type import statements", () => {
    it("with regular Custom validator", () => {
      const type = DataType.RecordOf({
        foo: DataType.Custom(
          (v): v is string => typeof v === "string",
        ).setExtra(
          {
            typeName: "CustomFoo",
            path: "./custom-validator.d.ts",
          } satisfies ExternalTypeImport,
        ),
      });

      const tsType = toTsType(type, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          const meta = getMetadata<ExternalTypeImport>(type);
          if (meta.extra) {
            return meta.extra;
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("with regular Enum", () => {
      const type = DataType.RecordOf({
        foo: DataType.Enum(Enum).setExtra(
          {
            typeName: "MyEnum",
            path: "./enum.d.ts",
          } satisfies ExternalTypeImport,
        ),
      });

      const tsType = toTsType(type, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          const meta = getMetadata<ExternalTypeImport>(type);
          if (meta.extra) {
            return meta.extra;
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("with regular Enum Member", () => {
      const type = DataType.RecordOf({
        foo: DataType.EnumMember(Enum.C)
          .setMemberName("C")
          .setExtra(
            {
              typeName: "MyEnum",
              path: "./enum.d.ts",
            } satisfies ExternalTypeImport,
          ),
      });

      const tsType = toTsType(type, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          const meta = getMetadata<ExternalTypeImport>(type);
          if (meta.extra) {
            return meta.extra;
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("with regular Function as a type", () => {
      const type = DataType.RecordOf({
        foo: DataType.Function.setExtra(
          {
            typeName: "MyFunction",
            path: "./my-function.d.ts",
          } satisfies ExternalTypeImport,
        ),
      });

      const tsType = toTsType(type, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          const meta = getMetadata<ExternalTypeImport>(type);
          if (meta.extra) {
            return meta.extra;
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("with regular Function as a value", () => {
      const type = DataType.RecordOf({
        foo: DataType.Function.setExtra(
          {
            typeName: "myFunction",
            path: "./my-function.d.ts",
            valueImport: true,
          } satisfies ExternalTypeImport,
        ),
      });

      const tsType = toTsType(type, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          const meta = getMetadata<ExternalTypeImport>(type);
          if (meta.extra) {
            return meta.extra;
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });

    it("and export it directly if it's a root type", () => {
      const foo = DataType.Custom((v): v is string => typeof v === "string")
        .setTitle("IsStringFn")
        .setExtra(
          {
            typeName: "IsStringFn",
            path: "./is-string-fn.d.ts",
          } satisfies ExternalTypeImport,
        );

      const tsType = toTsType(foo, {
        mode: "named-expanded",
        getExternalTypeImport(type) {
          const meta = getMetadata<ExternalTypeImport>(type);
          if (meta.extra) {
            return meta.extra;
          }
        },
      });

      expect(tsType).toMatchSnapshot();
    });
  });

  describe("should work correctly with circular type", () => {
    it("simple circular record", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.ArrayOf(self),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("simple circular named record", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.ArrayOf(self),
        }).setTitle("Node")
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("immediately self-referencing record", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          self: OptionalField(self),
        }).setTitle("SelfReferencingRecord")
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("simple circular array", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.ArrayOf(DataType.String, self)
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("deeply nested structure", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.RecordOf({
            type: DataType.String,
            container: DataType.RecordOf({
              name: DataType.String,
              children: DataType.ArrayOf(self),
            }),
          }),
        }).setTitle("Node")
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("deeply nested structure of named types", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.ArrayOf(
            DataType.RecordOf({
              name: DataType.Literal("span"),
              children: DataType.ArrayOf(self),
            }).setTitle("SpanNode"),
          ).setTitle("SpanNodeList"),
        }).setTitle("Node")
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("deeply nested circular types", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.Circular((self2) =>
            DataType.ArrayOf(
              self,
              DataType.RecordOf({
                nested: DataType.Literal(true),
                items: self2,
              }),
            )
          ),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with sets", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.SetOf(self),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct sets", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.SetOf(self, DataType.String)
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with dicts", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: DataType.Dict(self),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct dicts", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.Dict(self, DataType.String)
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with tuples", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: OptionalField(
            DataType.OneOf(
              DataType.Tuple(self),
              DataType.Tuple(self, self),
              DataType.Tuple(self, self, self),
            ),
          ),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct tuples", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.Tuple(self, DataType.String)
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with unions", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: OptionalField(
            DataType.OneOf(
              self,
              DataType.RecordOf({
                name: DataType.String,
                children: self,
              }),
            ),
          ),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct unions", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.OneOf(self, DataType.String)
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with intersections", () => {
      const typeDef = DataType.Circular((self) =>
        DataType.RecordOf({
          name: DataType.String,
          children: OptionalField(
            DataType.AllOf(
              self,
              DataType.RecordOf({
                type: DataType.String,
              }),
            ),
          ),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });
  });
});
