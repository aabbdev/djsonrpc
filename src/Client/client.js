const uniqueId = require("hyperid")();
const axios = require("axios");
const validate = require('./schema');
const {
  ClientError,
  TimeoutError,
  InvalidResponseError,
  InvalidRequestError,
  MethodNotFoundError,
  ParseError,
  InvalidParamsError,
  InternalError
} = require('./errors');

module.exports = (baseURL, timeout=3000) => {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  });
  return new Proxy(() => {}, {
    get(t, method) {
      return (...params) => {
        // handle client error
        return client.post("/", {
          jsonrpc: "2.0",
          method,
          params,
          id: uniqueId(),
        }).then(res => {
          if(!validate(res.data)) throw new InvalidResponseError();

          const { id, result, error } = res.data;
          if(error) {
            const { code, message, data } = error;
            switch(code){
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
              case -32700: { // Parse error	
                throw new ParseError(message);
              }
            }
          }else if(result){
            return result;
          }else{
            throw new InvalidResponseError();
          }
        }).catch(err => {
          switch(err.code){
            case "ECONNABORTED": {
              throw new TimeoutError();
            }
            default: {
              throw new ClientError();
            }
          }
        });
      };
    },
    set() {
      throw new Error("cannot set values");
    },
  });
};
