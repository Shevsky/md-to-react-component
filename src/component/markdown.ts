import { PureComponent, ReactNode } from 'react';
import { MdToReactClient } from './../md-to-react-client';
import { externals, schema } from './schema';

type TMarkdownProps = {
  markdown: string;
} & Record<string, any>;

const mdToReactClient = new MdToReactClient(schema, externals);

export class Markdown extends PureComponent<TMarkdownProps> {
  render(): ReactNode {
    const { markdown, ...props } = this.props;

    return mdToReactClient.renderSourceToNode(markdown, props);
  }
}
