import 'babel-polyfill';

async function enter() {
  handle1();
  await handle2();
  //handle2();
  handle3();

  return 'enter finished!';
}

function handle1() {
  console.log('handle1 enter');
}

function handle2() {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('handle2 enter');
      resolve();
    }, 5000);
  });
}

function handle3() {
  console.log('handle3 enter');
}

enter().then((_) => {
  console.log('async/await always return a promise, even it has no promise statement in it: ', _);
}).catch((e) => {
  console.log('error? ', e);
});