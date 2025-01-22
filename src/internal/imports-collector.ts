import { Tokenizer } from './../internal/tokenizer';
import { ModuleType } from './../types';

type ImportDeclaration = {
  usedExports?: Map<string, string>;
  defaultExportAlias?: string;
};

export class ImportsCollector {
  private defaultExportAliasCounter = 0;
  private readonly imports: Map<string, ImportDeclaration> = new Map();

  resetImports(): void {
    this.imports.clear();
  }

  renderImportsToOutput(module: ModuleType = 'es'): string {
    const tokenizer = new Tokenizer();

    return Array.from(this.imports.entries())
      .map(([from, declaration]: [string, ImportDeclaration]) => {
        switch (module) {
          case 'commonjs': {
            const requiredVariableToken = tokenizer.createUniqueToken(from);

            let output = `var ${requiredVariableToken} = require("${from}");`;

            if (declaration.defaultExportAlias) {
              output += `var ${declaration.defaultExportAlias} = ${requiredVariableToken}.default;`;
            }

            if (declaration.usedExports?.size) {
              Array.from(declaration.usedExports.entries()).forEach(([usedExport, alias]: [string, string]) => {
                output += `var ${alias} = ${requiredVariableToken}.${usedExport};`;
              });
            }

            return output;
          }
          case 'es': {
            let output = 'import ';

            if (declaration.defaultExportAlias) {
              output += declaration.defaultExportAlias;

              if (declaration.usedExports?.size) {
                output += ',';
              }
            }

            if (declaration.usedExports?.size) {
              output += '{';
              output += Array.from(declaration.usedExports.entries())
                .map(([usedExport, alias]: [string, string]) =>
                  usedExport === alias ? usedExport : `${usedExport} as ${alias}`
                )
                .join(',');
              output += '}';
            }

            output += ` from "${from}";`;

            return output;
          }
          default: {
            return '';
          }
        }
      })
      .join('\n');
  }

  retrieveExportFromImports(from: string, usedExport: string, alias?: string): string {
    let declaration = this.imports.get(from);
    if (!declaration) {
      declaration = {};
      this.imports.set(from, declaration);
    }

    if (usedExport === 'default') {
      let defaultExportAlias = declaration.defaultExportAlias;
      if (!defaultExportAlias) {
        defaultExportAlias = alias ?? `d${++this.defaultExportAliasCounter}`;
        declaration.defaultExportAlias = defaultExportAlias;
      }

      return defaultExportAlias;
    }

    let usedExports = declaration.usedExports;
    if (!usedExports) {
      usedExports = new Map();
      declaration.usedExports = usedExports;
    }

    let usedAlias = usedExports.get(usedExport);
    if (!usedAlias) {
      usedAlias = alias ?? usedExport;
      usedExports.set(usedExport, usedAlias);
    }

    return usedAlias;
  }
}
