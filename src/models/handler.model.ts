/* eslint-disable @typescript-eslint/no-explicit-any */
export type HttpStatusCode = 200 | 400 | 403 | 404 | 500;

export type HandlerResponse<TBODY> = {
  statusCode: HttpStatusCode;
  body: TBODY;
};

export class HandlerError {
  statusCode: HttpStatusCode;
  message: Uppercase<string>;
  error: any;

  constructor(statusCode: HttpStatusCode, message: Uppercase<string>, error?: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}
