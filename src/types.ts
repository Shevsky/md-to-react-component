export type Renderer =
  | {
      type: 'component';
      from: string;
      usedExport?: string;
      props?: object;
    }
  | {
      type: 'tag';
      name: string;
      props?: object;
    }
  | {
      type: 'fragment' | 'string' | 'null';
    };

export type Tokens = {
  root?: { renderer: Renderer };
  space?: { renderer: Renderer };
  hr?: { renderer: Renderer };
  h1?: { renderer: Renderer };
  h2?: { renderer: Renderer };
  h3?: { renderer: Renderer };
  h4?: { renderer: Renderer };
  h5?: { renderer: Renderer };
  h6?: { renderer: Renderer };
  paragraph?: { renderer: Renderer };
  strong?: { renderer: Renderer };
  em?: { renderer: Renderer };
  text?: { renderer: Renderer };
  link?: { renderer: Renderer; wrapper?: Renderer };
  ol?: { renderer: Renderer };
  ul?: { renderer: Renderer };
  li?: { renderer: Renderer; wrapper?: Renderer };
};

export type Schema = {
  tokens?: Tokens;
};

/** @internal */
export type FullSchema = { tokens: Required<Tokens> };
