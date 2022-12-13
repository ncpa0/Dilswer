export class NameGenerator {
  private static names = new Map<string, number>();

  static generate(name: string): string {
    const count = this.names.get(name);

    if (count === undefined) {
      this.names.set(name, 1);
      return name + "1";
    }

    this.names.set(name, count + 1);

    return name + (count + 1).toString();
  }

  static clear() {
    this.names.clear();
  }
}
