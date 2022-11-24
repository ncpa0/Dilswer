import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const UNKNOWN_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = unknown;`);

export class TsUnknownBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  buildExport(): string {
    return UNKNOWN_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Unknown"),
    });
  }

  build(): string {
    return "unknown";
  }
}
