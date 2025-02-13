/* eslint-disable @typescript-eslint/restrict-plus-operands */

import { BaseType } from "@DataTypes/data-types";
import { TypeKindNames } from "@DataTypes/type-kind-names";
import type {
  AnyDataType,
  BasicDataType,
  RecordVisitChild,
  TypeVisitor,
} from "@DataTypes/types";
import type { ArrayType } from "@DataTypes/types/array";
import type { CustomType } from "@DataTypes/types/custom";
import type { DictType } from "@DataTypes/types/dict";
import { EnumType } from "@DataTypes/types/enum";
import { EnumMemberType } from "@DataTypes/types/enum-member";
import type { FunctionType } from "@DataTypes/types/function";
import type { InstanceOfType } from "@DataTypes/types/instance";
import type { IntersectionType } from "@DataTypes/types/intersection";
import type { LiteralType } from "@DataTypes/types/literal";
import type { RecordType } from "@DataTypes/types/record";
import type {
  RecursiveType,
  RecursiveTypeReference,
} from "@DataTypes/types/recursive";
import type { SetType } from "@DataTypes/types/set";
import { StringMatchingType } from "@DataTypes/types/string-matching";
import type { TupleType } from "@DataTypes/types/tuple";
import type { UnionType } from "@DataTypes/types/union";
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
import { TsNamedReference } from "@TsTypeGenerator/type-builders/type-reference";
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

class DataTypeTsGenerator implements TypeVisitor<R> {
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
        this.addFileExportAndResolveBuilder = function(builder) {
          return this.fileScope.addTypeExport(builder);
        };
        break;
      case "named-expanded":
        this.addFileExportAndResolveBuilder = function(builder) {
          if (builder.isTitled) {
            return this.fileScope.addTypeExport(builder);
          }
          return builder;
        };
        break;
    }
  }

  private getExternalTypeImport = function(
    _: any,
  ): ExternalTypeImportProxy | undefined {
    return undefined;
  };

  /**
   * Adds the given builder to the exports of the file scope if
   * the builder meets the criteria, and returns the given
   * builder or the Reference builder, if the builder was added
   * to the exports.
   */
  private addFileExportAndResolveBuilder = function(
    builder: TsBuilder & TsBaseBuilder,
  ): TsBuilder {
    return builder;
    // default behavior for compact mode: do nothing
  };

  private tsAddMetadataToBuilder(builder: TsBaseBuilder, type: AnyDataType) {
    const metadata = BaseType.getOriginalMetadata(type);

    if (metadata.title) {
      builder.setIsTitled(true);
      builder.setName(metadata.title);
    }

    if (metadata.description) {
      builder.setDescription(metadata.description);
    }

    return metadata;
  }

  private parseFunctionType(type: FunctionType) {
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

  private parseArrayOf(type: ArrayType, children: Array<R> = []): R {
    const builder = new TsArrayBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseTuple(type: TupleType, children: Array<R> = []): R {
    const builder = new TsTupleBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseRecordOf(
    type: RecordType,
    children: RecordVisitChild<R>[] = [],
  ): R {
    const builder = new TsRecordBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    for (let i = 0; i < children?.length; i++) {
      const child = children[i];
      builder.addProperty(child.propertyName, child.child, child.required);
    }

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseDict(type: DictType, children: Array<R> = []): R {
    const builder = new TsDictBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseSetOf(type: SetType, children: Array<R> = []): R {
    const builder = new TsSetBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseOneOf(type: UnionType, children: Array<R>): R {
    const builder = new TsUnionBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseAllOf(type: IntersectionType, children: Array<R>): R {
    const builder = new TsIntersectionBuilder();
    this.tsAddMetadataToBuilder(builder, type);

    builder.setTypes(children);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseLiteral(type: LiteralType): R {
    const builder = new TsLiteralBuilder(type.literal);
    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseEnum(type: EnumType): R {
    const metadata = EnumType.getOriginalMetadata(type);

    let typeName = metadata.enumName;

    const externalImport = this.getExternalTypeImport(type);

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);

      typeName = externalImport.typeName;
    }

    if (!typeName) {
      throw new Error(
        "Enum name is not defined. To be able to parse an Enum DataType `enumName` must be defined.",
      );
    }

    const builder = new TsEnumBuilder(typeName);
    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseEnumMember(type: EnumMemberType): R {
    const metadata = EnumMemberType.getOriginalMetadata(type);
    const externalImport = this.getExternalTypeImport(type);

    const typeName = metadata.enumName ?? externalImport?.typeName;

    if (!typeName || !metadata.memberName) {
      throw new Error(
        "Enum name, or enum member name is not defined. To be able to parse an EnumMember DataType into Typescript definition `memberName` and `enumName` must be defined.",
      );
    }

    if (externalImport) {
      this.fileScope.addTypeImport(externalImport);
    }

    const builder = new TsEnumMemberBuilder(typeName, metadata.memberName);

    this.tsAddMetadataToBuilder(builder, type);

    return builder;
  }

  private parseInstanceOf(type: InstanceOfType): R {
    const constructor = type.instanceOf as new() => unknown;

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

  private parseCustom(type: CustomType): R {
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

  private parseStringMatching(type: StringMatchingType): R {
    const { tsPattern } = StringMatchingType.getOriginalMetadata(type);

    const builder = new TsStringMatchingBuilder(tsPattern);
    this.tsAddMetadataToBuilder(builder, type);

    return this.addFileExportAndResolveBuilder(builder);
  }

  private parseCircular(type: RecursiveType, children: R[]): R {
    const childType = type.type;
    const [actualType] = children;

    if (this.circulars.has(childType)) {
      const name = this.circulars.get(childType)!;
      actualType.setName(name);
      return this.fileScope.addTypeExport(actualType as any, name);
    }

    return actualType;
  }

  private parseCircularRef(type: RecursiveTypeReference): R {
    const referencedType = type._getReferencedType();

    const metadata = BaseType.getOriginalMetadata(referencedType);
    const title = metadata.title;

    if (this.circulars.has(referencedType)) {
      return new TsNamedReference(this.circulars.get(referencedType)!);
    }

    if (title) {
      const typeName = NameGenerator.generate(title);
      this.circulars.set(referencedType, typeName);
      return new TsNamedReference(typeName);
    }

    const typeName = NameGenerator.generate(
      TypeKindNames.get(referencedType.kind) ?? "Circular",
    );
    this.circulars.set(referencedType, typeName);
    return new TsNamedReference(typeName);
  }

  private circulars: Map<AnyDataType, string> = new Map();

  visit(dataType: Exclude<AnyDataType, RecordType>, children?: R[]): R;
  visit(dataType: RecordType, children?: RecordVisitChild<R>[]): R;
  visit(type: AnyDataType, children?: (R | RecordVisitChild<R>)[]): R {
    switch (type.kind) {
      case "simple":
        return this.parsePrimitive(type);
      case "array":
        return this.parseArrayOf(type, children as R[]);
      case "tuple":
        return this.parseTuple(type, children as R[]);
      case "record":
        return this.parseRecordOf(type, children as RecordVisitChild<R>[]);
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
      case "circular":
        return this.parseCircular(type, children as R[]);
      case "circularRef":
        return this.parseCircularRef(type);
    }
  }
}

/**
 * Generates TypeScript type definition (as a string) from a
 * DataType.
 */
export const toTsType = (
  dataType: AnyDataType,
  options?: Partial<TsParsingOptions>,
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
