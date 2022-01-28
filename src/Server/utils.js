exports.wrapAsync = (func) => (...args) => new Promise((resolve, reject) => {
  try {
    resolve(func.apply({}, args));
  }catch(err) {
    reject(err);
  }
})