const ReservedNames = new Set([
  "Array",
  "Set",
  "Map",
  "Promise",
  "Date",
  "RegExp",
  "Error",
  "Symbol",
  "Function",
  "Object",
  "Boolean",
  "Number",
  "String",
  "Record",
  "any",
  "unknown",
  "never",
  "void",
  "null",
  "undefined",
  "boolean",
  "number",
  "string",
  "bigint",
  "symbol",
]);

export class NameGenerator {
  private static names = new Map<string, number>();

  static generate(name: string): string {
    if (ReservedNames.has(name)) {
      name = name + "Type";
    }

    const count = this.names.get(name);

    if (count === undefined) {
      this.names.set(name, 1);
      return name;
    }

    this.names.set(name, count + 1);

    return name + count.toString();
  }

  static clear() {
    this.names.clear();
  }
}
