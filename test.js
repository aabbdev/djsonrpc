const _ = require('lodash');
const { useClient, useServer } = require('.');
const fastify = require('fastify');
const axios = require('axios');

(async() => {
  // server
  const [handler] = useServer({
    testFunc: (a,b) => a*b
  });

  const app = fastify();
  app.post('/', async(req, res) => await handler(req.body))
  const endpoint = await app.listen(3000);
  console.log(`Listen on ${endpoint}`);

  // client
  const client = axios.create({
    baseURL: endpoint,
    timeout: 1000,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
  });

  const [rpc, ctx] = useClient(async(frame) => {
    const res = await client.post("/", frame);
    return res.data;
  });// http://127.0.0.1:3000
  
  // tests
  const start = Date.now();
  console.log("a*b", await rpc.testFunc(12,14))
  const end = Date.now()-start;
  console.log('Execution time: %dms', end);
})();