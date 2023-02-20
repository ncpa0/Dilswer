import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const TUPLE_TEMPLATE = new TemplateBuilder("[{{types}}]");

const EXPORT_TUPLE_TEMPLATE = new TemplateBuilder(
  `{{description}}
{{export}}type {{name}} = [{{types}}];`
);

export class TsTupleBuilder extends TsBaseBuilder implements TsBuilder {
  private types: Array<TsBuilder> = [];

  private getTypes(indent: string): string[] {
    const types: string[] = [];

    for (const type of this.types) {
      types.push(type.build(indent));
    }

    return types;
  }

  /** Sets what types are allowed as the array elements. */
  setTypes(types: Array<TsBuilder>): void {
    this.types = types.slice();
  }

  build(indent: string): string {
    const types = this.getTypes(indent);

    return TUPLE_TEMPLATE.build({
      types: types.join(", "),
    });
  }

  buildExport(type: ExportType): string {
    const types = this.getTypes("");

    return EXPORT_TUPLE_TEMPLATE.build({
      types: types.join(", "),
      description: this.description,
      name: this.name ?? this.generateName("Tuple"),
      export: this.parseExportType(type),
    });
  }
}
