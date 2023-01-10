import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { TsParsingOptions } from "@TsTypeGenerator/parsers/parse";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { TsTypeReference } from "@TsTypeGenerator/type-builders/type-reference";

export class TsFileScope {
  private imports = new Map<string, Set<string>>();
  private typeDefinitions: Map<TsBuilder, string> = new Map();
  private definedTypes = new Set<string>();

  private exportTypeFor(builder: TsBuilder, isRoot = false): ExportType {
    if (this.options.declaration) {
      if (this.options.exports === "none") return "declare";

      if (this.options.exports === "main" && !isRoot) return "declare";

      if (this.options.exports === "named" && !builder.isTitled)
        return "declare";

      return "export/declare";
    }

    if (this.options.exports === "none") return null;

    if (this.options.exports === "main" && !isRoot) return null;

    if (this.options.exports === "named" && !builder.isTitled) return null;

    return "export";
  }

  constructor(private options: TsParsingOptions) {}

  addTypeImport(type: string, from: string) {
    let imports = this.imports.get(from);

    if (!imports) {
      imports = new Set();
      this.imports.set(from, imports);
    }

    imports.add(type);
  }

  appendDef(builder: TsBuilder, name: string, code: string) {
    if (this.options.exports === "none" || this.options.exports === "main") {
      code = code.replace(/^export /, "");
    }

    this.definedTypes.add(name);
    this.typeDefinitions.set(builder, code);
  }

  addType(builder: TsBuilder & TsBaseBuilder) {
    let def = builder.buildExport(this.exportTypeFor(builder));
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
          // rebuild with the new name
          def = builder.buildExport(this.exportTypeFor(builder));
        }
      }
    }

    this.appendDef(builder, name, def);
    builder.isAddedToScope = true;

    return new TsTypeReference(builder, name);
  }

  addRootType(builder: TsBuilder) {
    builder = TsTypeReference.resolveReference(builder);
    const def = builder.buildExport(this.exportTypeFor(builder, true));
    this.typeDefinitions.set(builder, def);

    // if (!builder.isAddedToScope) {
    // } else {
    // if (this.options.exports === "main") {
    //   const exportType = this.exportTypeFor(builder, true);
    //   switch (exportType) {
    //     case "export":
    //       this.typeDefinitions.set(`export { ${builder.getName()} };`);
    //       break;
    //     case "declare":
    //       this.typeDefinitions.push(
    //         `declare export { ${builder.getName()} };`
    //       );
    //       break;
    //     default:
    //       break;
    //   }
    // }
    // }
  }

  build(): string {
    let imports = "";

    for (const [from, types] of this.imports) {
      const typesList = Array.from(types).join(", ");

      imports += `import type { ${typesList} } from "${from}";\n`;
    }

    const content = [...this.typeDefinitions.values()].join("\n\n");

    return imports + "\n" + content;
  }
}
