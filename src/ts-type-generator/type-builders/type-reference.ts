import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";

export class TsTypeReference implements TsBuilder {
  static resolveReference(reference: TsBuilder): TsBuilder {
    let b = reference;
    while (b instanceof TsTypeReference) {
      b = b.type;
    }
    return b;
  }

  isTitled = false;
  isAddedToScope = true;

  constructor(
    private fileScope: TsFileScope,
    private type: TsBuilder,
    public name: string
  ) {}

  getDescription(indent: string): string {
    return this.type.getDescription(indent);
  }

  setName(name: string): void {
    this.fileScope.changeReferenceName(this, name);
  }

  getName(): string | undefined {
    return this.name;
  }

  build(): string {
    return this.name;
  }

  buildExport(type: ExportType): string | undefined {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (type) {
      case "export":
      case "export/declare":
        return `export { ${this.name} };`;
    }

    return undefined;
  }
}

export class TsNamedReference {
  isTitled = false;
  isAddedToScope = true;

  constructor(private name: string) {}

  getDescription(indent: string): string {
    return "";
  }

  setName(name: string): void {
    throw new Error("Cannot set name of a named reference.");
    // no-op
  }

  getName(): string | undefined {
    return this.name;
  }

  build(): string {
    return this.name;
  }

  buildExport(type: ExportType): string | undefined {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (type) {
      case "export":
      case "export/declare":
        return `export { ${this.name} };`;
    }

    return undefined;
  }
}
