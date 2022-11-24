import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { TsTypeReference } from "@TsTypeGenerator/type-builders/type-reference";

export class TsFileScope {
  private typeDefinitions: Array<string> = [];
  private definedTypes = new Set<string>();

  constructor(private options: TsParsingOptions) {}

  addType(builder: TsBuilder & TsBaseBuilder) {
    let def = builder.buildExport();
    let name = builder.getName();

    if (!name) {
      throw new Error(
        "Type name is undefined after definition generation. Impossible situation."
      );
    }

    if (this.definedTypes.has(name)) {
      switch (this.options.onDuplicateName) {
        case "error":
          throw new Error(`Duplicate type name: ${name}`);
        case "rename": {
          name = NameGenerator.generate(name);
          builder.setName(name);
          def = builder.buildExport(); // rebuild with the new name
        }
      }
    }

    this.definedTypes.add(name);
    this.typeDefinitions.push(def);
    builder.isAddedToScope = true;

    return new TsTypeReference(builder, name);
  }

  addRootType(builder: TsBuilder) {
    if (!builder.isAddedToScope) {
      builder = TsTypeReference.resolveReference(builder);

      const def = builder.buildExport();

      this.typeDefinitions.push(def);
    }
  }

  build(): string {
    return this.typeDefinitions.join("\n\n");
  }
}
