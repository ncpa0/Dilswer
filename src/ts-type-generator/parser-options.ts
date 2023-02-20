import type { InstanceOf, SimpleDataType } from "@DataTypes/data-types";
import type { Custom, Enum, EnumMember } from "@DataTypes/types";

export type TsParsingMode = "compact" | "fully-expanded" | "named-expanded";
export type TsParsingOptions = {
  /**
   * Defines how to parse the type.
   *
   * - `compact` - the type will be parsed into a single type
   *   definition
   * - `fully-expanded` - the type will be split into multiple type
   *   definitions, and the main DataType type definition will
   *   reference them.
   * - `named-expanded` - similar to `fully-expanded`, but only the
   *   types that have titles assigned will be split into
   *   separate type definitions.
   *
   * Default: `compact`
   */
  mode: TsParsingMode;
  /**
   * Defines how to export the generated types.
   *
   * - `main` - only the main DataType type will be exported
   * - `all` - all types generated will be exported
   * - `named` - only the types with titles will be exported
   * - `none` - nothing will be exported
   *
   * Default: `main`
   */
  exports: "main" | "named" | "all" | "none";
  /**
   * Defines whether to generate the type as a declaration or
   * not.
   *
   * The difference is that declaration will generate each type
   * definition with a `declare` keyword preceding it.
   *
   * Default: `false`
   */
  declaration: boolean;
  /**
   * Defines how to handle duplicate names.
   *
   * - `error` - will throw an error if a duplicate name is
   *   encountered
   * - `rename` - will rename the duplicate type
   *
   * Default: `error`
   */
  onDuplicateName: "error" | "rename";
  /**
   * Some DataType can reference enums or classes, in which case
   * it's sometimes impossible to generate a valid TypeScript
   * type for them. By default just the name of that class/enum
   * will be used, and if that name is not available in the
   * global scope, TS will resolve it to `any`. This option
   * allows to define a custom import path for such types.
   *
   * @example
   *   // foo.ts
   *   export class Foo {}
   *
   *   // data-type.ts
   *   import { Foo } from "./foo";
   *
   *   export const dt = DataType.RecordOf({
   *     foo: DataType.InstanceOf(Foo),
   *   });
   *
   *   // ts-type-generator.ts
   *   import { dt } from "./data-type";
   *   import { Foo } from "./foo";
   *
   *   const tsType = toTsType(dt, {
   *     getExternalTypeImport: (t) => {
   *       if (t.instanceOf === Foo) {
   *         return {
   *           typeName: "Foo",
   *           path: "./foo",
   *         };
   *       }
   *     },
   *   });
   *   // tsType:
   *   //"
   *   // import { Foo } from "./foo";
   *   //
   *   // export type Record1 = {
   *   //   foo: InstanceType<typeof Foo>;
   *   // }
   *   //"
   */
  getExternalTypeImport?: (
    type: Enum | EnumMember | InstanceOf | Custom | SimpleDataType<"function">
  ) => ExternalTypeImport | undefined;
};

export type ExternalTypeImport = {
  /**
   * Path to the file containing the external type. If the path
   * is not specified, the import statement will be omitted, so
   * for the generated declarations to be valid, you will have to
   * include that yourself or make the specified type available
   * in the global scope.
   */
  path?: string;
  /**
   * Name of the type as it is to be used within the generated
   * declarations.
   *
   * If original name is not provided it is also the name of the
   * imported type, otherwise this basically becomes the name
   * alias fo it.
   */
  typeName: string;
  /**
   * Name of the type that will be used in the generated import
   * statement.
   */
  originalName?: string;
  /**
   * Whether the imported name is a value or a type. If it is a
   * name it will be referenced with a `typeof` keyword.
   */
  valueImport?: boolean;
};
