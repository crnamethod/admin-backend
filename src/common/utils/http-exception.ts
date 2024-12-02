export class HttpException extends Error {
  statusCode: number;
  code?: string;
  validationContext?: any;
  validation?: any[];
  cause?: unknown;

  constructor(message: string, statusCode: number, options?: HttpExceptionOptions) {
    // Call the parent class (Error) constructor
    super(message);

    // Assign properties to the HttpException instance
    this.statusCode = statusCode;
    this.code = options?.code;
    this.validationContext = options?.validationContext;
    this.validation = options?.validation;
    this.cause = options?.cause;

    // Capture the stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

// Interface to define optional properties for HttpException
interface HttpExceptionOptions {
  code?: string;
  validationContext?: any;
  validation?: any[];
  cause?: unknown;
}
