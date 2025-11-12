import { marked, Token } from 'marked';
import { ComponentType, createElement, Fragment, ReactNode } from 'react';
import { ExternalExportNotFoundError, ExternalNotFoundError, MissingPropertyError } from './errors';
import { decodeHtmlEntities } from './internal/decode-html-entities';
import { mergeComponentProps } from './internal/merge-component-props';
import { parseCodespanToken } from './internal/parse-codespan-token';
import { externals as renderedExternals, schema as renderedSchema } from './runtime/schema';
import { FullSchema, PropsDefinition, Renderer, Tokens } from './types';

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

  private tokenToNode(token: Token): ReactNode {
    switch (token.type) {
      case 'space': {
        const countSpaces = (token.raw.match(/\n/g) || []).length;

        return this.rendererToNode(this.schema.tokens.space.renderer, { countSpaces });
      }
      case 'br':
      case 'hr': {
        return this.rendererToNode(this.schema.tokens[token.type].renderer, null);
      }
      case 'codespan': {
        const parsed = parseCodespanToken(token.text);

        switch (parsed.type) {
          case 'property': {
            if (!this.props || !(parsed.key in this.props)) {
              throw new MissingPropertyError(parsed.key);
            }

            return this.props[parsed.key];
          }
          case 'text': {
            return this.rendererToNode(this.schema.tokens[token.type].renderer, null, parsed.text);
          }
          default: {
            return null;
          }
        }
      }
      case 'code': {
        return this.rendererToNode(
          this.schema.tokens.code.renderer,
          { language: token.lang, codeBlockStyle: token.codeBlockStyle },
          this.schema.tokens.code.wrapper
            ? this.rendererToNode(this.schema.tokens.code.wrapper, null, token.text)
            : token.text
        );
      }
      case 'heading': {
        return this.rendererToNode(
          this.schema.tokens[`h${token.depth}` as keyof Tokens].renderer,
          null,
          ...this.retrieveNodesOrTextFromToken(token)
        );
      }
      case 'paragraph':
      case 'blockquote':
      case 'strong':
      case 'em':
      case 'del':
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
          { task: !!token.task, checked: !!token.checked, loose: !!token.loose },
          ...this.retrieveNodesOrTextFromToken(token, this.schema.tokens.li.wrapper)
        );
      }
      default: {
        return null;
      }
    }
  }

  private retrieveNodesOrTextFromToken(token: Token, wrapper?: Renderer): Array<ReactNode> {
    const anyToken = token as any;

    if (anyToken.tokens?.length) {
      if (wrapper) {
        return [this.rendererToNode(wrapper, null, ...anyToken.tokens.map(this.tokenToNode))];
      } else {
        return [...anyToken.tokens.map(this.tokenToNode)];
      }
    }

    if (anyToken.text) {
      return [decodeHtmlEntities(anyToken.text)];
    }

    return [];
  }

  private rendererToNode(renderer: Renderer, props: PropsDefinition | null, ...childs: Array<ReactNode>): ReactNode {
    switch (renderer.type) {
      case 'component': {
        const lib = renderer.from;
        const usedExport = renderer.usedExport ?? 'default';

        const external = this.externals[lib];

        if (!external) {
          throw new ExternalNotFoundError(lib);
        }

        if (!external[usedExport]) {
          throw new ExternalExportNotFoundError(lib, usedExport);
        }

        return createElement(external[usedExport], mergeComponentProps(props, renderer.props), ...childs);
      }
      case 'tag': {
        return createElement(renderer.name, mergeComponentProps(props, renderer.props), ...childs);
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

export const mdToReactClient = new MdToReactClient(renderedSchema, renderedExternals);
