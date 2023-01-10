import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const UNDEFINED_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = undefined;`);

export class TsUndefinedBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "undefined";
  }

  buildExport(type: ExportType): string {
    return UNDEFINED_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Undefined"),
      export: this.parseExportType(type),
    });
  }
}
