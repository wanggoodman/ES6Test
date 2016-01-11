import 'babel-polyfill';

// ------------------------------------------------------------------------------------------------------------------------
// 静态调用resolve方法,直接创造一个settled的promise,可以用在promise且结果确定的场景
function staticResolve() {
  return Promise.resolve('staticResolve: static resolve');
}

let execStaticResolve = function() {
  console.log('-----------------------------');
  staticResolve().then((_) => {
    console.log(_);
  }).catch((_) => {
    console.log(_);
  });
};

// ------------------------------------------------------------------------------------------------------------------------
// 错误捕获范例
let errResolve = function() {
  console.log('-----------------------------');
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
  errorUncaught().then((_) => { // 使用onRejected捕获错误
    console.log(_);
  }, (_) => {
    console.log("errorUncaught onRejected: " + _);
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

// ------------------------------------------------------------------------------------------------------------------------
// 异步调用范例,即便立刻resolve,仍旧还是异步调用,还是要走异步堆栈
let asyncResolve = function() {
  console.log('-----------------------------');
  let promise = new Promise(function (resolve){
    console.log("inner promise"); // 第一个打印
    resolve(42);
  });
  promise.then(function(value){
    console.log(value); // 第三个打印
  });
  console.log("outer promise"); // 第二个打印
};

// ------------------------------------------------------------------------------------------------------------------------
// 链式调用,及其中的错误处理
let chainResolve = function() {
  console.log('-----------------------------');
  let err = function() {
    throw new Error('Some err in func err');
  };

  let middle = function() {
    return Promise.resolve('middle done');
  };

  let final = function() {
    //noinspection JSValidateTypes
    return 'final done'; // 看看这个的打印结果,其实和上面是一样的,理由下面会说到
  };

  Promise.resolve('first').then((_) => { // 也就是说,一个promise开头的链式结构,可以无限.then接下去,即便then的内容不返回promise
    console.log(_);
    console.log('second, even no promise function, can be set in "then"'); // 这里的打印顺序不出问题是因为他们不是异步的
    /**
     * 这个返回值在下一个.then的回调内是可以接收到的,return静态数值等于是返回了一个Promise.resolve('...'),但是产品上不建议这么写,容易造成歧义和误解
     * 每次return都会返回一个重新被包装过的Promise
     */
    //noinspection JSValidateTypes
    return '"RETURNED FROM first onResolv callback"';
  }).then((_) => {
    console.log("next step can get the returned value, even it's a simple string returned, not a Promise returned: " + _ + " " + arguments.length);
    /**
     * 但是记住,即便链式.then可以无限连下去,里面如果不是使用return promise这样的方式来串联Promise的话,其中中间步骤的异步执行顺序是得不到保证的
     * .then(func1).then(func2).then(func3).then(func4),如果中间没有使用return串联起来,或者执行过程中使用了异步,其结果和顺序执行func1-4是没有差别的
     */
    (function() {
      setTimeout(() => {
        console.log('This message shall be printed later than "middle done"'); // 看看这句话的打印位置
      }, 500); // 0.5s
    })();
    return Promise.resolve('This message shall be printed before "middle done"');
  }).then((_) => {
    console.log(_);
    return middle();
  }).then((_) => {
    console.log(_);
    err();
    return Promise.resolve('Message in error function, shall not been printed');
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

// ------------------------------------------------------------------------------------------------------------------------
// 并行的Promise执行
let parallelResolve = function() {
  console.log('-----------------------------');
  /**
   * Promise.all : 所有执行中的promise,所有都完成或其中任何一个被拒绝,则完成
   * Promise.race : 所有执行中的promise,只要一个状态变化,就结束(无论是否是完成还是拒绝)
   * Promise.settle : 所有执行中的promise,所有的状态都变化,即便有拒绝,也会等到所有的都执行完成状态变化
   */
  let step1 = function() {
    return Promise.resolve('step1 done');
  };
  let step2 = function() {
    return Promise.resolve('step2 done');
  };
  let step3 = function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('step3 done');
      }, 500);
    });
  };
  let step4 = function() {
    return Promise.resolve('step4 done');
  };
  let err1 = function() {
    throw new Error('Some err in func err1');
  };
  let err2 = function() {
    return Promise.reject(new Error('Some err in func err2'));
  };
  let err3 = function() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Some err in func err3'));
      }, 1000);
    });
  };

  Promise.all([step1(), step2(), step3(), step4()]).then((_) => {
    // 可以看到加了延时的step3的返回位置还是在第三位,说明返回的时候是按"槽位"来的,而不是执行完成顺序,它们是同时开始,等最后一个执行结束统一返回的
    let [sr1, sr2, sr3, sr4] = _; // 稍微尝试下这种写法,都是合法的
    console.log('all1 finished: ', _, sr1, sr2, sr3, sr4);
  }).catch((_) => {
    console.log('catch1: ' + _);
  });

  Promise.all([step1(), step2(), step4(), err3()]).then((_) => {
    console.log('all2 finished: ', _);
  }).catch((_) => {
    // 执行函数step1 2 4都是同步的,且出错的err3是异步的,但是正确的结果仍旧没有得到返回,可以印证all的执行理念: 要么全对,要么就全错,即便出错的是最后一个亦如此
    console.log('catch2: ' + _);
  });

  Promise.all([step1(), step2(), err2(), step3(), step4()]).then((_) => {
    console.log('all3 finished: ', _);
  }).catch((_) => {
    // 错误被打印出来,完成的则不会
    console.log('catch3: ' + _);
  });

  //Promise.all([step1(), step2(), err1(), step3(), step4()]).then((_) => {
  //  console.log('all4 finished: ', _);
  //}).catch((_) => {
  //  /**
  //   * 这个Promise.all的catch4不会被打印出来,因为err1是直接抛出错误,而不是改变Promise的状态到拒绝
  //   * Promise.all的执行会即刻终止,因为某一个并行的Promise内部中断了,但是onFulfilled和onRejected或catch事件都不会得到返回
  //   * 因此这种抛错方法一定要避免,如果是使用别人的代码的话,需要使用try catch,包裹不确定的代码块,然后使用自己catch到的错误进行手动的reject
  //   * 这部分的逻辑和直接使用Promise不同,因此一定要小心
  //   *
  //   * NOTE: 要尝试这部分代码的时候请注释掉其他的代码执行,单独执行该代码块,否则由于内部未捕获的错误,进程会静默退出,其他的代码执行会受到影响
  //   */
  //  console.log('catch4: ' + _);
  //});

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1500);
  });
};

// ------------------------------------------------------------------------------------------------------------------------
// 并行的Promise执行
let errorHanlding = function() {
  console.log('-----------------------------');
  function throwError(value) {
    // 抛出异常
    throw new Error(value);
  }
  // <1> onRejected不会被调用
  function badMain(onRejected) {
    // 和onFulfilled同一级的onRejected是无法捕获onFulfilled业务中发生的错误的,必须到其下一级才可以,或者索性编写.catch来捕获
    //noinspection JSValidateTypes
    return Promise.resolve(42).then(throwError, onRejected);
  }
  // <2> 有异常发生时onRejected会被调用
  function goodMain(onRejected) {
    return Promise.resolve(42).then(throwError).catch(onRejected);
  }
  // 运行示例
  return new Promise((resolve) => {
    badMain(function() {
      console.log("BAD");
    });
    goodMain(function() {
      console.log("GOOD");
    });
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

// ------------------------------------------------------------------------------------------------------------------------
// 执行器
let exec = async function() {
  await execStaticResolve();
  await errResolve();
  await asyncResolve();
  await chainResolve();
  await parallelResolve();
  await errorHanlding();
};

exec();