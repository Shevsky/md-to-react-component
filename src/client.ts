import { PureComponent, ReactNode } from 'react';
import { mdToReactClient, MdToReactClient } from './md-to-react-client';

export { mdToReactClient, MdToReactClient };

type TMarkdownProps = { markdown: string } & Record<string, any>;

export class Markdown extends PureComponent<TMarkdownProps> {
  render(): ReactNode {
    const { markdown, ...props } = this.props;

    return mdToReactClient.renderSourceToNode(markdown, props);
  }
}

export function markdown(source: string, props?: Record<string, any>): ReactNode {
  return mdToReactClient.renderSourceToNode(source, props);
}
