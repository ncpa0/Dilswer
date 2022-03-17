import { DataType, Required } from "../../src";

describe("Required utility", () => {
  it("should correctly set all fields as required", () => {
    const a = DataType.RecordOf({
      foo: { type: DataType.Number, required: true },
      bar: { type: DataType.String, required: false },
      baz: { type: DataType.Boolean, required: true },
      qux: { type: DataType.Symbol, required: false },
      coorg: { type: DataType.Null },
    });

    expect(Required(a)).toMatchObject(
      DataType.RecordOf({
        foo: { type: DataType.Number, required: true },
        bar: { type: DataType.String, required: true },
        baz: { type: DataType.Boolean, required: true },
        qux: { type: DataType.Symbol, required: true },
        coorg: { type: DataType.Null, required: true },
      })
    );
  });
});
