import * as fs from 'fs';
import { mdToReactServer } from './defaults';
import type webpack from 'webpack';

const schemaPath = require.resolve('./../runtime/schema');

export class MdToReactWebpackPlugin {
  private readonly name: string = 'MdToReactWebpackPlugin';

  apply(compiler: webpack.Compiler): void {
    let applied: boolean = false;

    compiler.hooks.beforeCompile.tap(this.name, (compilation) => {
      if (!applied) {
        applied = true;
        fs.writeFileSync(schemaPath, mdToReactServer.renderSchemaToOutput());
      }
    });
  }
}
