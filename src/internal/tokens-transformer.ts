import type { marked } from 'marked';
import { FullSchema, Renderer, Tokens } from './../types';
import { ImportsCollector } from './imports-collector';
import { AnyElementDeclaration } from './types';

export class TokensTransformer {
  constructor(private schema: FullSchema, private readonly importsCollector: ImportsCollector) {
    this.transformTokenToElement = this.transformTokenToElement.bind(this);
    this.transformRendererToElement = this.transformRendererToElement.bind(this);
  }

  transformTokenToElement(token: marked.Token): AnyElementDeclaration {
    switch (token.type) {
      case 'space':
      case 'hr': {
        return this.transformRendererToElement(this.schema.tokens[token.type].renderer, null);
      }
      case 'code': {
        if (token.lang === 'json') {
          try {
            const json = JSON.parse(token.text);
            this.retrieveTemporarySchema(json);

            return null;
          } catch (e) {
            return null;
          }
        } else {
          return null;
        }
      }
      case 'codespan': {
        if (token.text.startsWith('props.')) {
          return () => token.text;
        } else {
          return null;
        }
      }
      case 'heading': {
        return this.transformRendererToElement(
          this.schema.tokens[`h${token.depth}` as keyof Tokens].renderer,
          null,
          ...this.retrieveElementsOrTextFromToken(token)
        );
      }
      case 'paragraph':
      case 'strong':
      case 'em':
      case 'text': {
        return this.transformRendererToElement(
          this.schema.tokens[token.type].renderer,
          null,
          ...this.retrieveElementsOrTextFromToken(token)
        );
      }
      case 'link': {
        return this.transformRendererToElement(
          this.schema.tokens.link.renderer,
          { href: token.href },
          ...this.retrieveElementsOrTextFromToken(token, this.schema.tokens.link.wrapper)
        );
      }
      case 'list': {
        const renderer = token.ordered ? this.schema.tokens.ol.renderer : this.schema.tokens.ul.renderer;

        return this.transformRendererToElement(renderer, null, ...token.items.map(this.transformTokenToElement));
      }
      case 'list_item': {
        return this.transformRendererToElement(
          this.schema.tokens.li.renderer,
          null,
          ...this.retrieveElementsOrTextFromToken(token, this.schema.tokens.li.wrapper)
        );
      }
      default: {
        return null;
      }
    }
  }

  transformRendererToElement(
    renderer: Renderer,
    props: Record<string, any> | null,
    ...childs: Array<AnyElementDeclaration>
  ): AnyElementDeclaration {
    switch (renderer.type) {
      case 'component': {
        const usedExport = this.importsCollector.retrieveExportFromImports(
          renderer.from,
          renderer.usedExport ?? 'default'
        );

        return { name: usedExport, props: { ...props, ...renderer.props }, childs };
      }
      case 'tag': {
        return { name: `"${renderer.name}"`, props: { ...props, ...renderer.props }, childs };
      }
      case 'fragment': {
        const usedExport = this.importsCollector.retrieveExportFromImports('react', 'Fragment');

        return { name: usedExport, props: null, childs };
      }
      case 'string': {
        switch (childs.length) {
          case 0: {
            return null;
          }
          case 1: {
            return childs[0];
          }
          default: {
            return this.transformRendererToElement({ type: 'fragment' }, null, ...childs);
          }
        }
      }
      case 'null': {
        return 'null';
      }
    }
  }

  private retrieveElementsOrTextFromToken(token: marked.Token, wrapper?: Renderer): Array<AnyElementDeclaration> {
    const anyToken = token as any;

    if (anyToken.tokens?.length) {
      if (wrapper) {
        return [this.transformRendererToElement(wrapper, null, ...anyToken.tokens.map(this.transformTokenToElement))];
      } else {
        return [...anyToken.tokens.map(this.transformTokenToElement)];
      }
    }

    if (anyToken.text) {
      return [anyToken.text];
    }

    return [];
  }

  private retrieveTemporarySchema(maybeSchema: object): void {
    return void 0;
  }
}
