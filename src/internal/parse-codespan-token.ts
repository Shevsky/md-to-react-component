type TParsedCodespanToken =
  | {
      type: 'property';
      key: string;
    }
  | {
      type: 'text';
      text: string;
    };

export function parseCodespanToken(text: string): TParsedCodespanToken {
  const [, key] = /^\{\{ props.(.+) }}$/.exec(text) ?? [];

  if (key) {
    return { type: 'property', key };
  } else {
    return { type: 'text', text };
  }
}
