import { ModuleType } from './../types';

export function moduleOutputBoilerplate(module: ModuleType = 'es'): string {
  switch (module) {
    case 'commonjs': {
      return '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n';
    }
    case 'es': {
      return '';
    }
    default: {
      return '';
    }
  }
}

export function moduleOutputDefaultExport(factory: string, module: ModuleType = 'es'): string {
  switch (module) {
    case 'commonjs': {
      return `exports.default = ${factory}`;
    }
    case 'es': {
      return `export default ${factory}`;
    }
    default: {
      return '';
    }
  }
}

export function moduleOutputExport(variable: string, module: ModuleType = 'es'): string {
  switch (module) {
    case 'commonjs': {
      return `exports.${variable} = ${variable};`;
    }
    case 'es': {
      return `export { ${variable} };`;
    }
    default: {
      return '';
    }
  }
}
