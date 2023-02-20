import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const ARRAY_TEMPLATE = new TemplateBuilder("Array<{{types}}>");

const EXPORT_ARRAY_TEMPLATE = new TemplateBuilder(
  `{{description}}
{{export}}type {{name}} = Array<{{types}}>;`
);

export class TsArrayBuilder extends TsBaseBuilder implements TsBuilder {
  private types: Set<TsBuilder> = new Set();

  private getTypes(indent: string): string[] {
    const types: string[] = [];

    for (const type of this.types) {
      types.push(type.build(indent));
    }

    return types;
  }

  /** Sets what types are allowed as the array elements. */
  setTypes(types: Iterable<TsBuilder>): void {
    this.types = new Set(types);
  }

  build(indent: string): string {
    const types = this.getTypes(indent);

    return ARRAY_TEMPLATE.build({
      types: types.join(" | "),
    });
  }

  buildExport(type: ExportType): string {
    const types = this.getTypes("");

    return EXPORT_ARRAY_TEMPLATE.build({
      types: types.join(" | "),
      description: this.description,
      name: this.name ?? this.generateName("Array"),
      export: this.parseExportType(type),
    });
  }
}
