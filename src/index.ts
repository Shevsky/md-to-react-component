import { cosmiconfigSync } from 'cosmiconfig';
import { marked } from 'marked';
import { ElementRenderer } from './internal/element-renderer';
import { ImportsCollector } from './internal/imports-collector';
import { TokensTransformer } from './internal/tokens-transformer';
import { FullSchema, Schema } from './types';

const cosmiconfig = cosmiconfigSync('mdtoreact');

export * from './types';

const defaultSchema: FullSchema = {
  tokens: {
    root: { renderer: { type: 'fragment' } },
    space: { renderer: { type: 'tag', name: 'br' } },
    hr: { renderer: { type: 'tag', name: 'hr' } },
    h1: { renderer: { type: 'tag', name: 'h1' } },
    h2: { renderer: { type: 'tag', name: 'h2' } },
    h3: { renderer: { type: 'tag', name: 'h3' } },
    h4: { renderer: { type: 'tag', name: 'h4' } },
    h5: { renderer: { type: 'tag', name: 'h5' } },
    h6: { renderer: { type: 'tag', name: 'h6' } },
    paragraph: { renderer: { type: 'tag', name: 'p' } },
    strong: { renderer: { type: 'tag', name: 'strong' } },
    em: { renderer: { type: 'tag', name: 'i' } },
    text: { renderer: { type: 'string' } },
    link: { renderer: { type: 'tag', name: 'a' } },
    ol: { renderer: { type: 'tag', name: 'ol' } },
    ul: { renderer: { type: 'tag', name: 'ul' } },
    li: { renderer: { type: 'tag', name: 'li' } }
  }
};

export class MdToReact {
  private schema: FullSchema;
  private importsCollector: ImportsCollector;
  private tokensTransformer: TokensTransformer;
  private elementRenderer: ElementRenderer;

  constructor(schema: Schema = {}) {
    const { config } = cosmiconfig.search() ?? { result: {} };

    this.schema = {
      tokens: {
        ...defaultSchema.tokens,
        ...config.tokens,
        ...schema.tokens
      }
    };

    this.importsCollector = new ImportsCollector();
    this.tokensTransformer = new TokensTransformer(this.schema, this.importsCollector);
    this.elementRenderer = new ElementRenderer(this.importsCollector);
  }

  render(source: string): string {
    const tokensList = marked.lexer(source);

    const root = this.tokensTransformer.transformRendererToElement(
      this.schema.tokens.root.renderer,
      null,
      ...tokensList.map(this.tokensTransformer.transformTokenToElement)
    );

    let output = this.importsCollector.renderImports();
    output += '\n';
    output += 'export default (props) => ';
    output += this.elementRenderer.renderElement(root);
    output += ';';

    return output;
  }
}
