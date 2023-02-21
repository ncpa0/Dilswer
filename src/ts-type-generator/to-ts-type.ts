/* eslint-disable @typescript-eslint/restrict-plus-operands */
import type { InstanceOf, SimpleDataType, Tuple } from "@DataTypes/data-types";
import { BaseDataType, StringMatching } from "@DataTypes/data-types";
import type {
  AllOf,
  AnyDataType,
  ArrayOf,
  BasicDataType,
  Custom,
  DataTypeVisitor,
  Dict,
  Literal,
  OneOf,
  RecordOf,
  RecordOfVisitChild,
  SetOf,
} from "@DataTypes/types";
import { Enum, EnumMember } from "@DataTypes/types";
import { TsFileScope } from "@TsTypeGenerator/file-scope";
import { NameGenerator } from "@TsTypeGenerator/name-generator";
import type {
  ExternalTypeImport,
  TsParsingOptions,
} from "@TsTypeGenerator/parser-options";
import type { TsBuilder } from "@TsTypeGenerator/ts-builder";
import { TsArrayBuilder } from "@TsTypeGenerator/type-builders/array-builder";
import type { TsBaseBuilder } from "@TsTypeGenerator/type-builders/base-builder";
import { TsDictBuilder } from "@TsTypeGenerator/type-builders/dictionary-builder";
import { TsEnumBuilder } from "@TsTypeGenerator/type-builders/enum-builder";
import { TsEnumMemberBuilder } from "@TsTypeGenerator/type-builders/enum-member-builder";
import { TsExternalTypeReference } from "@TsTypeGenerator/type-builders/external-type-reference";
import { TsInstanceOfBuilder } from "@TsTypeGenerator/type-builders/instanceof-builder";
import { TsIntersectionBuilder } from "@TsTypeGenerator/type-builders/intersection-builder";
import { TsLiteralBuilder } from "@TsTypeGenerator/type-builders/literal-builder";
import { TsRecordBuilder } from "@TsTypeGenerator/type-builders/record-builder";
import { TsSetBuilder } from "@TsTypeGenerator/type-builders/set-builder";
import { TsBooleanBuilder } from "@TsTypeGenerator/type-builders/simple-types/boolean-builder";
import { TsFunctionBuilder } from "@TsTypeGenerator/type-builders/simple-types/function-builder";
import { TsNullBuilder } from "@TsTypeGenerator/type-builders/simple-types/null-builder";
import { TsNumberBuilder } from "@TsTypeGenerator/type-builders/simple-types/number-builder";
import { TsStringBuilder } from "@TsTypeGenerator/type-builders/simple-types/string-builder";
import { TsSymbolBuilder } from "@TsTypeGenerator/type-builders/simple-types/symbol-builder";
import { TsUndefinedBuilder } from "@TsTypeGenerator/type-builders/simple-types/undefined-builder";
import { TsUnknownBuilder } from "@TsTypeGenerator/type-builders/simple-types/unknown-builder";
import { TsStringMatchingBuilder } from "@TsTypeGenerator/type-builders/string-matching-builder";
import { TsTupleBuilder } from "@TsTypeGenerator/type-builders/tuple-builder";
import { TsUnionBuilder } from "@TsTypeGenerator/type-builders/union-builder";
import { capitalize } from "@Utilities/capitalize";

export class ExternalTypeImportProxy {
  private _resolvedName: string;
  private _importName: string;

  constructor(private ext: ExternalTypeImport) {
    if (ext.valueImport == true) {
      this._resolvedName = `typeof ${ext.typeName}`;
    } else {
      this._resolvedName = ext.typeName;
    }

    if (ext.originalName && ext.originalName !== ext.typeName) {
      this._importName = `${ext.originalName} as ${ext.typeName}`;
    } else {
      this._importName = ext.typeName;
    }
  }

  get path() {
    return this.ext.path;
  }

  get typeName() {
    return this._resolvedName;
  }

  get originalName() {
    return this.ext.originalName;
  }

  get valueImport() {
    return this.ext.valueImport;
  }

  get importName() {
    return this._importName;
  }
}

type R = TsBuilder;

class DataTypeTsGenerator implements DataTypeVisitor<R> {
  fileScope: TsFileScope;

  constructor(private options: TsParsingOptions) {
    this.fileScope = new TsFileScope(options);

    if (options.getExternalTypeImport) {
      this.getExternalTypeImport = (type) => {
        const ext = options.getExternalTypeImport!(type);
        if (ext) {
          return new ExternalTypeImportProxy(ext);
        }
      };
    }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (options.mode) {
      case "fully-expanded":
        this.addFileExportAndResolveBuilder = function (builder) {
          return this.fileScope.addTypeExport(builder);
        };
        break;
      case "named-expanded":
        this.addFileExportAndResolveBuilder = function (builder) {
          if (builder.isTitled) {
            return this.fileScope.addTypeExport(builder);
          }
          return builder;
        };
        break;
    }
  }

  private getExternalTypeImport = function (
    type: any
  ): ExternalTypeImportProxy | undefined {
    return undefined;
  };

  /**
   * Adds the given builder to the exports of the file scope if
   * the builder meets the criteria, and returns the given
   * builder or the Reference builder, if the builder was added
   * to the exports.
   */
  private addFileExportAndResolveBuilder = function (
    builder: TsBuilder & TsBaseBuilder
  ): TsBuilder {
    return builder;
    // default behavior for compact mode: do nothing
  };

  private tsAddMetadataToBuilder(builder: TsBaseBuilder, type: AnyDataType) {
    const metadata = BaseDataType.getOriginalMetadata(type);

    if (metadata.title) {
      builder.setIsTitled(true);
      builder.setName(metadata.title);
    }

    if (metadata.description) {
      builder.setDescription(metadata.description);
    }

    return metadata;
  }

  private parseFunctionType(type: SimpleDataType<"function">) {
    const externalImport = this.getExternalTypeImport(type);

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);
      const builder = new TsExternalTypeReference(externalImport.typeName);
      this.tsAddMetadataToBuilder(builder, type);

      return this.addFileExportAndResolveBuilder(builder);
    }

    const builder = new TsFunctionBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parsePrimitive(type: BasicDataType): R {
    let builder: TsBaseBuilder & TsBuilder;

    switch (type.simpleType) {
      case "string":
      case "stringinteger":
      case "stringnumeral":
        builder = new TsStringBuilder();
        break;
      case "number":
      case "integer":
        builder = new TsNumberBuilder();
        break;
      case "boolean":
        builder = new TsBooleanBuilder();
        break;
      case "symbol":
        builder = new TsSymbolBuilder();
        break;
      case "undefined":
        builder = new TsUndefinedBuilder();
        break;
      case "unknown":
        builder = new TsUnknownBuilder();
        break;
      case "null":
        builder = new TsNullBuilder();
        break;
      case "function":
        return this.parseFunctionType(type as any);
    }

    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseArrayOf(type: ArrayOf, children: Array<R> = []): R {
    const builder = new TsArrayBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseTuple(type: Tuple, children: Array<R> = []): R {
    const builder = new TsTupleBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseRecordOf(
    type: RecordOf,
    children: RecordOfVisitChild<R>[] = []
  ): R {
    const builder = new TsRecordBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    for (let i = 0; i < children?.length; i++) {
      const child = children[i];
      builder.addProperty(child.propertyName, child.child, child.required);
    }

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseDict(type: Dict, children: Array<R> = []): R {
    const builder = new TsDictBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseSetOf(type: SetOf, children: Array<R> = []): R {
    const builder = new TsSetBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseOneOf(type: OneOf, children: Array<R>): R {
    const builder = new TsUnionBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseAllOf(type: AllOf, children: Array<R>): R {
    const builder = new TsIntersectionBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseLiteral(type: Literal): R {
    const builder = new TsLiteralBuilder(type.literal);
    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseEnum(type: Enum): R {
    const metadata = Enum.getOriginalMetadata(type);

    let typeName = metadata.enumName;

    const externalImport = this.getExternalTypeImport(type);

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);

      typeName = externalImport.typeName;
    }

    if (!typeName) {
      throw new Error(
        "Enum name is not defined. To be able to parse an Enum DataType `enumName` must be defined."
      );
    }

    const builder = new TsEnumBuilder(typeName);
    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseEnumMember(type: EnumMember): R {
    const metadata = EnumMember.getOriginalMetadata(type);
    const externalImport = this.getExternalTypeImport(type);

    const typeName = metadata.enumName ?? externalImport?.typeName;

    if (!typeName || !metadata.memberName) {
      throw new Error(
        "Enum name, or enum member name is not defined. To be able to parse an EnumMember DataType into Typescript definition `memberName` and `enumName` must be defined."
      );
    }

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);
    }

    const builder = new TsEnumMemberBuilder(typeName, metadata.memberName);

    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseInstanceOf(type: InstanceOf): R {
    const constructor = type.instanceOf as new () => unknown;

    let typeName = constructor.name;

    const externalImport = this.getExternalTypeImport(type);

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);

      typeName = externalImport.typeName;
    }

    const builder = new TsInstanceOfBuilder(typeName);
    this.tsAddMetadataToBuilder(builder, type);

    if (builder.getName() === typeName) {
      builder.setName(`Alias${capitalize(builder.getName()!)}`);
    }

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseCustom(type: Custom): R {
    const externalImport = this.getExternalTypeImport(type);

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);

      const builder = new TsExternalTypeReference(externalImport.typeName);
      this.tsAddMetadataToBuilder(builder, type);

      return this.addFileExportAndResolveBuilder(builder);
    }

    const builder = new TsUnknownBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseStringMatching(type: StringMatching): R {
    const { tsPattern } = StringMatching.getOriginalMetadata(type);

    const builder = new TsStringMatchingBuilder(tsPattern);
    this.tsAddMetadataToBuilder(builder, type);

    return this.addFileExportAndResolveBuilder(builder);
  }

  visit(dataType: Exclude<AnyDataType, RecordOf>, children?: R[]): R;
  visit(dataType: RecordOf, children?: RecordOfVisitChild<R>[]): R;
  visit(type: AnyDataType, children?: (R | RecordOfVisitChild<R>)[]): R {
    switch (type.kind) {
      case "simple":
        return this.parsePrimitive(type);
      case "array":
        return this.parseArrayOf(type, children as R[]);
      case "tuple":
        return this.parseTuple(type, children as R[]);
      case "record":
        return this.parseRecordOf(type, children as RecordOfVisitChild<R>[]);
      case "dictionary":
        return this.parseDict(type, children as R[]);
      case "set":
        return this.parseSetOf(type, children as R[]);
      case "union":
        return this.parseOneOf(type, children as R[]);
      case "intersection":
        return this.parseAllOf(type, children as R[]);
      case "literal":
        return this.parseLiteral(type);
      case "enumUnion":
        return this.parseEnum(type);
      case "enumMember":
        return this.parseEnumMember(type);
      case "instanceOf":
        return this.parseInstanceOf(type);
      case "custom":
        return this.parseCustom(type);
      case "stringMatching":
        return this.parseStringMatching(type);
    }
  }
}

/**
 * Generates TypeScript type definition (as a string) from a
 * DataType.
 */
export const toTsType = (
  dataType: AnyDataType,
  options?: Partial<TsParsingOptions>
): string => {
  try {
    const opt: TsParsingOptions = {
      mode: options?.mode ?? "compact",
      exports: options?.exports ?? "main",
      declaration: options?.declaration ?? false,
      onDuplicateName: options?.onDuplicateName ?? "error",
      getExternalTypeImport: options?.getExternalTypeImport,
    };

    const generator = new DataTypeTsGenerator(opt);

    const rootBuilder = dataType._acceptVisitor(generator);

    generator.fileScope.addRootType(rootBuilder);
    return generator.fileScope.build();
  } finally {
    NameGenerator.clear();
  }
};
