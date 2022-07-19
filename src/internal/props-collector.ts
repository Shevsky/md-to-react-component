export class PropsCollector {
  private readonly props: Set<string> = new Set();

  renderExpectedPropsToOutput(): string {
    if (!this.props.size) {
      return '';
    }

    return Array.from(this.props.values())
      .map((prop: string): string => `if(!("${prop}" in props))throw new Error("Missing \\"${prop}\\" prop");`)
      .join('\n');
  }

  expectProp(key: string): void {
    this.props.add(key);
  }

  resetProps(): void {
    this.props.clear();
  }
}
