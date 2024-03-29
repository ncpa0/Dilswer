import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const ENUM_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = {{type}};`);

export class TsEnumBuilder extends TsBaseBuilder implements TsBuilder {
  constructor(private enumName: string) {
    super();
  }

  build(): string {
    return this.enumName;
  }

  buildExport(type: ExportType): string {
    return ENUM_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("Enum"),
      type: this.enumName,
      export: this.parseExportType(type),
    });
  }
}
