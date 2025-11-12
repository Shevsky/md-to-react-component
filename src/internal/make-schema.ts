import { cosmiconfigSync } from 'cosmiconfig';
import { FullSchema, Schema } from './../types';

const cosmiconfig = cosmiconfigSync('mdtoreact');

const defaultSchema: FullSchema = {
  tokens: {
    root: { renderer: { type: 'fragment' } },
    space: { renderer: { type: 'tag', name: 'br' } },
    hr: { renderer: { type: 'tag', name: 'hr' } },
    br: { renderer: { type: 'tag', name: 'br' } },
    h1: { renderer: { type: 'tag', name: 'h1' } },
    h2: { renderer: { type: 'tag', name: 'h2' } },
    h3: { renderer: { type: 'tag', name: 'h3' } },
    h4: { renderer: { type: 'tag', name: 'h4' } },
    h5: { renderer: { type: 'tag', name: 'h5' } },
    h6: { renderer: { type: 'tag', name: 'h6' } },
    codespan: { renderer: { type: 'tag', name: 'code' } },
    code: { renderer: { type: 'tag', name: 'code' }, wrapper: { type: 'tag', name: 'pre' } },
    paragraph: { renderer: { type: 'tag', name: 'p' } },
    blockquote: { renderer: { type: 'tag', name: 'blockquote' } },
    strong: { renderer: { type: 'tag', name: 'strong' } },
    em: { renderer: { type: 'tag', name: 'i' } },
    del: { renderer: { type: 'tag', name: 's' } },
    text: { renderer: { type: 'string' } },
    link: { renderer: { type: 'tag', name: 'a' }, wrapper: null! },
    ol: { renderer: { type: 'tag', name: 'ol' } },
    ul: { renderer: { type: 'tag', name: 'ul' } },
    li: { renderer: { type: 'tag', name: 'li' }, wrapper: null! }
  }
};

export function makeSchema(schema: Schema): FullSchema {
  const { config } = cosmiconfig.search() ?? { config: {} };

  return {
    tokens: {
      ...defaultSchema.tokens,
      ...config.tokens,
      ...schema.tokens
    }
  };
}
