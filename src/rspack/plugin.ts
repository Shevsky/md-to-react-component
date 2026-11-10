import rspack, { Compiler } from '@rspack/core';
import { VirtualModulesPlugin } from '@rspack/core/dist/VirtualModulesPlugin';
import { mdToReactServer } from '../webpack/defaults';

const cjsSchemaPath = require.resolve('./../../cjs/runtime/schema');
const esSchemaPath = require.resolve('./../../es/runtime/schema');

export class MdToReactRspackPlugin {
  private _vmp?: VirtualModulesPlugin;

  get vmp(): VirtualModulesPlugin {
    if (!this._vmp) {
      this._vmp = new rspack.experiments.VirtualModulesPlugin({
        [cjsSchemaPath]: mdToReactServer.renderSchemaToOutput('commonjs'),
        [esSchemaPath]: mdToReactServer.renderSchemaToOutput('es')
      });
    }

    return this._vmp;
  }

  apply(compiler: Compiler): void {
    const vmp = this.vmp;

    return vmp.apply.apply(vmp, [compiler]);
  }
}
