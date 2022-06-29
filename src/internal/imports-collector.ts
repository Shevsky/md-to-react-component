import { ImportDeclaration } from './types';

export class ImportsCollector {
  private defaultExportAliasCounter = 0;
  private imports: Map<string, ImportDeclaration> = new Map([
    ['react', { defaultExportAlias: 'React', usedExports: new Map([['createElement', 'c']]) }]
  ]);

  renderImports(): string {
    return Array.from(this.imports.entries())
      .map(([from, declaration]: [string, ImportDeclaration]) => {
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
        defaultExportAlias = `d${++this.defaultExportAliasCounter}`;
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
