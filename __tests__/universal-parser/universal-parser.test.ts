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
        children?: TestParsedFormat[],
      ): TestParsedFormat;
      visit(
        dataType: RecordOf,
        children?: RecordOfVisitChild<TestParsedFormat>[],
      ): TestParsedFormat;
      visit(dataType: AnyDataType, children: any[] = []): TestParsedFormat {
        return {
          name: dataType.kind,
          simpleType: dataType.kind === "simple"
            ? dataType.simpleType
            : undefined,
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
      }),
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

  it("readme example test", () => {
    type Node = {
      typeName: string;
      children?: Node[] | Record<string, Node>;
    };

    const visitor = {
      visit(
        type: AnyDataType,
        children?: Node[] | RecordOfVisitChild<Node>[],
      ): Node {
        switch (type.kind) {
          case "simple":
            return { typeName: type.simpleType };
          case "record":
            return {
              typeName: "record",
              children: children
                && Object.fromEntries(
                  (children as RecordOfVisitChild<Node>[]).map(
                    ({ propertyName, child }) => [propertyName, child],
                  ),
                ),
            };
          default:
            return { typeName: type.kind, children: children as Node[] };
        }
      },
    };

    const type = DataType.RecordOf({
      foo: DataType.String,
      bar: DataType.ArrayOf(DataType.Number),
      baz: DataType.OneOf(DataType.String, DataType.Number),
    });

    const nodeTree = parseWith(visitor, type);

    expect(nodeTree).toMatchSnapshot();
  });
});
