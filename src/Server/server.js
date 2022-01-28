const _ = require('lodash');
const assert = require('assert');
const { wrapAsync } = require('./utils');
const validate = require('./schema');

module.exports = (methods) => {
  assert(methods, "requires methods");
  const internals = _.reduce(Object.entries(methods), (prev, [key, value]) => {
    assert(typeof key == "string", "the key should be a string");
    assert(typeof value == "function", "the value should be a function");
    if(value.constructor.name === "Function") {
      prev.set(key, wrapAsync(value));
    }else{
      prev.set(key, value);
    }
    return prev;
  }, new Map());

  return async(req, res) => {
    const rawFrame = req.body;
    
    if(!validate(rawFrame)) return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } }
    const { id, method, params } = rawFrame;
    if(!internals.has(method)) return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } }
    
    return internals.get(method).apply({ id }, _.castArray(params))
      .then(result => ({ result }))
      .catch(({ message, code, stack }) => ({ error: { code: -1, message, data: { code, stack } } }))
      .then(result => ({ jsonrpc: "2.0", id, ...result }));
  }
}