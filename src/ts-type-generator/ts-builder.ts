export type ExportType = "export" | "declare" | "export/declare" | null;

export interface TsBuilder {
  isTitled: boolean;
  isAddedToScope: boolean;
  setName(name: string): void;
  getDescription(indent: string): string;
  getName(): string | undefined;
  build(indent: string): string;
  buildExport(type: ExportType): string | undefined;
}
