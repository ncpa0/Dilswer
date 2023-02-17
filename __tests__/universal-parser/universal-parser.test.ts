import {
  AnyDataType,
  DataType,
  DataTypeVisitor,
  parseWith,
  RecordOf,
  RecordOfVisitChild,
} from "../../src/index";

describe("parseWith", () => {
  it("should parse a type using the provided visitor interface", () => {
    type TestParsedFormat = {
      name: string;
      simpleType?: string;
      children: TestParsedFormat[] | RecordOfVisitChild<TestParsedFormat>[];
    };

    class TestVisitor implements DataTypeVisitor<TestParsedFormat> {
      visit(
        dataType: Exclude<AnyDataType, RecordOf>,
        children?: TestParsedFormat[]
      ): TestParsedFormat;
      visit(
        dataType: RecordOf,
        children?: RecordOfVisitChild<TestParsedFormat>[]
      ): TestParsedFormat;
      visit(dataType: AnyDataType, children: any[] = []): TestParsedFormat {
        return {
          name: dataType.kind,
          simpleType:
            dataType.kind === "simple" ? dataType.simpleType : undefined,
          children: children.map((c) =>
            c._isRecordOfVisitChild
              ? { ...c.child, propertyName: c.propertyName }
              : c
          ),
        };
      }
    }

    const parsed = parseWith(
      new TestVisitor(),
      DataType.RecordOf({
        foo: DataType.String,
        bar: DataType.Number,
        baz: DataType.RecordOf({
          qux: DataType.Boolean,
          quux: DataType.ArrayOf(DataType.String),
        }),
      })
    );

    expect(parsed).toEqual({
      name: "record",
      children: [
        {
          propertyName: "foo",
          name: "simple",
          simpleType: "string",
          children: [],
        },
        {
          propertyName: "bar",
          name: "simple",
          simpleType: "number",
          children: [],
        },
        {
          propertyName: "baz",
          name: "record",
          simpleType: undefined,
          children: [
            {
              propertyName: "qux",
              name: "simple",
              simpleType: "boolean",
              children: [],
            },
            {
              propertyName: "quux",
              name: "array",
              simpleType: undefined,
              children: [
                {
                  name: "simple",
                  simpleType: "string",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
