import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { TsParsingOptions } from "@TsTypeGenerator/parser-options";
import type { ExternalTypeImportProxy } from "@TsTypeGenerator/to-ts-type";
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

  addTypeImport(ext: ExternalTypeImportProxy) {
    if (ext.path) {
      let imports = this.imports.get(ext.path);

      if (!imports) {
        imports = new Set();
        this.imports.set(ext.path, imports);
      }

      imports.add(ext.importName);
    }
  }

  appendDef(builder: TsBuilder, name: string, code: string) {
    if (this.options.exports === "none" || this.options.exports === "main") {
      code = code.replace(/^export /, "");
    }

    this.definedTypes.add(name);
    this.typeDefinitions.set(builder, code);
  }

  addTypeExport(builder: TsBuilder & TsBaseBuilder) {
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

    if (def) {
      this.appendDef(builder, name, def);
    }

    builder.isAddedToScope = true;

    return new TsTypeReference(builder, name);
  }

  addRootType(builder: TsBuilder) {
    builder = TsTypeReference.resolveReference(builder);
    const exportType = this.exportTypeFor(builder, true);
    const def = builder.buildExport(exportType);

    if (def) {
      this.typeDefinitions.set(builder, def);
    } else {
      const name = builder.getName();
      if (name) {
        // eslint-disable-next-line
        switch (exportType) {
          case "export":
            this.typeDefinitions.set(builder, `export { ${name} };`);
            break;
          case "export/declare":
            this.typeDefinitions.set(builder, `export declare { ${name} };`);
            break;
        }
      }
    }
  }

  build(): string {
    let imports = "";

    for (const [from, types] of this.imports) {
      const typesList = Array.from(types).join(", ");

      imports += `import type { ${typesList} } from "${from}";\n`;
    }

    const content = [...this.typeDefinitions.values()].join("\n\n");

    return (imports + content).trim() + "\n";
  }
}
