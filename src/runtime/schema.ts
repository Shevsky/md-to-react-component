// Будет заменено в процессе компиляции с помощью VirtualModulesPlugin

import { type ComponentType } from 'react';
import { type FullSchema } from './../types';

throw new Error('You need to turn on MdToReactWebpackPlugin for use Markdown component');

declare const externals: Record<string, Record<string, ComponentType<any>>>;
declare const schema: FullSchema;

export { externals, schema };
