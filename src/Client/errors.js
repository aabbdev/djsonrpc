class ServerError extends Error {
  constructor(message) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
class ClientError extends Error {
  constructor(message) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}
class TimeoutError extends ClientError {}
class InvalidResponseError extends ClientError {}
class InvalidRequestError extends ServerError {}
class InvalidParamsError extends ServerError {}
class MethodNotFoundError extends ServerError {}
class ParseError extends ServerError {}
class InternalError extends ServerError {}
  
module.exports = {
  ServerError,
  ClientError,
  TimeoutError,
  InvalidResponseError,
  InvalidRequestError,
  InvalidParamsError,
  MethodNotFoundError,
  ParseError,
  InternalError,  
};
  