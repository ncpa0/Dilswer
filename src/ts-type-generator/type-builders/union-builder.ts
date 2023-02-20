import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const UNION_TEMPLATE = new TemplateBuilder("{{types}}");

const EXPORT_UNION_TEMPLATE = new TemplateBuilder(
  `{{description}}
{{export}}type {{name}} = {{types}};`
);

export class TsUnionBuilder extends TsBaseBuilder implements TsBuilder {
  private types = new Set<TsBuilder>();

  private getUnionTypes(indent: string): string[] {
    const types: string[] = [];

    for (const type of this.types) {
      types.push(type.build(indent));
    }

    return types;
  }

  /** Sets types that are part of the union. */
  setTypes(type: Iterable<TsBuilder>): void {
    this.types = new Set(type);
  }

  build(indent: string): string {
    const types = this.getUnionTypes(indent);

    return UNION_TEMPLATE.build({
      types: types.join(" | "),
    });
  }

  buildExport(type: ExportType): string {
    const types = this.getUnionTypes("");

    return EXPORT_UNION_TEMPLATE.build({
      types: types.join(" | "),
      description: this.description,
      name: this.name ?? this.generateName("Union"),
      export: this.parseExportType(type),
    });
  }
}
