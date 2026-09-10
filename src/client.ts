import { PureComponent, ReactNode } from 'react';
import { mdToReactClient, MdToReactClient, RenderSourceOptions } from './md-to-react-client';

export { mdToReactClient, MdToReactClient };

type MarkdownProps = {
  markdown: string;
  onRenderToken?: RenderSourceOptions['tokenRenderer'];
} & Record<string, any>;

export class Markdown extends PureComponent<MarkdownProps> {
  render(): ReactNode {
    const { markdown, onRenderToken, ...props } = this.props;

    return mdToReactClient.renderSourceToNode(markdown, props, { tokenRenderer: onRenderToken });
  }
}

export function markdown(source: string, props?: Record<string, any>): ReactNode {
  return mdToReactClient.renderSourceToNode(source, props);
}
