import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const LITERAL_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = {{type}};`);

export class TsLiteralBuilder extends TsBaseBuilder implements TsBuilder {
  constructor(private value: string | number | boolean) {
    super();
  }

  getType(): string {
    if (typeof this.value === "string") {
      return `"${this.value}"`;
    }
    return this.value.toString();
  }

  build(): string {
    return this.getType();
  }

  buildExport(type: ExportType): string {
    return LITERAL_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("String"),
      type: this.getType(),
      export: this.parseExportType(type),
    });
  }
}
