import { ModuleType } from './../types';

export function moduleOutputBoilerplate(module: ModuleType = 'es'): string {
  switch (module) {
    case 'commonjs': {
      return [
        '"use strict";',
        'Object.defineProperty(exports, "__esModule", { value: true });',
        moduleOutputComment(module)
      ].join('\n');
    }
    case 'es': {
      return moduleOutputComment(module);
    }
    default: {
      return moduleOutputComment(module);
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

function moduleOutputComment(module: ModuleType = 'es'): string {
  return `/* md-to-react-component module output ${module} */`;
}
