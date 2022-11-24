export interface TsBuilder {
  isAddedToScope: boolean;
  getDescription(indent: string): string;
  getName(): string | undefined;
  build(indent: string): string;
  buildExport(): string;
}
