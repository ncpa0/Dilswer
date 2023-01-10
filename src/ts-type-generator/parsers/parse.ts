import type { InstanceOf, SimpleDataType } from "@DataTypes/data-types";
import type { AnyDataType, Custom, Enum } from "@DataTypes/types";
import type { TsFileScope } from "@TsTypeGenerator/file-scope";
import { tsParseAllOf } from "@TsTypeGenerator/parsers/parse-all-of";
import { tsParseArray } from "@TsTypeGenerator/parsers/parse-array";
import { tsParseCustom } from "@TsTypeGenerator/parsers/parse-custom";
import { tsParseDict } from "@TsTypeGenerator/parsers/parse-dict";
import { tsParseEnum } from "@TsTypeGenerator/parsers/parse-enum";
import { tsParseEnumMember } from "@TsTypeGenerator/parsers/parse-enum-member";
import { tsParseInstanceOf } from "@TsTypeGenerator/parsers/parse-instance-of";
import { tsParseLiteralType } from "@TsTypeGenerator/parsers/parse-literal";
import { tsParseOneOf } from "@TsTypeGenerator/parsers/parse-one-of";
import { tsParseRecord } from "@TsTypeGenerator/parsers/parse-record";
import { tsParseSet } from "@TsTypeGenerator/parsers/parse-set";
import { tsParseSimpleType } from "@TsTypeGenerator/parsers/parse-simple-type";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";

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
    type: Enum | InstanceOf | Custom | SimpleDataType<"function">
  ) => { typeName: string; path: string } | undefined;
};

export const tsParseDataType = (
  type: AnyDataType,
  fileScope: TsFileScope,
  options: TsParsingOptions
): TsBuilder => {
  switch (type.kind) {
    case "array":
      return tsParseArray(type, fileScope, options);
    case "dictionary":
      return tsParseDict(type, fileScope, options);
    case "intersection":
      return tsParseAllOf(type as any, fileScope, options);
    case "record":
      return tsParseRecord(type, fileScope, options);
    case "set":
      return tsParseSet(type, fileScope, options);
    case "simple":
      return tsParseSimpleType(type, fileScope, options);
    case "union":
      return tsParseOneOf(type as any, fileScope, options);
    case "literal":
      return tsParseLiteralType(type);
    case "custom":
      return tsParseCustom(type, fileScope, options);
    case "enumMember":
      return tsParseEnumMember(type);
    case "enumUnion":
      return tsParseEnum(type, fileScope, options);
    case "instanceOf":
      return tsParseInstanceOf(type, fileScope, options);
  }
};
