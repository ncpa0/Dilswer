import { DataType, OptionalField, toTsType } from "../../../src/index";

describe("TsRecordBuilder", () => {
  it("should correctly generate a simple record type", () => {
    const dt = DataType.RecordOf({
      foo: DataType.String,
      bar: OptionalField(DataType.Number),
    });

    const tsType = toTsType(dt);

    expect(tsType).toMatchSnapshot();
    expect(tsType).toBe(
      "export type RecordType = {\n  foo: string;\n  bar?: number;\n};\n",
    );
  });

  it("should correctly generate a simple record type with title and description", () => {
    const dt = DataType.RecordOf({
      foo: DataType.String,
      bar: OptionalField(DataType.Number),
    });

    dt.setTitle("MyRec");
    dt.setDescription("My record's description");

    dt.recordOf.foo.setDescription("The foo field");
    dt.recordOf.bar.type.setDescription("The bar field");

    const tsType = toTsType(dt);

    expect(tsType).toMatchSnapshot();
    expect(tsType).toBe(
      "/**\n * My record's description\n */\nexport type MyRec = {\n  /**\n   * The foo field\n   */\n  foo: string;\n  /**\n   * The bar field\n   */\n  bar?: number;\n};\n",
    );
  });
});
