import Debug from 'debug';
import parser from 'solidity-parser-antlr';
import { SolidityExportVisitor } from './antlr/visitors/exportVisitor';

const error = Debug('sol-merger:error');

export interface ExportsAnalyzerResult {
  type: 'contract' | 'library' | 'interface' | 'struct' | 'enum' | 'comment';
  name: string;
  is: string;
  body: string;
}

export class ExportsAnalyzer {
  constructor(private contents: string) {}

  /**
   * Analyzes all the exports of the file (Contract, Interface, Library)
   *
   * Single export statement to process. Basicly it analizes next things:
   *
   * 1. Get the type of the export
   * 2. Get the body of the export
   * 3. Get inheritance of the specifier
   *
   */
  analyzeExports(): ExportsAnalyzerResult[] {
    try {
      const results: ExportsAnalyzerResult[] = [];
      const visitor = new SolidityExportVisitor(this.contents);
      visitor.visit((e) => {
        results.push({
          type: e.type,
          name: e.name,
          body: this.contents.substring(e.body.start, e.body.end + 1).trim(),
          is: e.is ? this.contents.substring(e.is.start, e.is.end + 1).trimLeft() : '',
        });
      });
      return results;
    } catch (e) {
      error(e);
      return [];
    }
  }
}
