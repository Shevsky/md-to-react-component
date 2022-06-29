import { ImportsCollector } from './imports-collector';
import { AnyElementDeclaration } from './types';

export class ElementRenderer {
  private get factory(): string {
    return this.importsCollector.retrieveExportFromImports('react', 'createElement');
  }

  constructor(private readonly importsCollector: ImportsCollector) {
    this.renderElement = this.renderElement.bind(this);
  }

  renderElement(declaration: AnyElementDeclaration): string {
    if (declaration === null) {
      return 'null';
    }

    if (typeof declaration === 'string') {
      return JSON.stringify(declaration);
    }

    if (typeof declaration === 'function') {
      return declaration();
    }

    const args = [
      declaration.name,
      declaration.props && Object.entries(declaration.props).length ? JSON.stringify(declaration.props) : 'null',
      ...declaration.childs.map(this.renderElement).filter((output: string) => output !== 'null')
    ];

    if (args[1] === 'null' && args.length === 2) {
      args.splice(1, 1);
    }

    return `${this.factory}(${args.join(',')})`;
  }
}
