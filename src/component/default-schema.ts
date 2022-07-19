import { ComponentType } from 'react';
import { FullSchema } from './../types';

throw new Error('You need to turn on MdToReactWebpackPlugin for use Markdown component');

declare const externals: Record<string, Record<string, ComponentType<any>>>;
declare const schema: FullSchema;

export { externals, schema };
