import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { escapeCharacter } from "@Utilities/escape-character";

const STRING_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = {{type}};`);

export class TsStringMatchingBuilder extends TsBaseBuilder
  implements TsBuilder
{
  private tsPattern: string;
  constructor(tsPattern?: string) {
    super();

    this.tsPattern = tsPattern != null
      ? "'" + escapeCharacter(tsPattern, "'") + "'"
      : "string";
  }

  build(): string {
    return this.tsPattern;
  }

  buildExport(type: ExportType): string {
    return STRING_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("StringMatching"),
      export: this.parseExportType(type),
      type: this.tsPattern,
    });
  }
}
