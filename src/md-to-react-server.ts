import { marked } from 'marked';
import { decodeHtmlEntities } from './internal/decode-html-entities';
import { parseCodespanToken } from './internal/parse-codespan-token';
import { ImportsCollector } from './internal/imports-collector';
import { makeSchema } from './internal/make-schema';
import { PropsCollector } from './internal/props-collector';
import { FullSchema, Renderer, Schema, Tokens } from './types';

export class MdToReactServer {
  private readonly schema: FullSchema;
  private readonly imports: ImportsCollector;
  private readonly props: PropsCollector;

  constructor(schema: Schema = {}) {
    this.schema = makeSchema(schema);
    this.imports = new ImportsCollector();
    this.props = new PropsCollector();

    this.renderSourceToOutput = this.renderSourceToOutput.bind(this);
    this.renderSchemaToOutput = this.renderSchemaToOutput.bind(this);
    this.tokenToNodeOutput = this.tokenToNodeOutput.bind(this);
    this.retrieveNodesOrTextFromToken = this.retrieveNodesOrTextFromToken.bind(this);
    this.rendererToNodeOutput = this.rendererToNodeOutput.bind(this);
    this.makeCreateElementOutput = this.makeCreateElementOutput.bind(this);
  }

  renderSourceToOutput(source: string): string {
    this.imports.resetImports();
    this.props.resetProps();

    this.imports.retrieveExportFromImports('react', 'default', 'React');

    const tokensList = marked.lexer(source);

    const root = this.rendererToNodeOutput(
      this.schema.tokens.root.renderer,
      null,
      ...tokensList.map(this.tokenToNodeOutput)
    );

    let output = this.imports.renderImportsToOutput();
    output += '\n';
    output += 'export default (props) => {\n';
    output += this.props.renderExpectedPropsToOutput();
    output += '\nreturn ';
    output += root;
    output += ';\n};';

    return output;
  }

  renderSchemaToOutput(): string {
    this.imports.resetImports();
    this.props.resetProps();

    const externals = {};
    Object.values(this.schema.tokens).forEach((token) => {
      Object.values(token).forEach((renderer: any) => {
        if (typeof renderer === 'object' && renderer && (renderer as Renderer).type === 'component') {
          const expectedExport = renderer.usedExport ?? 'default';
          const usedExport = this.imports.retrieveExportFromImports(renderer.from, expectedExport);

          if (!externals.hasOwnProperty(renderer.from)) {
            externals[renderer.from] = {};
          }

          if (!externals[renderer.from].hasOwnProperty(expectedExport)) {
            externals[renderer.from][expectedExport] = `[@${usedExport}]`;
          }
        }
      });
    });

    let output = this.imports.renderImportsToOutput();
    output += '\n';
    output += 'const externals = ';
    output += JSON.stringify(externals).replace(/"\[@(.*?)]"/g, '$1');
    output += ';\n';
    output += 'const schema = ';
    output += JSON.stringify(this.schema);
    output += ';\n';
    output += 'export { externals, schema };';

    return output;
  }

  private tokenToNodeOutput(token: marked.Token): string {
    switch (token.type) {
      case 'space':
      case 'br':
      case 'hr': {
        return this.rendererToNodeOutput(this.schema.tokens[token.type].renderer);
      }
      case 'codespan': {
        const parsed = parseCodespanToken(token.text);

        switch (parsed.type) {
          case 'property': {
            this.props.expectProp(parsed.key);

            return `props.${parsed.key}`;
          }
          case 'text': {
            return this.rendererToNodeOutput(this.schema.tokens[token.type].renderer, null, parsed.text);
          }
          default: {
            return 'null';
          }
        }
      }
      case 'heading': {
        return this.rendererToNodeOutput(
          this.schema.tokens[`h${token.depth}` as keyof Tokens].renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token)
        );
      }
      case 'paragraph':
      case 'strong':
      case 'em':
      case 'text': {
        return this.rendererToNodeOutput(
          this.schema.tokens[token.type].renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token)
        );
      }
      case 'link': {
        return this.rendererToNodeOutput(
          this.schema.tokens.link.renderer,
          { href: token.href },
          ...this.retrieveNodesOrTextFromToken(token, this.schema.tokens.link.wrapper)
        );
      }
      case 'list': {
        const renderer = token.ordered ? this.schema.tokens.ol.renderer : this.schema.tokens.ul.renderer;

        return this.rendererToNodeOutput(renderer, null, ...token.items.map(this.tokenToNodeOutput));
      }
      case 'list_item': {
        return this.rendererToNodeOutput(
          this.schema.tokens.li.renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token, this.schema.tokens.li.wrapper)
        );
      }
      default: {
        return 'null';
      }
    }
  }

  private retrieveNodesOrTextFromToken(token: marked.Token, wrapper?: Renderer): Array<string> {
    const anyToken = token as any;

    if (anyToken.tokens?.length) {
      if (wrapper) {
        return [this.rendererToNodeOutput(wrapper, null, ...anyToken.tokens.map(this.tokenToNodeOutput))];
      } else {
        return [...anyToken.tokens.map(this.tokenToNodeOutput)];
      }
    }

    if (anyToken.text) {
      return [JSON.stringify(decodeHtmlEntities(anyToken.text))];
    }

    return [];
  }

  private rendererToNodeOutput(
    renderer: Renderer,
    props?: Record<string, any> | null,
    ...childs: Array<string>
  ): string {
    switch (renderer.type) {
      case 'component': {
        return this.makeCreateElementOutput(
          this.imports.retrieveExportFromImports(renderer.from, renderer.usedExport ?? 'default'),
          { ...props, ...renderer.props },
          ...childs
        );
      }
      case 'tag': {
        return this.makeCreateElementOutput(JSON.stringify(renderer.name), { ...props, ...renderer.props }, ...childs);
      }
      case 'fragment': {
        return this.makeCreateElementOutput(
          this.imports.retrieveExportFromImports('react', 'Fragment'),
          null,
          ...childs
        );
      }
      case 'string': {
        switch (childs.length) {
          case 0: {
            return 'null';
          }
          case 1: {
            return childs[0];
          }
          default: {
            return this.rendererToNodeOutput({ type: 'fragment' }, null, ...childs);
          }
        }
      }
      case 'null': {
        return 'null';
      }
    }
  }

  private makeCreateElementOutput(name: string, props?: Record<string, any> | null, ...childs: Array<string>): string {
    const factory = this.imports.retrieveExportFromImports('react', 'createElement', 'c');

    const args = [
      name,
      props && Object.entries(props).length ? JSON.stringify(props) : 'null',
      ...childs.filter((output: string) => output !== 'null')
    ];

    if (args[1] === 'null' && args.length === 2) {
      args.splice(1, 1);
    }

    return `${factory}(${args.join(',')})`;
  }
}
