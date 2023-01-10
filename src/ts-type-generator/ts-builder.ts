export type ExportType = "export" | "declare" | "export/declare" | null;

export interface TsBuilder {
  isTitled: boolean;
  isAddedToScope: boolean;
  getDescription(indent: string): string;
  getName(): string | undefined;
  build(indent: string): string;
  buildExport(type: ExportType): string;
}
