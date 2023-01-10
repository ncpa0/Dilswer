import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type { ExportType } from "@TsTypeGenerator/ts-builder";

export class TsBaseBuilder {
  protected description = "";
  protected name?: string;

  isTitled = false;
  isAddedToScope = false;

  hasName(): boolean {
    return this.name !== undefined;
  }

  generateName(nameFor: string): string {
    this.name = this.name ?? NameGenerator.generate(nameFor);
    return this.name;
  }

  setDescription(description: string) {
    this.description = `/**
 * ${description.split("\n").join("\n * ")}
 */`;
  }

  getDescription(indent: string): string {
    if (!this.description) {
      return "";
    }
    return indent + this.description.split("\n").join(`\n${indent}`);
  }

  setName(name: string) {
    this.name = name.replace(/\s+/g, "");
  }

  getName(): string | undefined {
    return this.name;
  }

  setIsTitled(isTitled: boolean) {
    this.isTitled = isTitled;
  }

  parseExportType(type: ExportType): string {
    switch (type) {
      case "export":
        return "export ";
      case "declare":
        return "declare ";
      case "export/declare":
        return "export declare ";
      default:
        return "";
    }
  }
}
