import 'babel-polyfill';

// 静态调用resolve方法,直接创造一个settled的promise,可以用在promise且结果确定的场景
function staticResolve() {
  return Promise.resolve('staticResolve: static resolve');
}

let execStaticResolve = function() {
  staticResolve().then((_) => {
    console.log(_);
  }).catch((_) => {
    console.log(_);
  });
};

// 错误捕获范例
let errResolve = function() {
  let err = function() {
    throw new Error('Some err in func err');
  };

  let errorUncaught = function() {
    return new Promise((resolve) => {
      resolve(err());
    });
  };

  let errorCaught = function() {
    return new Promise((resolve, reject) => {
      try {
        err();
        resolve('done');
      } catch (e) {
        console.log('Error caught in "errCaught"');
        reject(e);
      }
    });
  };

  errorUncaught().then((_) => { // 使用catch捕获错误
    console.log(_);
  }).catch((_) => {
    console.log("errorUncaught catch: " + _);
  });
  errorUncaught().then((_) => { // 使用onReject捕获错误
    console.log(_);
  }, (_) => {
    console.log("errorUncaught onReject: " + _);
  });
  errorCaught().then((_) => { // 使用promise内部自己的try catch,然后reject
    console.log(_);
  }).catch((_) => {
    console.log("errorCaught: " + _);
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
};

// 异步调用范例,即便立刻resolve,仍旧还是异步调用,还是要走异步堆栈
let asyncResolve = function() {
  let promise = new Promise(function (resolve){
    console.log("inner promise"); // 第一个打印
    resolve(42);
  });
  promise.then(function(value){
    console.log(value); // 第三个打印
  });
  console.log("outer promise"); // 第二个打印
};

// 链式调用,及其中的错误处理
let chainResolve = function() {
  let err = function() {
    throw new Error('Some err in func err');
  };

  let middle = function() {
    return Promise.resolve('middle done');
  };

  let final = function() {
    return Promise.resolve('final done');
  };

  Promise.resolve('first').then((_) => { // 也就是说,一个promise开头的链式结构,可以无限.then接下去,即便then的内容不返回promise
    console.log(_);
    console.log('second, even no promise function, can be set in "then"'); // 这里的打印顺序不出问题是因为他们不是异步的
    //noinspection JSValidateTypes
    return 'returned from first onResolved callback'; // 这个返回值在下一个.then的回调内是接收不到的,因为它既不是一个promise,也不是resolve
  }).then(() => {
    console.log("but the next step has no returned value: " + JSON.stringify(arguments));
    /**
     * 但是记住,即便链式.then可以无限连下去,里面如果不是使用return promise这样的方式来串联Promise的话,其中中间步骤的异步执行顺序是得不到保证的
     * .then(func1).then(func2).then(func3).then(func4)
     * 和顺序执行func1-4是没有差别的
     */
    (function() {
      setTimeout(() => {
        console.log('This message shall be printed later than "middle done"');
      }, 500); // 0.5s
    })();
    return Promise.resolve('This message shall be printed before "middle done"');
  }).then((_) => {
    console.log(_);
    return middle();
  }).then((_) => {
    console.log(_);
    return err();
  }).catch((_) => { // catch 前几步的错误
    console.log("first catch: " + _);
  }).then(final).then((_) => { // 错误处理完之后可以继续后面的内容执行
    console.log(_);
    return err();
  }).catch((_) => {
    console.log("second catch: " + _);
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
};

// 执行器
let exec = async function() {
  await execStaticResolve();
  await errResolve();
  await asyncResolve();
  await chainResolve();
};

exec();