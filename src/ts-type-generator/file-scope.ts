import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { TsParsingOptions } from "@TsTypeGenerator/parser-options";
import type { ExternalTypeImportProxy } from "@TsTypeGenerator/to-ts-type";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { TsTypeReference } from "@TsTypeGenerator/type-builders/type-reference";

export class TsFileScope {
  private imports = new Map<string, Set<string>>();
  private typeDefinitions: Map<TsBuilder, string> = new Map();
  private exportedNames = new Set<string>();
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

  appendDef(builder: TsBuilder, name: string, declarationStatement: string) {
    if (this.options.exports === "none" || this.options.exports === "main") {
      declarationStatement = declarationStatement.replace(/^export /, "");
    }

    this.definedTypes.add(name);
    this.typeDefinitions.set(builder, declarationStatement);

    if (declarationStatement.match(/^\s*export/)) {
      this.exportedNames.add(name);
    }
  }

  changeReferenceName(ref: TsTypeReference, newName: string) {
    const currentName = ref.getName();

    if (currentName === newName) return;

    if (this.definedTypes.has(newName)) {
      throw new Error(`Duplicate type name: ${newName}`);
    }

    const referencedBuilder = TsTypeReference.resolveReference(ref);

    if (currentName) {
      this.definedTypes.delete(currentName);
      this.typeDefinitions.delete(referencedBuilder);
      this.exportedNames.delete(currentName);
    }

    referencedBuilder.setName(newName);
    ref.name = newName;

    const declarationStatement = referencedBuilder.buildExport(
      this.exportTypeFor(referencedBuilder)
    );

    if (declarationStatement) {
      this.appendDef(referencedBuilder, newName, declarationStatement);
    }
  }

  addTypeExport(builder: TsBuilder & TsBaseBuilder, forceName?: string) {
    let declarationStatement = builder.buildExport(this.exportTypeFor(builder));
    let name = forceName ?? builder.getName();

    if (!name) {
      throw new Error(
        "Type name is undefined after definition generation. Impossible situation."
      );
    }

    if (!forceName) {
      if (this.definedTypes.has(name)) {
        switch (this.options.onDuplicateName) {
          case "error":
            throw new Error(`Duplicate type name: ${name}`);
          case "rename": {
            name = NameGenerator.generate(name);
            builder.setName(name);
            // rebuild with the new name
            declarationStatement = builder.buildExport(
              this.exportTypeFor(builder)
            );
          }
        }
      }

      if (declarationStatement) {
        this.appendDef(builder, name, declarationStatement);
      }
    } else if (declarationStatement && !this.definedTypes.has(name)) {
      this.appendDef(builder, name, declarationStatement);
    }

    builder.isAddedToScope = true;

    return new TsTypeReference(this, builder, name);
  }

  addRootType(builder: TsBuilder) {
    const referencedBuilder = TsTypeReference.resolveReference(builder);

    if (!referencedBuilder.isAddedToScope) {
      this.addTypeExport(referencedBuilder as any);
    }

    const exportType = this.exportTypeFor(builder, true);
    const def = builder.buildExport(exportType);

    const name = builder.getName();

    if (name && this.exportedNames.has(name)) {
      return;
    }

    if (def) {
      this.typeDefinitions.set(builder, def);
    } else {
      if (name) {
        // eslint-disable-next-line
        switch (exportType) {
          case "export":
          case "export/declare":
            this.typeDefinitions.set(builder, `export type { ${name} };`);
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
