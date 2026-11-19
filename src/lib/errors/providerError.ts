// AirAware AI V2 — Centralized Provider Error Handling

export type ErrorCode =
  | 'INVALID_COORDINATES'
  | 'MISSING_QUERY'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_HTTP_ERROR'
  | 'PROVIDER_UNREACHABLE'
  | 'EMPTY_RESPONSE'
  | 'PARSE_ERROR'
  | 'INSUFFICIENT_DATA';

export class ProviderError extends Error {
  public readonly code: ErrorCode;
  public readonly provider: string;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly timestamp: string;

  constructor(options: {
    message: string;
    code: ErrorCode;
    provider: string;
    statusCode?: number;
    retryable?: boolean;
    cause?: unknown;
  }) {
    super(options.message);
    this.name = 'ProviderError';
    this.code = options.code;
    this.provider = options.provider;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
    this.timestamp = new Date().toISOString();

    if (options.cause && typeof (Error as unknown as { captureStackTrace?: unknown }).captureStackTrace === 'function') {
      (Error as unknown as { captureStackTrace: (target: object, constructor: unknown) => void }).captureStackTrace(this, ProviderError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      provider: this.provider,
      statusCode: this.statusCode,
      retryable: this.retryable,
      timestamp: this.timestamp,
    };
  }
}
