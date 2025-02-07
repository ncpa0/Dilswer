type TemplateWildcards<T extends string> = T extends
  `${infer _}{{${infer W}}}${infer Rest}`
  ? TemplateWildcards<Rest> & { [K in W]: string }
  : {};

export class TemplateBuilder<T extends string> {
  constructor(private template: T) {}

  build(wildcards: TemplateWildcards<T>): string {
    let result: string = this.template;

    for (const [key, value] of Object.entries(wildcards)) {
      result = result.replace(`{{${key}}}`, value as string);
    }

    return result;
  }
}
