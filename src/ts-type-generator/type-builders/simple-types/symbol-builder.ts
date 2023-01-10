import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const SYMBOL_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = symbol;`);

export class TsSymbolBuilder extends TsBaseBuilder implements TsBuilder {
  constructor() {
    super();
  }

  build(): string {
    return "symbol";
  }

  buildExport(type: ExportType): string {
    return SYMBOL_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Symbol"),
      export: this.parseExportType(type),
    });
  }
}
