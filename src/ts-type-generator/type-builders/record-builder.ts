import { addIndentToLastLine } from "@TsTypeGenerator/add-indent-to-last-line";
import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { ExportType, TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const RECORD_TEMPLATE = new TemplateBuilder(`{
{{properties}}
}`);

const EXTENDED_RECORD_TEMPLATE = new TemplateBuilder(`{{extends}} & {
{{properties}}
}`);

const EXPORTED_RECORD_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = {
{{properties}}
};`);

const EXPORTED_EXTENDED_RECORD_TEMPLATE = new TemplateBuilder(`{{description}}
{{export}}type {{name}} = {{extends}} & {
{{properties}}
};`);

export class TsRecordBuilder extends TsBaseBuilder implements TsBuilder {
  private properties = new Map<string, TsBuilder>();
  private required = new Set<string>();

  constructor(private extend?: string) {
    super();
  }

  private getPropertiesTypes(indent: string): string[] {
    indent += "  ";
    const properties: string[] = [];

    for (const [name, prop] of this.properties) {
      const isRequired = this.required.has(name);
      const description = prop.getDescription(indent);
      const type = prop.build(indent);

      properties.push(
        `${description}${description ? "\n" : ""}${indent}${name}${
          isRequired ? "" : "?"
        }: ${type};`
      );
    }

    return properties;
  }

  addProperty(name: string, type: TsBuilder, required = true) {
    this.properties.set(name, type);
    if (required) {
      this.required.add(name);
    }
  }

  build(indent: string): string {
    const properties = this.getPropertiesTypes(indent);

    if (this.extend) {
      return addIndentToLastLine(
        EXTENDED_RECORD_TEMPLATE.build({
          extends: this.extend,
          properties: properties.join("\n"),
        }),
        indent
      );
    }

    return addIndentToLastLine(
      RECORD_TEMPLATE.build({
        properties: properties.join("\n"),
      }),
      indent
    );
  }

  buildExport(type: ExportType): string {
    const properties = this.getPropertiesTypes("");

    if (this.extend) {
      return EXPORTED_EXTENDED_RECORD_TEMPLATE.build({
        name: this.name ?? this.generateName("Record"),
        description: this.description,
        extends: this.extend,
        properties: properties.join("\n"),
        export: this.parseExportType(type),
      });
    }

    return EXPORTED_RECORD_TEMPLATE.build({
      name: this.name ?? this.generateName("Record"),
      description: this.description,
      properties: properties.join("\n"),
      export: this.parseExportType(type),
    });
  }
}
