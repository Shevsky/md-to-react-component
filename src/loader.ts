import type webpack from 'webpack';
import { MdToReact } from './md-to-react';

const mdToReact = new MdToReact();

export default function loader(this: webpack.loader.LoaderContext, source: string): string {
  return mdToReact.render(source);
}
