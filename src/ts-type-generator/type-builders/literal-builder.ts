import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const LITERAL_EXPORT_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = {{type}};`);

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

  buildExport(): string {
    return LITERAL_EXPORT_TEMPLATE.build({
      description: this.description,
      name: this.name ?? this.generateName("String"),
      type: this.getType(),
    });
  }
}
