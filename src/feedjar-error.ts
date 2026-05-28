/** Error categories aligned with iOS `FeedJarError`. */
export enum FeedJarErrorCode {
  notConfigured = "notConfigured",
  validation = "validation",
  invalidResponse = "invalidResponse",
  server = "server",
}

/** Thrown when configuration, validation, or HTTP handling fails. */
export class FeedJarException extends Error {
  readonly name = "FeedJarException";

  constructor(
    readonly code: FeedJarErrorCode,
    message: string,
    readonly statusCode?: number,
    readonly responseBody?: string,
  ) {
    super(message);
  }

  override toString(): string {
    return `FeedJarException(${this.code}): ${this.message}`;
  }
}

export function isFeedJarException(error: unknown): error is FeedJarException {
  return error instanceof FeedJarException;
}
