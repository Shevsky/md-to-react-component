import type webpack from 'webpack';
import { mdToReactServer } from './defaults';

export default function mdToReactWebpackLoader(this: webpack.loader.LoaderContext, source: string): string {
  return mdToReactServer.renderSourceToOutput(source);
}
