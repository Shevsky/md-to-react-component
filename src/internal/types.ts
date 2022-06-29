/** @internal */
export type AnyElementDeclaration =
  | StringElementDeclaration
  | NullElementDeclaration
  | ComponentElementDeclaration
  | RawElementDeclaration;

/** @internal */
export type StringElementDeclaration = string;

/** @internal */
export type NullElementDeclaration = null;

/** @internal */
export type ComponentElementDeclaration = {
  name: string;
  props: Record<string, any> | null;
  childs: Array<AnyElementDeclaration>;
};

/** @internal */
export type RawElementDeclaration = () => any;

/** @internal */
export type ImportDeclaration = {
  usedExports?: Map<string, string>;
  defaultExportAlias?: string;
};
