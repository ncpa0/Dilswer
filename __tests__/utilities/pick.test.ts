import { DataType, Pick } from "../../src";

describe("Pick utility", () => {
  it("should correctly remove the un-specified keys from data type", () => {
    const a = DataType.RecordOf({
      foo: { type: DataType.Number },
      bar: { type: DataType.String },
      baz: { type: DataType.Boolean },
      qux: { type: DataType.Symbol },
      coorg: { type: DataType.Null },
    });

    expect(Pick(a, "bar", "qux")).toMatchObject(
      DataType.RecordOf({
        bar: { type: DataType.String },
        qux: { type: DataType.Symbol },
      })
    );
  });
});
