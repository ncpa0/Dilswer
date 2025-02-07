import { DataType, toTsType } from "../../../src/index";

describe("TsArrayBuilder", () => {
  it("should correctly generate a simple array type", () => {
    const dt = DataType.ArrayOf(DataType.String);

    const tsType = toTsType(dt);

    expect(tsType).toBe("export type ArrayType = Array<string>;\n");
  });

  it("should correctly generate a simple array type with title and description", () => {
    const dt = DataType.ArrayOf(DataType.Number);

    dt.setTitle("MyArray");
    dt.setDescription("My array description");

    const tsType = toTsType(dt);

    expect(tsType).toBe(
      `/**\n * My array description\n */\nexport type MyArray = Array<number>;\n`,
    );
  });
});
