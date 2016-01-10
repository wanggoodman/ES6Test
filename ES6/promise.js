import 'babel-polyfill';

// 静态调用resolve方法,直接创造一个settled的promise,可以用在promise且结果确定的场景
function staticResolve() {
  return Promise.resolve('staticResolve: static resolve');
}

(function() {
  staticResolve().then(function(_) {
    console.log(_);
  }).catch(function(_) {
    console.log(_);
  });
})();