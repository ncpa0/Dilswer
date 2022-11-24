import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const STRING_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = string;`);

export class TsStringBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "string";
  }

  buildExport(): string {
    return STRING_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("String"),
    });
  }
}
