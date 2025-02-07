import { DataType, Partial } from "../../src";

describe("Partial utility", () => {
  it("should correctly set all fields as not required", () => {
    const a = DataType.RecordOf({
      foo: { type: DataType.Number, required: true },
      bar: { type: DataType.String, required: false },
      baz: { type: DataType.Boolean, required: true },
      qux: { type: DataType.Symbol, required: false },
      coorg: { type: DataType.Null },
    });

    expect(Partial(a)).toMatchObject(
      DataType.RecordOf({
        foo: { type: DataType.Number, required: false },
        bar: { type: DataType.String, required: false },
        baz: { type: DataType.Boolean, required: false },
        qux: { type: DataType.Symbol, required: false },
        coorg: { type: DataType.Null, required: false },
      }),
    );
  });
});
