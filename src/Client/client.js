const uniqueId = require("hyperid")();
const validate = require('./schema');

const {
  InvalidResponseError,
  InvalidRequestError,
  MethodNotFoundError,
  InvalidParamsError,
  InternalError
} = require('./errors');

module.exports = (onRequest) => {
  const ctx = {}

  const handler = new Proxy(() => {}, {
    get(t, method) {
      return async (...params) => {
        // handle client error
        const frame = await onRequest({
          jsonrpc: "2.0",
          method,
          params,
          id: uniqueId(),
          ...ctx
        })
        if (!validate(frame)) throw new InvalidResponseError();

        const {
          id,
          result,
          error
        } = frame;
        if (error) {
          const {
            code,
            message,
            data
          } = error;
          switch (code) {
            case -1: {
              const err = new Error(message);
              err.stack = data.stack;
              err.code = data.code;
              throw err;
            }
            case -32600: { // Invalid request
              throw new InvalidRequestError(message);
            }
            case -32601: { // Method not found
              throw new MethodNotFoundError(message);
            }
            case -32602: {
              throw new InvalidParamsError(message);
            }
            case -32603: {
              throw new InternalError(message);
            }
          }
        } else if (result) {
          return result;
        } else {
          throw new InvalidResponseError();
        }
      };
    },
    set() {
      throw new Error("cannot set values");
    },
  });

  return [handler, ctx];
};