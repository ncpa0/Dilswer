import { ExternalTypeImport } from "@TsTypeGenerator/parser-options";
import { getMetadata, OptionalField, toTsType, Type } from "../../src/index";

enum Enum {
  A = "A",
  B = "B",
  C = "C",
}

const testDt = Type.Record({
  uuid: Type.String.setDescription("User unique identifier"),
  number: Type.Number,
  bool: Type.Boolean,
  stringSet: Type.Set(Type.String),
  stringArray: Type.Array(Type.String),
  unionArray: Type.Array(
    Type.Record({ foo: Type.String }),
    Type.Record({ bar: Type.String }),
  ).setDescription("Array of two possible record types"),
  tuple: Type.Tuple(Type.String, Type.Number),
  namedTuple: Type.Tuple(
    Type.Array(Type.String),
    Type.Enum(Enum).setEnumName("Enum"),
  )
    .setTitle("A Tuple")
    .setDescription("A tuple with a named type"),
  literalString: Type.Literal("literal"),
  literalNumber: Type.Literal(1),
  literalBoolean: Type.Literal(true),
  enum: Type.Enum(Enum).setEnumName("Enum"),
  bMember: Type.EnumMember(Enum.B).setEnumName("Enum").setMemberName("B"),
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
    Type.Record({ foo: Type.String }).setTitle("Foo Container"),
    Type.Record({ bar: Type.String }).setTitle("Bar Container"),
  ),
  symbol: Type.Symbol,
  undef: Type.Undefined,
  customValidator: Type.Custom((value: any): value is any => true),
  stringMatching: Type.StringMatching(/^foo$/),
  namedStringMatching: Type.StringMatching(/^'foo'\..+$/)
    .setTitle("Foo Matcher")
    .setTsPattern("'foo'.${string}"),
  optionalSelfCopy: {
    required: false,
    type: Type.Record({
      id: { required: false, type: Type.String },
      number: { required: false, type: Type.Number },
      bool: { required: false, type: Type.Boolean },
      stringSet: { required: false, type: Type.Set(Type.String) },
      stringArray: {
        required: false,
        type: Type.Array(Type.String),
      },
      unionArray: {
        required: false,
        type: Type.Array(
          Type.Record({ foo: Type.String }).setTitle("Foo Container"),
          Type.Record({ bar: Type.String }),
        ),
      },
      tuple: {
        required: false,
        type: Type.Tuple(Type.String, Type.Number),
      },
      literalString: { required: false, type: Type.Literal("literal") },
      literalNumber: { required: false, type: Type.Literal(1) },
      literalBoolean: { required: false, type: Type.Literal(true) },
      enum: {
        required: false,
        type: Type.Enum(Enum).setEnumName("Enum"),
      },
      bMember: {
        required: false,
        type: Type.EnumMember(Enum.B)
          .setEnumName("Enum")
          .setMemberName("B"),
      },
      recordIntersection: {
        required: false,
        type: Type.AllOf(
          Type.Record({
            a: Type.String,
          }),
          Type.Record({
            b: Type.Number,
          }),
        ).setTitle("SomeIntersection"),
      },
      dict: { required: false, type: Type.Dict(Type.String) },
      oneof: {
        required: false,
        type: Type.OneOf(
          Type.Record({ foo: Type.String }),
          Type.Record({ bar: Type.String }),
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
        const dt = Type.Record({
          foo: Type.Array(Type.String).setTitle("FooList"),
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
        const dt = Type.Record({
          foo: Type.Array(Type.String).setTitle("FooList"),
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
        const dt = Type.Record({
          unnamed: Type.Array(Type.Number),
          foo: Type.Array(Type.String).setTitle("FooList"),
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
        const dt = Type.Record({
          unnamed: Type.Array(Type.Number),
          foo: Type.Array(Type.String).setTitle("FooList"),
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
        const dt = Type.Record({
          unnamed: Type.Array(Type.Number),
          foo: Type.Array(Type.String).setTitle("FooList"),
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
        const dt = Type.Record({
          unnamed: Type.Array(Type.Number),
          foo: Type.Array(Type.String).setTitle("FooList"),
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

      const dt = Type.Record({
        foobar: Type.InstanceOf(FooBar),
      });

      const tsType = toTsType(dt);

      expect(tsType).toMatchSnapshot();
    });

    it("in fully-expanded mode with global FooBar", () => {
      class FooBar {}

      const dt = Type.Record({
        foobar: Type.InstanceOf(FooBar),
      });

      const tsType = toTsType(dt, { mode: "fully-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("in fully-expanded mode with global FooBar", () => {
      class FooBar {}

      const dt = Type.Record({
        foobar: Type.InstanceOf(FooBar).setTitle("FooBar"),
      });

      const tsType = toTsType(dt, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("in compact mode with imported FooBar", () => {
      class FooBar {}

      const dt = Type.Record({
        foobar: Type.InstanceOf(FooBar),
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

      const dt = Type.Record({
        foobar: Type.InstanceOf(FooBar),
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

      const dt = Type.Record({
        foobar: Type.InstanceOf(FooBar).setTitle("FooBar"),
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
      const type = Type.Record({
        foo: Type.Custom(
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
      const type = Type.Record({
        foo: Type.Enum(Enum).setExtra(
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
      const type = Type.Record({
        foo: Type.EnumMember(Enum.C)
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
      const type = Type.Record({
        foo: Type.Function.setExtra(
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
      const type = Type.Record({
        foo: Type.Function.setExtra(
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
      const foo = Type.Custom((v): v is string => typeof v === "string")
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
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Array(self),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("simple circular named record", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Array(self),
        }).setTitle("Node")
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("immediately self-referencing record", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          self: OptionalField(self),
        }).setTitle("SelfReferencingRecord")
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("simple circular array", () => {
      const typeDef = Type.Recursive((self) => Type.Array(Type.String, self));

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
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

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
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

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
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

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with sets", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Set(self),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct sets", () => {
      const typeDef = Type.Recursive((self) => Type.Set(self, Type.String));

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with dicts", () => {
      const typeDef = Type.Recursive((self) =>
        Type.Record({
          name: Type.String,
          children: Type.Dict(self),
        })
      );

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct dicts", () => {
      const typeDef = Type.Recursive((self) => Type.Dict(self, Type.String));

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
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

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct tuples", () => {
      const typeDef = Type.Recursive((self) => Type.Tuple(self, Type.String));

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
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

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });

    it("works with direct unions", () => {
      const typeDef = Type.Recursive((self) => Type.OneOf(self, Type.String));

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
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

      const tsType = toTsType(typeDef, { mode: "named-expanded" });

      expect(tsType).toMatchSnapshot();
    });
  });
});
