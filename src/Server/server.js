const _ = require('lodash');
const assert = require('assert');
const { wrapAsync } = require('./utils');
const validate = require('./schema');
const { default: Ajv } = require('ajv');
const ajv = new Ajv();

module.exports = (methods) => {
  assert(methods, "requires methods");

  const internals = _.reduce(Object.entries(methods), (prev, [key, value]) => {
    assert(typeof key == "string", "the key should be a string");
    assert(typeof value == "function", "the value should be a function");

    const [func, schema] = _.castArray(value);
    let compiledSchema;
    if(schema){
      compiledSchema = ajv.compile(schema)
    }
    if(func.constructor.name === "Function") {
      prev.set(key, [wrapAsync(func), compiledSchema]);
    }else{
      prev.set(key, [func, compiledSchema]);
    }
    return prev;
  }, new Map());

  const handler = async(frame) => {
    if(!validate(frame)) return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } }
    
    const { id, method, params, ...props } = frame;
    if(!internals.has(method)) return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } }
    // TODO: make batch
    const ctx = {
      ...props,
      id,
    }
    const [func,validatorParams] = internals.get(method);
    if(validatorParams && !validatorParams(params)){
      return { jsonrpc: "2.0", id, error: { code: -32602, message: "Invalid params" }}
    }
    return func.apply(ctx, _.castArray(params))
      .then(result => ({ result }))
      .catch(({ message, code, stack }) => ({ error: { code: -1, message, data: { code, stack } } }))
      .then(result => ({ jsonrpc: "2.0", id, ...result }));
  }

  return [handler]
}