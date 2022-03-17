import { DataType, Omit } from "../../src";

describe("Omit utility", () => {
  it("should correctly remove the specified keys from data type", () => {
    const a = DataType.RecordOf({
      foo: { type: DataType.Number },
      bar: { type: DataType.String },
      baz: { type: DataType.Boolean },
      qux: { type: DataType.Symbol },
      coorg: { type: DataType.Null },
    });

    expect(Omit(a, "bar", "qux")).toMatchObject(
      DataType.RecordOf({
        foo: { type: DataType.Number },
        baz: { type: DataType.Boolean },
        coorg: { type: DataType.Null },
      })
    );
  });
});
