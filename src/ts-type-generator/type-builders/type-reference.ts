import type { TsBuilder } from "@TsTypeGenerator/ts-builder";

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

  constructor(private type: TsBuilder, private name: string) {}

  getDescription(indent: string): string {
    return this.type.getDescription(indent);
  }

  getName(): string | undefined {
    return this.name;
  }

  build(): string {
    return this.name;
  }

  buildExport(): string {
    throw new Error("Method not implemented.");
  }
}
