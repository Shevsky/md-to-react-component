const isProduction = process.env.NODE_ENV === 'production';

class MdToReactError extends Error {
  name = 'MdToReactError ' as const;

  constructor(code: string, message?: string | false) {
    super(`MdToReactError ${code}${message ? `: ${message}` : ''}`);
  }
}

export class MissingPropertyError extends MdToReactError {
  constructor(readonly prop: string) {
    const code = '7001';

    super(code, !isProduction && `Missing "${prop}" property`);
  }
}

export class ExternalNotFoundError extends MdToReactError {
  constructor(readonly lib: string) {
    const code = '7002';

    super(code, !isProduction && `Not found external library "${lib}"`);
  }
}

export class ExternalExportNotFoundError extends MdToReactError {
  constructor(
    readonly lib: string,
    readonly usedExport: string
  ) {
    const code = '7003';

    super(code, !isProduction && `Not found external export "${usedExport}" for library "${lib}"`);
  }
}
