const superagent = require('superagent');

const getRepoData = () => {
  return new Promise((resolve, reject) => {
    superagent.get('https://api.github.com/repos/cpselvis/zhihu-crawler').end((err, sres) => {
      if (err) {
        reject(err);
      }
	console.log('2');
      resolve(sres);
    })
  }).then(()=>{ console.log('3') })
};

async function asyncFun() {
 try {
	console.log('1')
    const value = await getRepoData();
    // ... 和上面的yield类似，如果有多个异步流程，可以放在这里，比如
    // const r1 = await getR1();
    // const r2 = await getR2();
    // const r3 = await getR3();
    // 每个await相当于暂停，执行await之后会等待它后面的函数（不是generator）返回值之后再执行后面其它的await逻辑。
    return value;
  } catch (err) {
    console.log(err);
  }
}

asyncFun().then(function(){console.log('4')})
