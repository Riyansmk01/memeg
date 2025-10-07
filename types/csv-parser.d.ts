declare module "csv-parser" {
  import { Transform } from "stream";

  interface CsvParserOptions {
    separator?: string;
    headers?: boolean | string[];
    skipLines?: number;
    maxRowBytes?: number;
    strict?: boolean;
  }

  function csvParser(options?: CsvParserOptions): Transform;

  export = csvParser;
}
