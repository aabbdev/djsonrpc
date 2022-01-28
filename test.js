const _ = require('lodash');
const { Client, Server } = require('.');
const fastify = require('fastify');

(async() => {
  // env
  const app = fastify();
  app.post('/', Server({
    testFunc(a,b) {
      return a*b
    }
  }))
  const endpoint = await app.listen(3000);
  console.log(`Listen on ${endpoint}`);
  const agent = Client(endpoint); // http://127.0.0.1:3000
  // tests
  const start = Date.now();
  console.log("a*b", await agent.testFunc(12,14))
  const end = Date.now()-start;
  console.log('Execution time: %dms', end);
})();