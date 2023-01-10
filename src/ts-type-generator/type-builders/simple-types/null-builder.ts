import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const NULL_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = null;`);

export class TsNullBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "null";
  }

  buildExport(type: ExportType): string {
    return NULL_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Null"),
      export: this.parseExportType(type),
    });
  }
}
