import { marked } from 'marked';
import { ComponentType, createElement, Fragment, ReactNode } from 'react';
import { FullSchema, Renderer, Tokens } from './types';

export class MdToReactClient {
  private props?: Record<string, any>;

  constructor(
    private readonly schema: FullSchema,
    private readonly externals: Record<string, Record<string, ComponentType>>
  ) {
    this.renderSourceToNode = this.renderSourceToNode.bind(this);
    this.tokenToNode = this.tokenToNode.bind(this);
    this.retrieveNodesOrTextFromToken = this.retrieveNodesOrTextFromToken.bind(this);
    this.rendererToNode = this.rendererToNode.bind(this);
  }

  renderSourceToNode(source: string, props?: Record<string, any>): ReactNode {
    this.props = props;

    const tokensList = marked.lexer(source);

    return this.rendererToNode(this.schema.tokens.root.renderer, null, ...tokensList.map(this.tokenToNode));
  }

  private tokenToNode(token: marked.Token): ReactNode {
    switch (token.type) {
      case 'space':
      case 'br':
      case 'hr': {
        return this.rendererToNode(this.schema.tokens[token.type].renderer, null);
      }
      case 'codespan': {
        if (token.text.startsWith('props.')) {
          const key = token.text.substring('props.'.length);
          if (!this.props || !(key in this.props)) {
            throw new Error(`Missing "${key}" prop`);
          }

          return this.props[key];
        } else {
          return null;
        }
      }
      case 'heading': {
        return this.rendererToNode(
          this.schema.tokens[`h${token.depth}` as keyof Tokens].renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token)
        );
      }
      case 'paragraph':
      case 'strong':
      case 'em':
      case 'text': {
        return this.rendererToNode(
          this.schema.tokens[token.type].renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token)
        );
      }
      case 'link': {
        return this.rendererToNode(
          this.schema.tokens.link.renderer,
          { href: token.href },
          ...this.retrieveNodesOrTextFromToken(token, this.schema.tokens.link.wrapper)
        );
      }
      case 'list': {
        const renderer = token.ordered ? this.schema.tokens.ol.renderer : this.schema.tokens.ul.renderer;

        return this.rendererToNode(renderer, null, ...token.items.map(this.tokenToNode));
      }
      case 'list_item': {
        return this.rendererToNode(
          this.schema.tokens.li.renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token, this.schema.tokens.li.wrapper)
        );
      }
      default: {
        return null;
      }
    }
  }

  private retrieveNodesOrTextFromToken(token: marked.Token, wrapper?: Renderer): Array<ReactNode> {
    const anyToken = token as any;

    if (anyToken.tokens?.length) {
      if (wrapper) {
        return [this.rendererToNode(wrapper, null, ...anyToken.tokens.map(this.tokenToNode))];
      } else {
        return [...anyToken.tokens.map(this.tokenToNode)];
      }
    }

    if (anyToken.text) {
      return [anyToken.text];
    }

    return [];
  }

  private rendererToNode(
    renderer: Renderer,
    props?: Record<string, any> | null,
    ...childs: Array<ReactNode>
  ): ReactNode {
    switch (renderer.type) {
      case 'component': {
        return createElement(
          this.externals[renderer.from][renderer.usedExport ?? 'default'],
          { ...props, ...renderer.props },
          ...childs
        );
      }
      case 'tag': {
        return createElement(renderer.name, { ...props, ...renderer.props }, ...childs);
      }
      case 'fragment': {
        return createElement(Fragment, null, ...childs);
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
            return createElement(Fragment, null, ...childs);
          }
        }
      }
      case 'null': {
        return null;
      }
    }
  }
}
