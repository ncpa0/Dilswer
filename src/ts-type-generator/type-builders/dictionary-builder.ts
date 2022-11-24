import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const DICT_TEMPLATE = new TemplateBuilder("Record<string | number, {{type}}>");

const EXPORTED_DICT_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = Record<string | number, {{type}}>`);

export class TsDictBuilder extends TsBaseBuilder implements TsBuilder {
  private types: Set<TsBuilder> = new Set();

  constructor() {
    super();
  }

  private getTypes(indent: string): string[] {
    const types: string[] = [];

    for (const type of this.types) {
      types.push(type.build(indent));
    }

    return types;
  }

  addType(type: TsBuilder): void {
    this.types.add(type);
  }

  build(indent: string): string {
    const types = this.getTypes(indent);

    return DICT_TEMPLATE.build({
      type: types.join(" | "),
    });
  }

  buildExport(): string {
    const types = this.getTypes("");

    return EXPORTED_DICT_TEMPLATE.build({
      name: this.name ?? this.generateName("Dict"),
      description: this.description,
      type: types.join(" | "),
    });
  }
}
