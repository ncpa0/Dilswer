import { Type } from "../../src";

describe("DataType", () => {
  describe("SimpleDataType", () => {
    it("should be immutable", () => {
      const type = Type.String;

      expect(() => {
        // @ts-expect-error
        type.simpleType = "number";
      }).toThrow();
    });
  });

  describe("RecordOf", () => {
    it("should be immutable", () => {
      const type = Type.Record({
        foo: { type: Type.String },
      });

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.recordOf.foo = Type.Boolean;
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.recordOf.foo.type = Type.Boolean;
      }).toThrow();
    });
  });

  describe("Dict", () => {
    it("should be immutable", () => {
      const type = Type.Dict(Type.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.dict.push(Type.Boolean);
      }).toThrow();
    });
  });

  describe("ArrayOf", () => {
    it("should be immutable", () => {
      const type = Type.Array(Type.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.arrayOf.push(Type.Boolean);
      }).toThrow();
    });
  });

  describe("SetOf", () => {
    it("should be immutable", () => {
      const type = Type.Set(Type.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.setOf.push(Type.Boolean);
      }).toThrow();
    });
  });

  describe("OneOf", () => {
    it("should be immutable", () => {
      const type = Type.OneOf(Type.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "record";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.oneOf.push(Type.Boolean);
      }).toThrow();
    });
  });

  describe("AllOf", () => {
    it("should be immutable", () => {
      const type = Type.AllOf(Type.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.allOf.push(Type.Boolean);
      }).toThrow();
    });
  });

  describe("Literal", () => {
    it("should be immutable", () => {
      const type = Type.Literal("foo");

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.literal = "bar";
      }).toThrow();
    });
  });

  describe("EnumMemeber", () => {
    it("should be immutable", () => {
      enum Enum {
        foo = "foo",
        bar = "bar",
      }
      const type = Type.EnumMember(Enum.foo);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.enumMember = Enum.bar;
      }).toThrow();
    });
  });

  describe("Enum", () => {
    it("should be immutable", () => {
      enum Enum {
        foo = "foo",
        bar = "bar",
      }
      const type = Type.Enum(Enum);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.enum = {};
      }).toThrow();
    });
  });

  describe("InstanceOf", () => {
    it("should be immutable", () => {
      class Foo {}
      const type = Type.InstanceOf(Foo);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.instanceOf = {};
      }).toThrow();
    });
  });

  describe("Custom", () => {
    it("should be immutable", () => {
      const type = Type.Custom((v): v is string => typeof v === "string");

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrow();

      expect(() => {
        // @ts-expect-error
        type.custom = () => true;
      }).toThrow();
    });
  });
});
