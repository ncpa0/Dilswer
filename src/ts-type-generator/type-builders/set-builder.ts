import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const SET_TEMPLATE = new TemplateBuilder("Set<{{types}}>");

const EXPORT_SET_TEMPLATE = new TemplateBuilder(
  `{{description}}
{{export}}type {{name}} = Set<{{types}}>;`
);

export class TsSetBuilder extends TsBaseBuilder implements TsBuilder {
  private types: Set<TsBuilder> = new Set();

  private getTypes(indent: string): string[] {
    const types: string[] = [];

    for (const type of this.types) {
      types.push(type.build(indent));
    }

    return types;
  }

  setTypes(type: Iterable<TsBuilder>): void {
    this.types = new Set(type);
  }

  build(indent: string): string {
    const types = this.getTypes(indent);

    return SET_TEMPLATE.build({
      types: types.join(" | "),
    });
  }

  buildExport(type: ExportType): string {
    const types = this.getTypes("");

    return EXPORT_SET_TEMPLATE.build({
      types: types.join(" | "),
      description: this.description,
      name: this.name ?? this.generateName("Set"),
      export: this.parseExportType(type),
    });
  }
}
