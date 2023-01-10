import { TemplateBuilder } from "@TsTypeGenerator/template-builder";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";

const INSTANCEOF_TEMPLATE = new TemplateBuilder(
  "InstanceType<typeof {{type}}>"
);

const EXPORTED_INSTANCEOF_TEMPLATE = new TemplateBuilder(`{{description}}
export type {{name}} = InstanceType<typeof {{type}}>`);

export class TsInstanceOfBuilder extends TsBaseBuilder implements TsBuilder {
  constructor(private constructorName: string) {
    super();
  }

  build(): string {
    return INSTANCEOF_TEMPLATE.build({
      type: this.constructorName,
    });
  }

  buildExport(): string {
    return EXPORTED_INSTANCEOF_TEMPLATE.build({
      name: this.name ?? this.generateName("ClassInstance"),
      description: this.description,
      type: this.constructorName,
    });
  }
}
