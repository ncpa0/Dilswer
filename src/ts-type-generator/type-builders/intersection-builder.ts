import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const INTERSECTION_TEMPLATE = new TemplateBuilder("{{types}}");

const EXPORT_INTERSECTION_TEMPLATE = new TemplateBuilder(
  `{{description}}
{{export}}type {{name}} = {{types}};`,
);

export class TsIntersectionBuilder extends TsBaseBuilder implements TsBuilder {
  private types = new Set<TsBuilder>();

  private getIntersectedTypes(indent: string): string[] {
    const types: string[] = [];

    for (const type of this.types) {
      types.push(type.build(indent));
    }

    return types;
  }

  /** Sets types that are part of the intersection. */
  setTypes(type: Iterable<TsBuilder>): void {
    this.types = new Set(type);
  }

  build(indent: string): string {
    const types = this.getIntersectedTypes(indent);

    return INTERSECTION_TEMPLATE.build({
      types: types.join(" & "),
    });
  }

  buildExport(type: ExportType): string {
    const types = this.getIntersectedTypes("");

    return EXPORT_INTERSECTION_TEMPLATE.build({
      types: types.join(" & "),
      description: this.description,
      name: this.name ?? this.generateName("Intersection"),
      export: this.parseExportType(type),
    });
  }
}
