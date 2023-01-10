import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const EXTERNAL_TYPE_REF_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{alias}} = {{refName}};`);

export class TsExternalTypeReference
  extends TsBaseBuilder
  implements TsBuilder
{
  constructor(private referenceName: string) {
    super();
  }

  build(): string {
    return this.referenceName;
  }

  buildExport(type: ExportType): string {
    return EXTERNAL_TYPE_REF_EXPORT_TEMPLATE.build({
      description: this.getDescription(""),
      export: this.parseExportType(type),
      alias: this.getName() ?? this.generateName("ExternalType"),
      refName: this.referenceName,
    });
  }
}
