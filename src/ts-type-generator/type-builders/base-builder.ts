import { NameGenerator } from "@TsTypeGenerator/name-generator";

export class TsBaseBuilder {
  protected description = "";
  protected name?: string;

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
}
