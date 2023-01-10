import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const FUNCTION_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = (...args: any[]) => unknown;`);

export class TsFunctionBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "(...args: any[]) => unknown";
  }

  buildExport(type: ExportType): string {
    return FUNCTION_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Boolean"),
      export: this.parseExportType(type),
    });
  }
}
