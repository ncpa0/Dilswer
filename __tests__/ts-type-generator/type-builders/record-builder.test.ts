import { toTsType, Type } from "../../../src/index";

describe("TsRecordBuilder", () => {
  it("should correctly generate a simple record type", () => {
    const dt = Type.Record({
      foo: Type.String,
      bar: Type.Option(Type.Number),
    });

    const tsType = toTsType(dt);

    expect(tsType).toMatchSnapshot();
    expect(tsType).toBe(
      "export type RecordType = {\n  foo: string;\n  bar?: number;\n};\n",
    );
  });

  it("should correctly generate a simple record type with title and description", () => {
    const dt = Type.Record({
      foo: Type.String,
      bar: Type.Option(Type.Number),
    });

    dt.meta.title("MyRec");
    dt.meta.description("My record's description");

    dt.recordOf.foo.meta.description("The foo field");
    dt.recordOf.bar.type.meta.description("The bar field");

    const tsType = toTsType(dt);

    expect(tsType).toMatchSnapshot();
    expect(tsType).toBe(
      "/**\n * My record's description\n */\nexport type MyRec = {\n  /**\n   * The foo field\n   */\n  foo: string;\n  /**\n   * The bar field\n   */\n  bar?: number;\n};\n",
    );
  });
});
