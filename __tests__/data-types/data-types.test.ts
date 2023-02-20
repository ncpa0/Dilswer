import { DataType } from "../../src";

describe("DataType", () => {
  describe("SimpleDataType", () => {
    it("should be immutable", () => {
      const type = DataType.String;

      expect(() => {
        // @ts-expect-error
        type.simpleType = "number";
      }).toThrowError();
    });
  });

  describe("RecordOf", () => {
    it("should be immutable", () => {
      const type = DataType.RecordOf({
        foo: { type: DataType.String },
      });

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.recordOf.foo = DataType.Boolean;
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.recordOf.foo.type = DataType.Boolean;
      }).toThrowError();
    });
  });

  describe("Dict", () => {
    it("should be immutable", () => {
      const type = DataType.Dict(DataType.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.dict.push(DataType.Boolean);
      }).toThrowError();
    });
  });

  describe("ArrayOf", () => {
    it("should be immutable", () => {
      const type = DataType.ArrayOf(DataType.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.arrayOf.push(DataType.Boolean);
      }).toThrowError();
    });
  });

  describe("SetOf", () => {
    it("should be immutable", () => {
      const type = DataType.SetOf(DataType.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.setOf.push(DataType.Boolean);
      }).toThrowError();
    });
  });

  describe("OneOf", () => {
    it("should be immutable", () => {
      const type = DataType.OneOf(DataType.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "record";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.oneOf.push(DataType.Boolean);
      }).toThrowError();
    });
  });

  describe("AllOf", () => {
    it("should be immutable", () => {
      const type = DataType.AllOf(DataType.String);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.allOf.push(DataType.Boolean);
      }).toThrowError();
    });
  });

  describe("Literal", () => {
    it("should be immutable", () => {
      const type = DataType.Literal("foo");

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.literal = "bar";
      }).toThrowError();
    });
  });

  describe("EnumMemeber", () => {
    it("should be immutable", () => {
      enum Enum {
        foo = "foo",
        bar = "bar",
      }
      const type = DataType.EnumMember(Enum.foo);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.enumMember = Enum.bar;
      }).toThrowError();
    });
  });

  describe("Enum", () => {
    it("should be immutable", () => {
      enum Enum {
        foo = "foo",
        bar = "bar",
      }
      const type = DataType.Enum(Enum);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.enum = {};
      }).toThrowError();
    });
  });

  describe("InstanceOf", () => {
    it("should be immutable", () => {
      class Foo {}
      const type = DataType.InstanceOf(Foo);

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.instanceOf = {};
      }).toThrowError();
    });
  });

  describe("Custom", () => {
    it("should be immutable", () => {
      const type = DataType.Custom((v): v is string => typeof v === "string");

      expect(() => {
        // @ts-expect-error
        type.kind = "oneOf";
      }).toThrowError();

      expect(() => {
        // @ts-expect-error
        type.custom = () => true;
      }).toThrowError();
    });
  });
});
