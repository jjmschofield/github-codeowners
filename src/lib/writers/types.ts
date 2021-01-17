export enum OUTPUT_FORMAT {
  SIMPLE = 'simple',
  JSONL = 'jsonl',
  CSV = 'csv',
}

export function needsLineCounts(format: OUTPUT_FORMAT): boolean {
  switch (format) {
    case OUTPUT_FORMAT.SIMPLE: return false;
    case OUTPUT_FORMAT.CSV: return true;
    case OUTPUT_FORMAT.JSONL: return true;
    default:
      throw new Error(`unreachable: ${format}`);
  }
}
