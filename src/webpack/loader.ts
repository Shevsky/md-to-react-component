import { mdToReactServer } from './defaults';

export default function mdToReactWebpackLoader(source: string): string {
  return mdToReactServer.renderSourceToOutput(source);
}
