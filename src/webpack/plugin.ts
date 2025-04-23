import webpack from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { mdToReactServer } from './defaults';

const cjsSchemaPath = require.resolve('./../../cjs/runtime/schema');
const esSchemaPath = require.resolve('./../../es/runtime/schema');

export class MdToReactWebpackPlugin {
  private _vmp?: VirtualModulesPlugin;

  get vmp(): VirtualModulesPlugin {
    if (!this._vmp) {
      this._vmp = new VirtualModulesPlugin({
        [cjsSchemaPath]: mdToReactServer.renderSchemaToOutput('commonjs'),
        [esSchemaPath]: mdToReactServer.renderSchemaToOutput('es')
      });
    }

    return this._vmp;
  }

  apply(compiler: webpack.Compiler): void {
    const vmp = this.vmp;

    return vmp.apply.apply(vmp, [compiler]);
  }
}
