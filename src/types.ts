export type ModuleType = 'es' | 'commonjs';

export type PropsDefinition = Record<string, any>;

export type ConditionalPropsDefinition = {
  default: PropsDefinition;
  conditional: Array<{
    when: Record<
      string,
      {
        matches?: string | Array<string>;
        is?: 'nullish';
      }
    >;
    then: PropsDefinition;
    otherwise: PropsDefinition;
  }>;
};

export type AnyPropsDefinition = PropsDefinition | ConditionalPropsDefinition;

export type Renderer =
  | {
      type: 'component';
      from: string;
      usedExport?: string;
      props?: AnyPropsDefinition;
    }
  | {
      type: 'tag';
      name: string;
      props?: AnyPropsDefinition;
    }
  | {
      type: 'fragment' | 'string' | 'null';
    };

export type Tokens = {
  root?: { renderer: Renderer };
  space?: { renderer: Renderer };
  hr?: { renderer: Renderer };
  br?: { renderer: Renderer };
  h1?: { renderer: Renderer };
  h2?: { renderer: Renderer };
  h3?: { renderer: Renderer };
  h4?: { renderer: Renderer };
  h5?: { renderer: Renderer };
  h6?: { renderer: Renderer };
  codespan?: { renderer: Renderer };
  paragraph?: { renderer: Renderer };
  strong?: { renderer: Renderer };
  em?: { renderer: Renderer };
  text?: { renderer: Renderer };
  link?: { renderer: Renderer; wrapper: Renderer };
  ol?: { renderer: Renderer };
  ul?: { renderer: Renderer };
  li?: { renderer: Renderer; wrapper: Renderer };
};

export type Schema = {
  tokens?: Tokens;
};

export type FullSchema = { tokens: Required<Tokens> };
