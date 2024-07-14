export class KnownError extends Error {
  public readonly code?: string;

  constructor(
    public readonly message: string,
    code?: string
  ) {
    super(message);
    this.code = code;
  }
}
