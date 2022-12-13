import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const NUMBER_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = number;`);

export class TsNumberBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "number";
  }

  buildExport(): string {
    return NUMBER_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Number"),
    });
  }
}
