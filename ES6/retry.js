import 'babel-polyfill';

function enter(str1, str2) {
  return new Promise((resolve, reject) => {
      let random = Math.random();
  if (random > 0.5) {
    reject(new Error('failed, try again'));
  } else {
    resolve(str1 + str2 + ' : ' + random);
  }
});
}

function retry(fn, args, retryLeft = 3) {
  console.log('args: ', args);
  return fn.apply(null, args).catch(function(err) {
    console.log(fn.name + ' failed: ', err, 'retry left: ', retryLeft);
    if (retryLeft <= 0) {
      console.log('max retry approach');
      throw err;
    }
    return retry(fn, args, retryLeft - 1);
  });
}

function enterRetry() {
  return retry(enter, arguments);
}

enterRetry('name is ', 'jonathan').then((_) => {
  console.log('final', _);
}, (err) => console.log('wrapped err: ', err));