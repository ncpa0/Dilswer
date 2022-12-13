import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const BOOLEAN_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = boolean;`);

export class TsBooleanBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "boolean";
  }

  buildExport(): string {
    return BOOLEAN_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Boolean"),
    });
  }
}
