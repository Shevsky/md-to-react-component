export class Tokenizer {
  private readonly usedTokens: Map<string, string> = new Map();

  createUniqueToken(value: string): string {
    if (this.usedTokens.has(value)) {
      return this.usedTokens.get(value)!;
    } else {
      const usedTokensValues = Array.from(this.usedTokens.values());

      let token = Tokenizer.createToken(value);

      if (usedTokensValues.includes(token)) {
        token += `_1`;

        let i = 1;
        while (usedTokensValues.includes(token)) {
          i++;
          token = token.replace(/_(\d+)$/, `_${String(i)}`);
        }

        this.usedTokens.set(value, token);

        return token;
      } else {
        this.usedTokens.set(value, token);

        return token;
      }
    }
  }

  static createToken(value: string): string {
    let token = value
      .trim()
      .toLowerCase()
      .replaceAll(/@/g, '')
      .replaceAll(/-+/g, '_')
      .replaceAll(/\s+/g, '_')
      .replaceAll(/[^a-z\d]/g, '_')
      .replaceAll(/_+/g, '_');

    if (!/^[a-z_]/.test(token)) {
      return `_${token}`;
    }

    return token;
  }
}
